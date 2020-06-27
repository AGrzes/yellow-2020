import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import { DataAccess } from '@agrzes/yellow-2020-common-data/types'
import { Class, ModelAccess, SimpleModelAccess } from '@agrzes/yellow-2020-common-metadata'
import { Model, setupModel as setupModelImpl,
  SimpleTypedDataAccess, TypedDataAccess } from '@agrzes/yellow-2020-common-model'
import * as _ from 'lodash'
import Vuex, { Store } from 'vuex'
import { ModelStateAdapter } from './model'

export interface StateConfig {
    metadata: string
    data: {
        [url: string]: string
    }
    stores: {
        [name: string]: string
    }
}

type SetupMetadata = (config: string) => Promise<ModelAccess>
type SetupModleAccess<T> = (dataAccess: DataAccess<T, string, string, void>) => Promise<ModelAccess>
type SetupDataAccess<T> = (url: string) => DataAccess<T, string, string, void>
type SetupTypedDataAccess<T> = (type: Class, wrapped: DataAccess<T, string, string, void>) =>
  TypedDataAccess<T, string, string, void>
type SetupModel = (metaModel: ModelAccess, dataAccess: Array<TypedDataAccess<object, string, string, never>>) =>
  Promise<Model>
type SetupModelStateAdapter = (model: Model) => ModelStateAdapter

export function setupSetupModelStateAdapter(): SetupModelStateAdapter {
  return (model: Model) => new ModelStateAdapter(model)
}

export function setupSetupDataAccess<T extends object>(
  constructPouchDb: new (url: string) => PouchDB.Database<T>,
  constructPouchDBDataAccess: new (database: PouchDB.Database<T>) => PouchDBDataAccess<T>): SetupDataAccess<T> {
  return (url: string) => new constructPouchDBDataAccess(new constructPouchDb(url))
}

export function setupSetupMetadata(
  setupDataAccess: SetupDataAccess<any>,
  setupModleAccess: SetupModleAccess<any>): SetupMetadata {
  return (url: string) => setupModleAccess(setupDataAccess(url))
}

export function setupStore(setupMetadata: SetupMetadata,
                           setupDataAccess: SetupDataAccess<any>,
                           setupTypedDataAccess: SetupTypedDataAccess<any>,
                           setupModel: SetupModel,
                           setupModelStateAdapter: SetupModelStateAdapter):
                           (config: StateConfig) => Promise<Store<unknown>> {
  return async (config) => {
    const metadata = await setupMetadata(config.metadata)
    const data = _.map(config.data, (path, url) =>
      setupTypedDataAccess(_.get(metadata.models, path) as unknown as Class, setupDataAccess(url)))
    const model = await setupModel( metadata, data)
    const adapter = setupModelStateAdapter(model)
    return new Vuex.Store({
      modules: _.mapValues(config.stores, (path) => adapter.state(_.get(metadata.models, path) as unknown as Class))
    })
  }
}

export const store = setupStore(
  setupSetupMetadata(setupSetupDataAccess(PouchDB, PouchDBDataAccess), SimpleModelAccess.loadFromAdapter),
  setupSetupDataAccess(PouchDB, PouchDBDataAccess),
  <T>(type: Class, wrapped: DataAccess<T, string, string, void>) => new SimpleTypedDataAccess(type, wrapped),
  setupModelImpl,
  setupSetupModelStateAdapter())
