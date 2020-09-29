import { App } from 'vue'
import { registry } from '.'

export class YellowPlugin {
  static install(app: App, ...options: any[]) {
    app.config.globalProperties.$models = registry.entityRegistry.models
  }
}
