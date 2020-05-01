export declare enum ConflictMode {
    skip = 0,
    override = 1,
    error = 2
}
export interface DataWrapper<DataType, KeyType, OptCounterType> {
    data: DataType;
    key: KeyType;
    optCounter?: OptCounterType;
}
export interface DataAccess<DataType, KeyType, OptCounterType, QueryType> {
    get(key: KeyType, optCounter?: OptCounterType): Promise<DataWrapper<DataType, KeyType, OptCounterType>>;
    set(key: KeyType, value: DataType, optCounter?: OptCounterType): Promise<OptCounterType>;
    update(key: KeyType, value: DataType, conflict?: ConflictMode): any;
    merge(key: KeyType, value: DataType, merge: (a: DataType, b: DataType) => DataType): any;
    delete(key: KeyType, optCounter?: OptCounterType): any;
    list(query?: QueryType): Promise<DataWrapper<DataType, KeyType, OptCounterType>[]>;
}
