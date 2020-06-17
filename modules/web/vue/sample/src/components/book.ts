import Vue from 'vue'
import { Location } from 'vue-router'
import { modal } from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'

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

export function resolveItemRoute(type: string,id: string, selector?: string): Location {
  return {
    name: ({book: 'bookDetails', author: 'authorDetails'})[type], 
    params: {key:id}
  }
}

export function resolveItemLabel(type: string,id: string, item?: any, selector?: string): String {
  return item?({
    book: item.title, 
    author: item.name
  })[type] : _.startCase(id)
    
}

export function resolveListRoute(type: string, selector?: string): Location {
  return {
    name: ({book: 'bookList', author: 'authorList'})[type]
  }
}

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
    route() {
      return resolveItemRoute(this.type, this.id,this.selector)
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
    route() {
      return resolveItemRoute(this.type, this.id,this.selector)
    },
    label() {
      return resolveItemLabel(this.type, this.id, this.item, this.selector)
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
    id: String
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
      modal({
        component: Edit,
        host: this.$el,
        title: 'Edit',
        props: {content: await this.$store.dispatch(`${this.type}/raw`, {key: this.id})},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              await this.$store.dispatch(`${this.type}/raw`, {
                key: this.id,
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
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex">
      <span class="mr-auto">
        {{item.title}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button type="book" :id="key"></edit-button>
        <details-button type="book" :id="key"></details-button>
        <delete-button type="book" :id="key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><a @click="add()">add</a></li>
</ul>`, 
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BooksTable = Vue.extend({
  props: {
    list: Object
  },
  template: `
<table class="table-sm table-striped">
  <thead>
    <tr>
      <th>Title</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item,key) in list" >
      <td>{{item.title}}</td>
      <td>
        <edit-button type="book" :id="key"></edit-button>
        <details-button type="book" :id="key"></details-button>
        <delete-button type="book" :id="key"></delete-button>
      </td>
    </tr>
  </tbody>
</table>`, 
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BooksCards = Vue.extend({
  props: {
    list: Object
  },
  template: `
<div class="row">
  <div v-for="(item,key) in list" class="col-3 mt-4">
    <div class="card h-100" >
      <div class="card-body">
        {{item.title}}
      </div>
      <div class="card-footer text-right">
        <edit-button type="book" :id="key"></edit-button>
        <details-button type="book" :id="key"></details-button>
        <delete-button type="book" :id="key"></delete-button>
      </div>
    </div>
  </div>
</div>`, 
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BookDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>{{item.title}}</h1>
    <h2>Authors</h2>
    <ul>
      <li v-for="author in item.author">
        <details-link type="author" :id="author._id" :item="author"></details-link>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button type="book" :id="item._id">Edit</edit-button>
    <details-button type="book" :id="item._id">Details</details-button>
    <delete-button type="book" :id="item._id">Delete</delete-button>
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


export const AuthorList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex">
      <span class="mr-auto">
        {{item.name}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button type="author" :id="key"></edit-button>
        <details-button type="author" :id="key"></details-button>
        <delete-button type="author" :id="key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><a @click="add()">add</a></li>
</ul>`, 
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const AuthorDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>{{item.name}}</h1>
    <h2>Books</h2>
    <ul>
      <li v-for="book in item.books">
        <details-link type="book" :id="book._id" :item="book"></details-link>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button type="author" :id="item._id">Edit</edit-button>
    <details-button type="author" :id="item._id">Details</details-button>
    <delete-button type="author" :id="item._id">Delete</delete-button>
  </div>
</div>`, 
  components: {
    DeleteButton, EditButton, DetailsButton, DetailsLink
  }, 
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('author'))
    }
  }
})