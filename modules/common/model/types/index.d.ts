import { Class, StructuralFeature, ModelAccess } from '@agrzes/yellow-2020-common-metadata';
import { DataWrapper, DataAccess } from '@agrzes/yellow-2020-common-data';
export interface Model {
    metaModel: ModelAccess;
    get(type: Class, key: string): object;
    resolve(path: string): object;
    list(type: Class): object[];
    map(type: Class): {
        [key: string]: object;
    };
    create(type: Class): object;
    set(instance: object, feature: StructuralFeature, value: any): void;
    add(instance: object, feature: StructuralFeature, value: any): void;
    clear(instance: object, feature: StructuralFeature): void;
    raw(type: Class, key: string): object;
    raw(type: Class, key: string, value: object): Promise<void>;
    delete(type: Class, key: string): Promise<void>;
}
export interface TypedDataWrapper<DataType, KeyType, OptCounterType> extends DataWrapper<DataType, KeyType, OptCounterType> {
    type: Class;
}
export interface TypedDataAccess<DataType, KeyType, OptCounterType, QueryType> extends DataAccess<DataType, KeyType, OptCounterType, QueryType> {
    get(key: KeyType, optCounter?: OptCounterType): Promise<TypedDataWrapper<DataType, KeyType, OptCounterType>>;
    list(query?: QueryType): Promise<TypedDataWrapper<DataType, KeyType, OptCounterType>[]>;
    types: Class[];
}
export declare function simpleTypedDataAccess<DataType, KeyType, OptCounterType, QueryType>(type: Class, wrapped: DataAccess<DataType, KeyType, OptCounterType, QueryType>): TypedDataAccess<DataType, KeyType, OptCounterType, QueryType>;
export declare function setupModel(metaModel: ModelAccess, dataAccess: TypedDataAccess<object, string, string, never>[]): Promise<Model>;
