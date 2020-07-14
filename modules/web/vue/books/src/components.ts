import { Author, Book, booksModel } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton } from '@agrzes/yellow-2020-web-vue-components'
import { resolveListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue from 'vue'

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
        <small v-for="author in item.author" class="ml-1">{{author.name}}</small>
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button type="book" :id="key"></edit-button>
        <details-button type="book" :id="key"></details-button>
        <delete-button type="book" :id="key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button type="book">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton
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
      <li v-for="author in authors">
        <details-link type="author" :id="authorKey(author)" :item="author">{{author.name}}</details-link>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button type="book" :id="item._id">Edit</edit-button>
    <list-button type="book">Back</list-button>
    <delete-button type="book" :id="item._id">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('book'))
    },
    authorKey(author: Author) {
      return Author.key(author)
    }
  },
  computed: {
    authors() {
      return Book.resolveAuthor(booksModel.index, this.item)
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
        <span class="badge badge-pill badge-primary" v-if="item.books">{{item.books.length}}</span>
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button type="author" :id="key"></edit-button>
        <details-button type="author" :id="key"></details-button>
        <delete-button type="author" :id="key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button type="author">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton
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
      <li v-for="book in books">
        <details-link type="book" :id="bookKey(book)" :item="book">{{book.title}}</details-link>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button type="author" :id="item._id">Edit</edit-button>
    <list-button type="author">Back</list-button>
    <delete-button type="author" :id="item._id">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('author'))
    },
    bookKey(book: Book) {
      return Book.key(book)
    }
  },
  computed: {
    books() {
      return Author.resolveBooks(booksModel.index, this.item)
    }
  }
})
