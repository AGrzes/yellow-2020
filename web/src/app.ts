import Vue from 'vue'
import './components'
import router from './router'
import store from './state'
/* eslint-disable no-unused-vars */
const app = new Vue({
  el: 'body #app',
  template: `<router-view></router-view>`,
  store,
  router,
  data: {
  }
})
