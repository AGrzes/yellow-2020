import { EditorRegistry } from './editorRegistry';
import { EntityRegistry } from './entityRegistry';
import { RouterRegistry, RouterRegistryImpl } from './routerRegistry';
export { RouterRegistry }
export { EditorRegistry }
export { YellowPlugin } from './vuePlugin'


export interface Plugin {
  registerRoutes?(registry: RouterRegistry): void
  registerEditors?(registry: EditorRegistry): void
  registerModel?(registry: EntityRegistry): void
}

export class PluginRegistry {
  public routerRegistry: RouterRegistry = new RouterRegistryImpl()
  public editorRegistry: EditorRegistry = new EditorRegistry()
  public entityRegistry: EntityRegistry = new EntityRegistry()

  public plugin(plugin: Plugin) {
    if (plugin.registerRoutes) {
      plugin.registerRoutes(this.routerRegistry)
    }
    if (plugin.registerEditors) {
      plugin.registerEditors(this.editorRegistry)
    }
    if (plugin.registerModel) {
      plugin.registerModel(this.entityRegistry)
    }
  }
}

export const registry = new PluginRegistry()
