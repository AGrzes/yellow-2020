/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-mapreduce" />
import { Store } from 'vuex';
import { PouchDBDataAccess } from '@agrzes/yellow-2020-common-data-pouchdb';
import { TypedDataAccess, Model } from '@agrzes/yellow-2020-common-model';
import { Class, ModelAccess } from '@agrzes/yellow-2020-common-metadata';
import { ModelStateAdapter } from './model';
import { DataAccess } from '@agrzes/yellow-2020-common-data/types';
export interface StateConfig {
    metadata: string;
    data: {
        [url: string]: string;
    };
    stores: {
        [name: string]: string;
    };
}
declare type SetupMetadata = (config: string) => Promise<ModelAccess>;
declare type SetupModleAccess<T> = (dataAccess: DataAccess<T, string, string, void>) => Promise<ModelAccess>;
declare type SetupDataAccess<T> = (url: string) => DataAccess<T, string, string, void>;
declare type SetupTypedDataAccess<T> = (type: Class, wrapped: DataAccess<T, string, string, void>) => TypedDataAccess<T, string, string, void>;
declare type SetupModel = (metaModel: ModelAccess, dataAccess: TypedDataAccess<object, string, string, never>[]) => Promise<Model>;
declare type SetupModelStateAdapter = (model: Model) => ModelStateAdapter;
export declare function setupSetupModelStateAdapter(): SetupModelStateAdapter;
export declare function setupSetupDataAccess<T extends object>(constructPouchDb: new (url: string) => PouchDB.Database<T>, constructPouchDBDataAccess: new (database: PouchDB.Database<T>) => PouchDBDataAccess<T>): SetupDataAccess<T>;
export declare function setupSetupMetadata(setupDataAccess: SetupDataAccess<any>, setupModleAccess: SetupModleAccess<any>): SetupMetadata;
export declare function setupStore(setupMetadata: SetupMetadata, setupDataAccess: SetupDataAccess<any>, setupTypedDataAccess: SetupTypedDataAccess<any>, setupModel: SetupModel, setupModelStateAdapter: SetupModelStateAdapter): (config: StateConfig) => Promise<Store<unknown>>;
export declare const store: (config: StateConfig) => Promise<Store<unknown>>;
export {};
