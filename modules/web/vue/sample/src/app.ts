import {createApp} from 'vue'
import 'vuex'
import './components'
import router from './router'
import store from './state'
import {plugin} from '@agrzes/yellow-2020-web-vue-books'
import {registry, YellowPlugin } from '@agrzes/yellow-2020-web-vue-plugin'
/* eslint-disable no-unused-vars */
(async () => {
  registry.plugin(plugin)
  const app = createApp({
    template: `<router-view></router-view>`,
    mounted() {
      this.$store.dispatch('model/listen')
    }
  })
  app.use(YellowPlugin)
  app.use(await store())
  app.use(await router())
  app.mount('body #app')
})()
