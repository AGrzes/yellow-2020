import 'bootstrap'
import 'jquery'
import 'popper.js'
import '../node_modules/bootstrap/scss/bootstrap.scss'
import '../node_modules/@fortawesome/fontawesome-free/css/all.css'
import {createApp} from 'vue'
import {ActionDashboard} from './dashboard'

const root = document.querySelector('#action-dashboard-host')
if (root) {
  const app = createApp({
    template: `<action-dashboard>App</action-dashboard>`,
    components: {
      ActionDashboard
    }
  })
  app.mount(root)
}

