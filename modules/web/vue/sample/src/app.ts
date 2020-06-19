import Vue from 'vue'
import 'vuex'
import './components'
import router from './router'
import store from './state'
/* eslint-disable no-unused-vars */
(async () => {
  const app = new Vue({
    el: 'body #app',
    template: `<router-view></router-view>`,
    store: await store(),
    router: await router(),
    data: {
    }
  })
})()

