import { Entity} from '@agrzes/yellow-2020-common-model'
import { Edit } from './edit'
import {Component} from 'vue'

const registry: Record<string,Component<any>> = {}

export function registerEditor<C extends Component>(type: Entity<any>, component: C) {
  registry[type.typeTag] = component
}

export function resolveEditor<T>(type: Entity<T>): Component<{current:T}> {
  return registry[type.typeTag] || Edit
}
