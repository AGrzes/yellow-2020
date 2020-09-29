import 'bootstrap'
import 'jquery'
import 'popper.js'
import '../node_modules/bootstrap/scss/bootstrap.scss'
import './app'
import {plugin} from '@agrzes/yellow-2020-web-vue-books'
import {registry} from '@agrzes/yellow-2020-web-vue-plugin'

registry.plugin(plugin)
