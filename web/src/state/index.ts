import Vue from 'vue'
import Vuex from 'vuex'
import dataState from '../yellow/state/data'
import { PouchDBDataAccess , PouchDB} from '../yellow/data/pouchdb'
import metadataState from '../yellow/state/metadata'
import uiState from '../yellow/state/ui'
import { uiModel } from '../uiModel'
import { setupModel, simpleTypedDataAccess } from '../yellow/model'
import { SimpleModelAccess } from '../yellow/metadata/simple'
import { ModelStateAdapter } from '../yellow/state/model'
import { config } from '../config'
import { store as setupStore} from '../yellow/state'
Vue.use(Vuex)

async function store() {
  const {state} = await config()
  return setupStore(state)
}

export default store
