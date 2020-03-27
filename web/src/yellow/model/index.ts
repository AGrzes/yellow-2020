import * as _ from 'lodash'
import { Class, StructuralFeature, ModelAccess } from '../metadata'
import { DataWrapper, DataAccess } from '../data'


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
    const classMap = new Map<Class,TypedDataWrapper<object,string,string>[]>()
    _.forEach(entries, (entry) => {
        if (!classMap.has(entry.type)) {
            classMap.set(entry.type,[entry])
        } else {
            classMap.get(entry.type).push(entry)
        }
    })

    return {
        metaModel,
        list(type: Class) {
            return _.map(classMap.get(type),'data')
        }
    } as Model
}