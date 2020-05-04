import Vuex from 'vuex'
import { PouchDBDataAccess , PouchDB} from '@agrzes/yellow-2020-common-data-pouchdb'
import { setupModel, simpleTypedDataAccess } from '@agrzes/yellow-2020-common-model'
import { SimpleModelAccess, Class } from '@agrzes/yellow-2020-common-metadata'
import { ModelStateAdapter } from './model'
import * as _ from 'lodash'

export interface StateConfig {
    metadata: string
    data: {
        [url: string]: string
    }
    stores: {
        [name: string]: string
    }
}


export async function store(config: StateConfig) {
  const metadata = await SimpleModelAccess.loadFromAdapter(new PouchDBDataAccess(new PouchDB(config.metadata)))
  const data = _.map(config.data,(path, url) => simpleTypedDataAccess(_.get(metadata.models,path) as unknown as Class,new PouchDBDataAccess(new PouchDB(url))))
  const model = await setupModel( metadata,data)
  const adapter = new ModelStateAdapter(model)
  return new Vuex.Store({
    modules: _.mapValues(config.stores,(path) => adapter.state(_.get(metadata.models,path) as unknown as Class))
  })
}