import {createApp} from 'vue'
import 'vuex'
import './components'
import router from './router'
import store from './state'
/* eslint-disable no-unused-vars */
(async () => {
  const app = createApp({
    template: `<router-view></router-view>`,
    mounted() {
      this.$store.dispatch('model/listen')
    }
  })
  app.use(await store())
  app.use(await router())
  app.mount('body #app')
})()
