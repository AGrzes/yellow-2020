import _ from 'lodash'
import { Location } from 'vue-router'

interface ItemRouteEntry {
  type: string
  name: string
  idParam: string
  selectors: string[]
}

const itemRouteRegistry: ItemRouteEntry[] = []

export function registerItemRoute(type: string, name: string, idParam: string = 'key', selectors: string[] = ['default']) {
  itemRouteRegistry.push( {
    type,
    name,
    idParam,
    selectors
  })
}

export function resolveItemRoute(type: string, id: string, selector: string = 'default'): Location {
  const entry = _.find(itemRouteRegistry, (entry) => entry.type === type && _.includes(entry.selectors, selector))
  if (entry) {
    return {
      name: entry.name,
      params: {[entry.idParam]: id}
    }
  }

}

interface ListRouteEntry {
  type: string
  name: string
  selectors: string[]
}

const listRouteRegistry: ListRouteEntry[] = []

export function registerListRoute(type: string, name: string, selectors: string[] = ['default']) {
  listRouteRegistry.push( {
    type,
    name,
    selectors
  })
}

export function resolveListRoute(type: string, selector: string = 'default'): Location {
  const entry = _.find(listRouteRegistry, (entry) => entry.type === type && _.includes(entry.selectors, selector))
  if (entry) {
    return {
      name: entry.name
    }
  }
}
