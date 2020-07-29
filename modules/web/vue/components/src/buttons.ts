import {resolveItemRoute, resolveListRoute} from '@agrzes/yellow-2020-web-vue-router'
import '@fortawesome/fontawesome-free/css/all.css'
import _ from 'lodash'
import Vue from 'vue'
import { Location} from 'vue-router'
import { Create, Edit } from './edit'
import { modal } from './modal'

export const DeleteButton = Vue.extend({
  props: {
    type: String,
    id: String
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
      await this.$store.dispatch(`${this.type}/delete`, this.id)
      this.$emit('delete')
    }
  }
})

export const DetailsButton = Vue.extend({
  props: {
    type: String,
    id: String,
    selector: String
  },
  template: `
<router-link :to="route" class="btn btn-outline-info" role="button" title="Details">
  <slot>
    <i class="fas fa-eye"></i>
  </slot>
</router-link>
  `,
  computed: {
    route(): Location {
      return resolveItemRoute(this.type, this.id, this.selector)
    }
  }
})

export const ListButton = Vue.extend({
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
    route(): Location {
      return resolveListRoute(this.type, this.selector)
    }
  }
})

export const DetailsLink = Vue.extend({
  props: {
    type: String,
    id: String,
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
    route(): Location {
      return resolveItemRoute(this.type, this.id, this.selector)
    },
    label(): string {
      return _.startCase(this.id)
    }
  }
})

export const EditButton = Vue.extend({
  props: {
    item: Object
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
      modal({
        component: Edit,
        host: this.$root.$el,
        title: 'Edit',
        props: {content: this.item},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              await this.$store.dispatch(`model/update`, {item: m.component.current, type})
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

export const CreateButton = Vue.extend({
  props: {
    type: String
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
        component: Create,
        host: this.$root.$el,
        title: 'Create',
        props: {content: {}},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              await this.$store.dispatch(`${this.type}/raw`, {
                key: m.component.key,
                value: m.component.current
              })
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
