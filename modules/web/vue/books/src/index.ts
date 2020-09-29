export * from './components'
import {registerRoutes} from './routes'
import { Plugin } from '@agrzes/yellow-2020-web-vue-plugin'

export const plugin: Plugin ={
  registerRoutes
}
