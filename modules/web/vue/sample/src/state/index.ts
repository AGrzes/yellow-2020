import {bookModel} from '@agrzes/yellow-2020-common-books'
import {notifications, modelState} from '@agrzes/yellow-2020-web-vue-state'
import Vuex from 'vuex'

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
