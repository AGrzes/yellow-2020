import { booksModel } from '@agrzes/yellow-2020-common-books'
import { registerItemRoute, registerListRoute } from '@agrzes/yellow-2020-web-vue-router'
import Vue, { VueConstructor } from 'vue'
import { RouteConfig } from 'vue-router'
import { AuthorDetails, AuthorList, BookDetails, BooksCards, BooksList, BooksTable } from './components'

export function itemComponent(type: string, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component v-if="item" :item="item"></the-component>`,
    computed: {
        item() {
          return booksModel[type][this.$route.params.key]
        }
    },
    components: {
      theComponent
    }
  })
}

export function listComponent(type: string, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component :list="list"></the-component>`,
    computed: {
        list() {
          return booksModel[type]
        }
    },
    components: {
      theComponent
    }
  })
}

export const bookRoutes: RouteConfig[] = [{
  path: `book/:key`,
  name: `bookDetails`,
  component: itemComponent('books', BookDetails)
}, {
  path: `book`,
  name: `bookList`,
  component: listComponent('books', BooksList)
}, {
  path: `bookTable`,
  name: `bookTable`,
  component: listComponent('books', BooksTable)
}, {
  path: `bookCards`,
  name: `bookCards`,
  component: listComponent('books', BooksCards)
}, {
  path: `author/:key`,
  name: `authorDetails`,
  component: itemComponent('authors', AuthorDetails)
}, {
  path: `author`,
  name: `authorList`,
  component: listComponent('authors', AuthorList)
}]

registerItemRoute('book', 'bookDetails')
registerItemRoute('author', 'authorDetails')
registerListRoute('book', 'bookList')
registerListRoute('author', 'authorList')
