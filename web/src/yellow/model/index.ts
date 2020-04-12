import * as _ from 'lodash'
import { Class, StructuralFeature, ModelAccess, Relation } from '../metadata'
import { DataWrapper, DataAccess } from '../data'
import { isRelation } from '../metadata/simple'


export interface Model {
    metaModel: ModelAccess
    get(type: Class, key: string): object
    resolve(path: string): object
    list(type: Class): object[]
    map(type: Class): {[key: string]:object}
    create(type: Class): object
    set(instance: object, feature: StructuralFeature, value: any): void
    add(instance: object, feature: StructuralFeature, value: any): void
    clear(instance: object, feature: StructuralFeature): void
    raw(type: Class, key: string): object
    raw(type: Class, key: string, value: object): Promise<void>
    delete(instance: object): void
}

export interface TypedDataWrapper<DataType,KeyType,OptCounterType>  extends DataWrapper<DataType,KeyType,OptCounterType> {
    type: Class
}

export interface TypedDataAccess<DataType,KeyType,OptCounterType, QueryType> extends DataAccess<DataType,KeyType,OptCounterType, QueryType> {
    get(key: KeyType, optCounter?: OptCounterType): Promise<TypedDataWrapper<DataType,KeyType,OptCounterType>>
    list(query?: QueryType): Promise<TypedDataWrapper<DataType,KeyType,OptCounterType>[]>
    types: Class[]
}

interface ModelEntry {
    type: Class
    raw: object
    model: object
    key: string
    optCounter?: string
}

function merge<T>(array:T[], item: T ): T[]{
    if (array) {
        array.push(item)
        return array
    } else {
        return [item]
    }
}

export function simpleTypedDataAccess<DataType,KeyType,OptCounterType, QueryType>(type: Class, wrapped: DataAccess<DataType,KeyType,OptCounterType, QueryType>): TypedDataAccess<DataType,KeyType,OptCounterType, QueryType> {
    const result = {
        async get(key: KeyType, optCounter?: OptCounterType) {
            return {
                ...await wrapped.get(key,optCounter),
                type
            }
        },
        async list(query?: QueryType) {
            return _.map(await wrapped.list(query),(x) => ({...x,type}))
        },
        types: [type]
    } as TypedDataAccess<DataType,KeyType,OptCounterType, QueryType>
    Object.setPrototypeOf(result, wrapped)
    return result
}


export async function setupModel(metaModel: ModelAccess, dataAccess: TypedDataAccess<object,string,string,never>[]): Promise<Model> {
    const entries: ModelEntry[] =_.map(_.flatten(await Promise.all(_.map(dataAccess,(da) => da.list()))),({type,data,key,optCounter})=>({
        type,raw: data, model: _.cloneDeep(data),key,optCounter
    }))
    const accessMap = new Map<Class, TypedDataAccess<object,string,string,never>[]>()
    _.forEach(dataAccess, (da) => {
        _.forEach(da.types,(type)=> {
            if (!accessMap.has(type)) {
                accessMap.set(type,[da])
            } else {
                accessMap.get(type).push(da)
            }
        })
     })

    function dataAcceddForClass(type: Class): TypedDataAccess<object,string,string,never> {
        return _.first(accessMap.get(type))
    }
    const classMap = new Map<Class,{[key: string]: ModelEntry}>()
    function rebuildModel() {
        _.forEach(entries, (entry) => {
            if (!classMap.has(entry.type)) {
                classMap.set(entry.type,{[entry.key]:entry})
            } else {
                classMap.get(entry.type)[entry.key]=entry
            }
        })

        _.forEach(entries,resolveRelations)
    }
    rebuildModel()

    function get(type: Class, key:string) {
        return _.get(_.get(classMap.get(type),key),'model')
    }

    function isCollection(relation: Relation): boolean {
        return relation.multiplicity === '*' || relation.multiplicity === '+'
    }

    function resolveRelations(entry: ModelEntry) {
        _.forEach(entry.type.features, (feature) => {
            if (isRelation(feature)) {
                if (entry.raw[feature.name]) {
                    if (isCollection(feature)){
                        entry.model[feature.name] = _.map(entry.raw[feature.name],(key)=>  get(feature.target, key))
                        if (feature.reverse) {
                            if (isCollection(feature.reverse)) {
                                _.forEach(entry.model[feature.name],(target)=> target[feature.reverse.name] = merge(target[feature.reverse.name],entry.model))
                            } else {
                                _.forEach(entry.model[feature.name],(target)=> target[feature.reverse.name] = entry.model)
                            }
                        }
                    } else {
                        entry.model[feature.name] = get(feature.target, entry.raw[feature.name])
                        if (feature.reverse) {
                            if (isCollection(feature.reverse)) {
                                entry.model[feature.name][feature.reverse.name] = merge(entry.model[feature.name][feature.reverse.name],entry.model)
                            } else {
                                entry.model[feature.name][feature.reverse.name] = entry.model
                            }
                        }
                    }
                }
            }
        })
    }

    function rawGet(type: Class, key: string): object {
        return _.get(_.get(classMap.get(type),key),'raw')
    }


    async function rawSet(type: Class, key: string, value: object): Promise<void> {
        let entry: ModelEntry = _.get(classMap.get(type),key)
        if (!entry) {
            entry = {type,raw: value, model: _.cloneDeep(value),key}
            entries.push(entry)
        } else {
            entry.raw = value
            entry.model = _.cloneDeep(value)
        }
        const da = dataAcceddForClass(type)
        if (da) {
            entry.optCounter = await da.set(entry.key,entry.raw,entry.optCounter)
        }
        rebuildModel()
    }

    function raw(type: Class, key: string, value?: object): Promise<void>|object {
        if (value) {
            return rawSet(type,key,value)
        } else {
            return rawGet(type,key)
        }
    }
    return {
        metaModel,
        list(type: Class) {
            return _.map(_.values(classMap.get(type)),'model')
        },
        map(type: Class) {
            return _.mapValues(classMap.get(type),'model')
        },
        get,
        raw
    } as Model
}