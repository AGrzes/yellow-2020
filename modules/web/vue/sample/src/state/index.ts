import {bookModel} from '@agrzes/yellow-2020-common-books'
import {notifications, modelState} from '@agrzes/yellow-2020-web-vue-state'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

async function store() {
  await bookModel.load()
  return new Vuex.Store({
    modules: {
      model: await modelState(bookModel),
      notifications: notifications
    }
  })
}

export default store
