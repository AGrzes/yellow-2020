import { Author, Book, Entity } from '@agrzes/yellow-2020-common-books'
import { registerItemRoute, registerListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue, { VueConstructor } from 'vue'
import { RouteConfig } from 'vue-router'
import { mapState } from 'vuex'
import { AuthorDetails, AuthorList, BookDetails, BooksCards, BooksList, BooksTable } from './components'

export function itemComponent(entity: Entity<any>, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component v-if="item" :item="item"></the-component>`,
    computed: {
      ...mapState('books', {
          item(state: any) {
              return state.entities[entity.typeTag][this.$route.params.key]
          }
      })
  },
    components: {
      theComponent
    }
  })
}

export function listComponent(entity: Entity<any>, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component :list="list"></the-component>`,
    computed: {
      ...mapState('books', {
          list(state: any) {
              return state.entities[entity.typeTag]
          }
      })
    },
    components: {
      theComponent
    }
  })
}

export const bookRoutes: RouteConfig[] = [{
  path: `book/:key`,
  name: `bookDetails`,
  component: itemComponent(Book, BookDetails)
}, {
  path: `book`,
  name: `bookList`,
  component: listComponent(Book, BooksList)
}, {
  path: `bookTable`,
  name: `bookTable`,
  component: listComponent(Book, BooksTable)
}, {
  path: `bookCards`,
  name: `bookCards`,
  component: listComponent(Book, BooksCards)
}, {
  path: `author/:key`,
  name: `authorDetails`,
  component: itemComponent(Author, AuthorDetails)
}, {
  path: `author`,
  name: `authorList`,
  component: listComponent(Author, AuthorList)
}]

registerItemRoute('book', 'bookDetails')
registerItemRoute('author', 'authorDetails')
registerListRoute('book', 'bookList')
registerListRoute('author', 'authorList')
