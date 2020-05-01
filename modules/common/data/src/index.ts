export enum ConflictMode {
    skip,
    override,
    error
}

export interface DataWrapper<DataType,KeyType,OptCounterType> {
    data: DataType
    key: KeyType
    optCounter?: OptCounterType
}

export interface DataAccess<DataType,KeyType,OptCounterType, QueryType> {
    get(key: KeyType, optCounter?: OptCounterType): Promise<DataWrapper<DataType,KeyType,OptCounterType>>
    set(key: KeyType, value: DataType, optCounter?: OptCounterType): Promise<OptCounterType>
    update(key: KeyType, value: DataType, conflict?: ConflictMode)
    merge(key: KeyType, value: DataType, merge: (a: DataType, b: DataType) => DataType)
    delete(key: KeyType, optCounter?: OptCounterType)
    list(query?: QueryType): Promise<DataWrapper<DataType,KeyType,OptCounterType>[]>
}