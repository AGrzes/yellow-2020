import { DefineComponent, defineComponent, h } from 'vue'
import { Entity} from '@agrzes/yellow-2020-common-model'
import _ from 'lodash'

export interface EditorDescriptor {
  component: DefineComponent
  label: string,
  property: string
  nestedProperty?: string
  entity?: Entity<unknown>
  children?: EditorDescriptor[]
}

function renderEditor(instance: any,{component,label,property,entity,nestedProperty,children}: EditorDescriptor) {
  return h(component,{label,property,item: instance, entity, nestedProperty}, children ? 
    {
      default: ({entity:item}) => (_.map(children, (childEditor) => renderEditor(item,childEditor)))
    }
    : null)
}

export function renderForm(instance: any, editors: EditorDescriptor[]) {
  return h('form',null,[
    _.map(editors, (editor) => renderEditor(instance.current,editor))
  ])
}
