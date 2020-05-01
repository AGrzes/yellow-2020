import Vue from 'vue'
import Vuex from 'vuex'
import { config } from '../config'
import { store as setupStore} from '@agrzes/yellow-2020-web-vue-state'
Vue.use(Vuex)

async function store() {
  const {state} = await config()
  return setupStore(state)
}

export default store
