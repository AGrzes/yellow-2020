import * as _ from 'lodash'
import Vue from 'vue'

const Modal = Vue.extend({
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
Vue.component('modal-component', Modal)

interface ModalButonClickArguments<Component extends Vue.VueConstructor> {
  event: Event
  component: InstanceType<Component>
  config: ModalButtonConfig<Component>
  close(): void
}

interface ModalButtonConfig<Component extends Vue.VueConstructor> {
  name: string
  label?: string
  class?: string
  onclick?: (args: ModalButonClickArguments<Component>) => void
}

interface ModalConfig<Component extends Vue.VueConstructor > {
  host: Element
  component: string | Component
  title: string
  props?: any
  buttons?: ModalButtonConfig<Component>[]
}

interface ModalResult<Component extends Vue.VueConstructor> {
  button: ModalButtonConfig<Component>
  instance: InstanceType<Component>
}

export const modal = <Component extends Vue.VueConstructor>
  (options: ModalConfig<Component>): Promise<InstanceType<Component>> => {
  return new Promise((resolve, reject) => {
    const instance = new Modal({
        propsData: {
          component: options.component,
          title: options.title,
          componentProps: options.props,
          buttons: options.buttons || [{name: 'close', onclick(m) {m.close()}, class: 'btn-secondary'}]
        }
    })
    instance.$mount()
    options.host.appendChild(instance.$el)
    $(instance.$el).modal()
    .on('hidden.bs.modal', (e) => {
      $(instance.$el).modal('dispose')
      resolve(instance.$refs.content as InstanceType<Component>)
    })
  })
}
