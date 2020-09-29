import { RouterRegistry, RouterRegistryImpl } from './routerRegistry';
export {RouterRegistry}

export interface Plugin {
  registerRoutes?(registry: RouterRegistry): void
}

export class PluginRegistry {
  public routerRegistry: RouterRegistry = new RouterRegistryImpl()

  public plugin(plugin: Plugin) {
    if (plugin.registerRoutes) {
      plugin.registerRoutes(this.routerRegistry)
    }
  }
}

export const registry = new PluginRegistry()
