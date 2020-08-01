import { Author, Book, Entity, Genre, Library } from '@agrzes/yellow-2020-common-books'
import { registerItemRoute, registerListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue, { VueConstructor } from 'vue'
import { RouteConfig } from 'vue-router'
import { mapState } from 'vuex'
import { AuthorDetails, AuthorList, BookDetails, BooksList, GenreDetails,
  GenreList, LibraryDetails, LibraryList } from './components'

export function itemComponent(entity: Entity<any>, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component v-if="item" :item="item"></the-component>`,
    computed: {
      ...mapState('model', {
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
      ...mapState('model', {
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
  path: `author/:key`,
  name: `authorDetails`,
  component: itemComponent(Author, AuthorDetails)
}, {
  path: `author`,
  name: `authorList`,
  component: listComponent(Author, AuthorList)
}, {
  path: `library/:key`,
  name: `libraryDetails`,
  component: itemComponent(Library, LibraryDetails)
}, {
  path: `library`,
  name: `libraryList`,
  component: listComponent(Library, LibraryList)
}, {
  path: `genre/:key`,
  name: `genreDetails`,
  component: itemComponent(Genre, GenreDetails)
}, {
  path: `genre`,
  name: `genreList`,
  component: listComponent(Genre, GenreList)
}]

registerItemRoute('book', 'bookDetails')
registerItemRoute('author', 'authorDetails')
registerItemRoute('library', 'libraryDetails')
registerItemRoute('genre', 'genreDetails')
registerListRoute('book', 'bookList')
registerListRoute('author', 'authorList')
registerListRoute('library', 'libraryList')
registerListRoute('genre', 'genreList')
