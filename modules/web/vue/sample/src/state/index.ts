import {booksModel} from '@agrzes/yellow-2020-common-books'
import {modelState} from '@agrzes/yellow-2020-web-vue-books'
import { store as setupStore} from '@agrzes/yellow-2020-web-vue-state'
import Vue from 'vue'
import Vuex from 'vuex'
import { config } from '../config'
Vue.use(Vuex)

async function store() {
  const {state} = await config()
  await booksModel.init()
  modelState(booksModel)
  return new Vuex.Store({
    modules: {
      books: modelState(booksModel)
    }
  })
}

export default store
