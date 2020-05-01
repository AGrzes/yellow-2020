/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-adapter-http" />
/// <reference types="pouchdb-adapter-memory" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-mapreduce" />
import { DataAccess, ConflictMode, DataWrapper } from '@agrzes/yellow-2020-common-data';
export declare const PouchDB: PouchDB.Static;
export declare class PouchDBDataAccess<DataType extends object> implements DataAccess<DataType, string, string, void> {
    private db;
    get(key: string, optCounter?: string): Promise<DataWrapper<DataType, string, string>>;
    set(key: string, value: DataType, optCounter?: string): Promise<string>;
    update(key: string, value: DataType, conflict?: ConflictMode): Promise<void>;
    merge(key: string, value: DataType, merge: (a: DataType, b: DataType) => DataType): Promise<void>;
    delete(key: string, optCounter?: string): Promise<void>;
    list(query?: void): Promise<DataWrapper<DataType, string, string>[]>;
    constructor(db: PouchDB.Database<DataType>);
}
