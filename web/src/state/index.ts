import Vue from 'vue'
import Vuex from 'vuex'
import dataState from '../yellow/state/data'
import { PouchDBDataAccess , PouchDB} from '../yellow/data/pouchdb'
import metadataState from '../yellow/state/metadata'
import uiState from '../yellow/state/ui'
import { uiModel } from '../uiModel'
Vue.use(Vuex)

const book = dataState(new PouchDBDataAccess(new PouchDB('http://localhost:5984/books')))
const metadata = metadataState(new PouchDBDataAccess(new PouchDB('http://localhost:5984/metadata')))
const ui = uiState(uiModel)

const store = new Vuex.Store({
  modules: {
    book,
    metadata
  }
})

export default store
