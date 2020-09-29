import _ from 'lodash'
import { RouteRecordRaw } from 'vue-router'

interface ItemRouteEntry {
  type: string
  name: string
  idParam: string
  selectors: string[]
}

export interface RouteEntry {
  name: string
  params?: Record<string,any>
}

interface ListRouteEntry {
  type: string
  name: string
  selectors: string[]
}

export interface RouterRegistry {
  registerItemRoute(type: string, name: string, idParam?: string , selectors?: string[] ): void
  resolveItemRoute(type: string, id: string, selector?: string ): RouteEntry
  registerListRoute(type: string, name: string, selectors?: string[]): void
  resolveListRoute(type: string, selector?: string): RouteEntry
  route(route: RouteRecordRaw): void
  routes: RouteRecordRaw[]
}

export class RouterRegistryImpl implements RouterRegistry {
  private itemRouteRegistry: ItemRouteEntry[] = []
  private listRouteRegistry: ListRouteEntry[] = []
  public routes: RouteRecordRaw[] = []

  registerItemRoute(type: string, name: string,idParam: string = 'key', selectors: string[] = ['default']) {
    this.itemRouteRegistry.push( {
      type,
      name,
      idParam,
      selectors
    })
  }

  resolveItemRoute(type: string, id: string, selector: string = 'default') {
    const entry = _.find(this.itemRouteRegistry, (e) => e.type === type && _.includes(e.selectors, selector))
    if (entry) {
      return {
        name: entry.name,
        params: {[entry.idParam]: id}
      }
    }
  }
  registerListRoute(type: string, name: string, selectors: string[] = ['default']) {
    this.listRouteRegistry.push( {
      type,
      name,
      selectors
    })
  }
  
  resolveListRoute(type: string, selector: string = 'default') {
    const entry = _.find(this.listRouteRegistry, (e) => e.type === type && _.includes(e.selectors, selector))
    if (entry) {
      return {
        name: entry.name
      }
    }
  }

  route(route: RouteRecordRaw): void {
    this.routes.push(route)
  }
}

