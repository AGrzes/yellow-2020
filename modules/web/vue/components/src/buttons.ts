import {registry} from '@agrzes/yellow-2020-web-vue-plugin'
import '@fortawesome/fontawesome-free/css/all.css'
import _ from 'lodash'
import Vue, {defineComponent} from 'vue'
import { modal } from './modal'

export const DeleteButton = defineComponent({
  props: {
    item: Object
  },
  template: `
<button @click="remove()" class="btn btn-outline-danger" type="button" title="Delete">
  <slot>
    <i class="fas fa-trash"></i>
  </slot>
</button>
  `,
  methods: {
    async remove() {
      const id = this.item.constructor.key(this.item)
      await this.$store.dispatch(`model/delete`, {id, type: this.item.constructor})
      await this.$store.dispatch(`notifications/add`, {title: 'Entity deleted', content: `Entity with key ${id} was deleted` })
      this.$emit('delete')
    }
  }
})

export const DetailsButton = defineComponent({
  props: {
    item: Object,
    selector: String
  },
  template: `
<router-link v-if="route" :to="route" class="btn btn-outline-info" role="button" title="Details">
  <slot>
    <i class="fas fa-eye"></i>
  </slot>
</router-link>
  `,
  computed: {
    route() {
      const key = this.item.constructor.key(this.item)
      return key ? registry.routerRegistry.resolveItemRoute(this.item.constructor.typeTag, key, this.selector) : null
    }
  }
})

export const ListButton = defineComponent({
  props: {
    type: String,
    selector: String
  },
  template: `
<router-link :to="route" class="btn btn-outline-info" role="button" title="List" active-class="">
  <slot>
    <i class="fas fa-list"></i>
  </slot>
</router-link>
  `,
  computed: {
    route() {
      return registry.routerRegistry.resolveListRoute(this.type, this.selector)
    }
  }
})

export const DetailsLink = defineComponent({
  props: {
    selector: String,
    item: Object
  },
  template: `
<router-link :to="route">
  <slot>
    {{label}}
  </slot>
</router-link>
  `,
  computed: {
    id() {
      return this.item.constructor.key(this.item)
    },
    route() {
      return registry.routerRegistry.resolveItemRoute(this.item.constructor.typeTag, this.id, this.selector)
    },
    label(): string {
      return this.item.constructor.label(this.item)
    }
  }
})

export const EditButton = defineComponent({
  props: {
    item: Object,
    component: Function
  },
  template: `
<button @click="edit()" class="btn btn-outline-primary" type="button" title="Edit">
  <slot>
    <i class="fas fa-edit"></i>
  </slot>
</button>
  `,
  methods: {
    async edit() {
      const type = this.item.constructor
      const initialId = this.item.constructor.key(this.item)
      modal({
        component: registry.editorRegistry.resolveEditor(type) as any,
        parent: this.$root,
        title: 'Edit',
        props: {content: this.item},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              const id = this.item.constructor.key(m.component.current)
              if (initialId != id) {
                await this.$store.dispatch(`model/delete`, {id: initialId, type: type})
                await this.$store.dispatch(`model/update`, {item: m.component.current, type})
                await this.$store.dispatch(`notifications/add`, {title: 'Entity updated', content: `Entity with key ${initialId} -> ${id} was updated` })
              } else {
                await this.$store.dispatch(`model/update`, {item: m.component.current, type})
                await this.$store.dispatch(`notifications/add`, {title: 'Entity updated', content: `Entity with key ${id} was updated` })
              }
              m.close()
            },
            class: 'btn-primary'
          }, {
            name: 'Cancel',
            onclick(m) {
              m.close()
            },
            class: 'btn-secondary'
          }
        ]
      })
    }
  }
})

export const CreateButton = defineComponent({
  props: {
    type: Function
  },
  template: `
<button @click="add()" class="btn btn-outline-primary" type="button" title="Create">
  <slot>
    <i class="fas fa-plus"></i>
  </slot>
</button>
  `,
  methods: {
    async add() {
      modal({
        component: registry.editorRegistry.resolveEditor(this.type) as any,
        parent: this.$root,
        title: 'Create',
        props: {content: {}},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              await this.$store.dispatch(`model/update`, {item: m.component.current, type: this.type})
              await this.$store.dispatch(`notifications/add`, {
                title: 'Entity created', 
                content: `Entity of type '${this.type.name}' was created`,
                icon: 'plus'
              })
              m.close()
              this.$emit('created',m.component.current)
            },
            class: 'btn-primary'
          }, {
            name: 'Cancel',
            onclick(m) {
              m.close()
            },
            class: 'btn-secondary'
          }
        ]
      })
    }
  }
})
