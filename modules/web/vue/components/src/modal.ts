import 'bootstrap'
import 'jquery'
import * as _ from 'lodash'
import {Component, ComponentPublicInstance, defineComponent, createVNode, render} from 'vue'

const Modal = defineComponent({
  props: ['component', 'title', 'componentProps', 'buttons'],
  template: `
<div class="modal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{title}}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div :is="component" v-bind="componentProps" ref="content"></div>
      </div>
      <div class="modal-footer">
        <button
          v-for="button in buttons"
          type="button"
          class="btn"
          :class="button.class"
          @click="click(button,$event)">
            {{label(button)}}
        </button>
      </div>
    </div>
  </div>
</div>
  `,
  methods: {
    label(config: ModalButtonConfig<any>) {
      return config.label || _.startCase(config.name)
    },
    click(config: ModalButtonConfig<any>, event: Event) {
      if (config.onclick) {
        config.onclick({
          event,
          component: this.$refs.content,
          config,
          close: () => {
            $(this.$el).modal('hide')
          }
        })
      }
    }
  }
})

interface ModalButonClickArguments<C extends Component> {
  event: Event
  component: C
  config: ModalButtonConfig<C>
  close(): void
}

interface ModalButtonConfig<C extends Component> {
  name: string
  label?: string
  class?: string
  onclick?: (args: ModalButonClickArguments<C>) => void
}

interface ModalConfig<C extends Component> {
  parent: ComponentPublicInstance
  component: string | C
  title: string
  props?: any
  buttons?: Array<ModalButtonConfig<C>>
}

interface ModalResult<C extends Component> {
  button: ModalButtonConfig<C>
  instance: C
}

export const modal = <C extends Component>
  (options: ModalConfig<C>): Promise<C> => {
  return new Promise((resolve, reject) => {
    const el = document.createElement('div')
    let vNode = createVNode(Modal, {
      parent: options.parent,
      propsData: {
        component: options.component,
        title: options.title,
        componentProps: options.props,
        buttons: options.buttons || [{name: 'close', onclick(m) {m.close()}, class: 'btn-secondary'}]
      }
    }, null)
    render(vNode, el)
    options.parent.$el.appendChild(el)
    $(el).modal()
    .on('hidden.bs.modal', (e) => {
      $(el).modal('dispose')
      resolve(vNode.component.refs.content as C)
    })
  })
}
