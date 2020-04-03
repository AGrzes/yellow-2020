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
Vue.use(Vuex)

async function store() {
  const metadata = await SimpleModelAccess.loadFromAdapter(new PouchDBDataAccess(new PouchDB('http://localhost:5984/model')))
  const book = simpleTypedDataAccess(metadata.models.books.classes.book,new PouchDBDataAccess(new PouchDB('http://localhost:5984/books')))
  const author = simpleTypedDataAccess(metadata.models.books.classes.author,new PouchDBDataAccess(new PouchDB('http://localhost:5984/authors')))
  const ui = uiState(uiModel)
  const model = await setupModel( metadata,[book,author])
  const adapter = new ModelStateAdapter(model)
  return new Vuex.Store({
    modules: {
      book:adapter.state(metadata.models.books.classes.book),
      author:adapter.state(metadata.models.books.classes.author)
    }
  })
}





export default store
