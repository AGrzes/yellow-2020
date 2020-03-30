import * as _ from 'lodash'
import { Class, StructuralFeature, ModelAccess, Relation } from '../metadata'
import { DataWrapper, DataAccess } from '../data'
import { isRelation } from '../metadata/simple'


export interface Model {
    metaModel: ModelAccess
    get(type: Class, key: string): object
    resolve(path: string): object
    list(type: Class): object[]
    create(type: Class): object
    set(instance: object, feature: StructuralFeature, value: any): void
    add(instance: object, feature: StructuralFeature, value: any): void
    clear(instance: object, feature: StructuralFeature): void
    delete(instance: object): void
}

export interface TypedDataWrapper<DataType,KeyType,OptCounterType>  extends DataWrapper<DataType,KeyType,OptCounterType> {
    type: Class
}

export interface TypedDataAccess<DataType,KeyType,OptCounterType, QueryType> extends DataAccess<DataType,KeyType,OptCounterType, QueryType> {
    get(key: KeyType, optCounter?: OptCounterType): Promise<TypedDataWrapper<DataType,KeyType,OptCounterType>>
    list(query?: QueryType): Promise<TypedDataWrapper<DataType,KeyType,OptCounterType>[]>
}

interface ModelEntry {
    type: Class
    raw: object
    model: object
    key: string
    optCounter?: string
}


export async function setupModel(metaModel: ModelAccess, dataAccess: TypedDataAccess<object,string,string,never>[]): Promise<Model> {
    const entries: ModelEntry[] =_.map(_.flatten(await Promise.all(_.map(dataAccess,(da) => da.list()))),({type,data,key,optCounter})=>({
        type,raw: data, model: _.cloneDeep(data),key,optCounter
    }))
    const classMap = new Map<Class,{[key: string]: ModelEntry}>()
    _.forEach(entries, (entry) => {
        if (!classMap.has(entry.type)) {
            classMap.set(entry.type,{[entry.key]:entry})
        } else {
            classMap.get(entry.type)[entry.key]=entry
        }
    })

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
                                _.forEach(entry.model[feature.name],(target)=> target[feature.reverse.name] = [entry.model])
                            } else {
                                _.forEach(entry.model[feature.name],(target)=> target[feature.reverse.name] = entry.model)
                            }
                        }
                    } else {
                        entry.model[feature.name] = get(feature.target, entry.raw[feature.name])
                        if (feature.reverse) {
                            if (isCollection(feature.reverse)) {
                                entry.model[feature.name][feature.reverse.name] = [entry.model]
                            } else {
                                entry.model[feature.name][feature.reverse.name] = entry.model
                            }
                        }
                    }
                }
            }
        })
    }
    _.forEach(entries,resolveRelations)

    return {
        metaModel,
        list(type: Class) {
            return _.map(_.values(classMap.get(type)),'model')
        },
        get
    } as Model
}