import { Entity} from '@agrzes/yellow-2020-common-model'
import { Edit } from './edit'

const registry: Record<string,Vue.Component<any>> = {}

export function registerEditor<Component extends Vue.Component>(type: Entity<any>, component: Component) {
  registry[type.typeTag] = component
}

export function resolveEditor<T>(type: Entity<T>): Vue.Component<{current:T}> {
  return registry[type.typeTag] || Edit
}
