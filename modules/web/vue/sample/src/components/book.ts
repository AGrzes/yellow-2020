import Vue from 'vue'
import { Location } from 'vue-router'
import { modal } from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'

export const DeleteButton = Vue.extend({
  props: {
    type: String,
    key: String
  },
  template: `
<button @click="delete()" class="btn btn-outline-danger btn-sm" type="button" title="Delete">
  Delete
</button>
  `, 
  methods: {
    async delete() {
      await this.$store.dispatch(`${this.type}/delete`, this.key)
      this.$emit('delete')
    }
  }
})

export function resolveItemRoute(type: string,key: string, selector?: string): Location {
  return {
    name: ({book: 'bookDetails', author: 'authorDetails'})[type], 
    params: {key}
  }
}

export function resolveItemLabel(type: string,key: string, item?: any, selector?: string): String {
  return item?({
    book: item.title, 
    author: item.name
  })[type] : _.startCase(key)
    
}

export function resolveListRoute(type: string, selector?: string): Location {
  return {
    name: ({book: 'bookList', author: 'authorList'})[type]
  }
}

export const DetailsButton = Vue.extend({
  props: {
    type: String,
    key: String,
    selector: String
  },
  template: `
<router-link :to="route" class="btn btn-outline-info" role="button" title="Details">
  <i class="fas fa-eye"></i>
</router-link>
  `,
  computed: {
    route() {
      resolveItemRoute(this.type, this.key,this.selector)
    }
  }
})

export const DetailsLink = Vue.extend({
  props: {
    type: String,
    key: String,
    selector: String,
    item: Object
  },
  template: `
<router-link :to="route">{{author.name}}

</router-link>
  `,
  computed: {
    route() {
      return resolveItemRoute(this.type, this.key,this.selector)
    },
    label() {
      return resolveItemLabel(this.type, this.key, this.item, this.selector)
    }
  }
})

const Edit = Vue.extend({
  props: ['content'],
  template: `
<edit-yaml v-model="current"></edit-yaml>
  `,
  data() {
    return {
      current: this.content
    }
  }
})

export const EditButton = Vue.extend({
  props: {
    type: String,
    key: String
  },
  template: `
<button @click="edit()" class="btn btn-outline-primary" type="button" title="Edit">
  <i class="fas fa-edit"></i>
</button>
  `, 
  methods: {
    async edit() {
      modal({
        component: Edit,
        host: this.$el,
        title: 'Edit',
        props: {content: await this.$store.dispatch(`${this.type}/raw`, {key: this.key})},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              await this.$store.dispatch(`${this.type}/raw`, {
                key: this.key,
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

export const BooksList = Vue.extend({
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex">
      <span class="mr-auto">
      {{item.title}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button type="book" :key="item.key"></edit-button>
        <details-button type="book" :key="item.key"></details-button>
        <delete-button type="book" :key="item.key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><a @click="add()">add</a></li>
</ul>`, 
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BookDetails = Vue.extend({
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
  <h1>{{item.title}}</h1>
  <h2>Authors</h2>
    <ul>
      <li v-for="author in item.author">
        <details-link type="author" :key="author.key" :item="author"></details-link>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button type="book" :key="item.key"></edit-button>
    <details-button type="book" :key="item.key"></details-button>
    <delete-button type="book" :key="item.key"></delete-button>
  </div>
</div>`, 
  components: {
    DeleteButton, EditButton, DetailsButton, DetailsLink
  }, 
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('book'))
    }
  }
})
