import { Entity} from '@agrzes/yellow-2020-common-model'
import { Component } from 'vue'


export class EditorRegistry {
  private registry: Record<string,Component<any>> = {}
  public default: Component

  registerEditor<C extends Component>(type: Entity<any>, component: C) {
    this.registry[type.typeTag] = component
  }
  
  resolveEditor<T>(type: Entity<T>): Component<{current:T}> {
    return this.registry[type.typeTag] || this.default
  }
  
}

