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


export async function setupModel(metaModel: ModelAccess, dataAccess: TypedDataAccess<object,string,string,never>[]): Promise<Model> {
    const entries =_.flatten(await Promise.all(_.map(dataAccess,(da) => da.list())))
    const classMap = new Map<Class,{[key: string]: TypedDataWrapper<object,string,string>}>()
    _.forEach(entries, (entry) => {
        if (!classMap.has(entry.type)) {
            classMap.set(entry.type,{[entry.key]:entry})
        } else {
            classMap.get(entry.type)[entry.key]=entry
        }
    })

    function get(type: Class, key:string) {
        return _.get(_.get(classMap.get(type),key),'data')
    }

    function isCollection(relation: Relation): boolean {
        return relation.multiplicity === '*' || relation.multiplicity === '+'
    }

    function resolveRelations(entry: TypedDataWrapper<object,string,string>) {
        _.forEach(entry.type.features, (feature) => {
            if (isRelation(feature)) {
                if (entry.data[feature.name]) {
                    if (isCollection(feature)){
                        entry.data[feature.name] = _.map(entry.data[feature.name],(key)=>  get(feature.target, key))
                    } else {
                        entry.data[feature.name] = get(feature.target, entry.data[feature.name])
                    }
                }
            }
        })
    }
    _.forEach(entries,resolveRelations)

    return {
        metaModel,
        list(type: Class) {
            return _.map(_.values(classMap.get(type)),'data')
        },
        get
    } as Model
}