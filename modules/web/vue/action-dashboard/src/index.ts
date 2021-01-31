import {createApp} from 'vue'

const root = document.querySelector('#action-dashboard-host')
if (root) {
  const app = createApp({
    template: `<span>App</span>`,
  })
  app.mount(root)
}

