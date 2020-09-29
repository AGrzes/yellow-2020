import { EditorRegistry } from './editorRegistry';
import { RouterRegistry, RouterRegistryImpl } from './routerRegistry';
export { RouterRegistry }
export { EditorRegistry }

export interface Plugin {
  registerRoutes?(registry: RouterRegistry): void
  registerEditors?(registry: EditorRegistry): void
}

export class PluginRegistry {
  public routerRegistry: RouterRegistry = new RouterRegistryImpl()
  public editorRegistry: EditorRegistry = new EditorRegistry()

  public plugin(plugin: Plugin) {
    if (plugin.registerRoutes) {
      plugin.registerRoutes(this.routerRegistry)
    }
    if (plugin.registerEditors) {
      plugin.registerEditors(this.editorRegistry)
    }
  }
}

export const registry = new PluginRegistry()
