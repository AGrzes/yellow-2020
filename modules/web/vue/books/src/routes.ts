import { itemComponent, listComponent, registerItemRoute, registerListRoute } from '@agrzes/yellow-2020-web-vue-router'
import { RouteConfig } from 'vue-router'
import { AuthorDetails, AuthorList, BookDetails, BooksCards, BooksList, BooksTable } from './components'

export const bookRoutes: RouteConfig[] = [{
  path: `book/:key`,
  name: `bookDetails`,
  component: itemComponent('book', BookDetails)
}, {
  path: `book`,
  name: `bookList`,
  component: listComponent('book', BooksList)
}, {
  path: `bookTable`,
  name: `bookTable`,
  component: listComponent('book', BooksTable)
}, {
  path: `bookCards`,
  name: `bookCards`,
  component: listComponent('book', BooksCards)
}, {
  path: `author/:key`,
  name: `authorDetails`,
  component: itemComponent('author', AuthorDetails)
}, {
  path: `author`,
  name: `authorList`,
  component: listComponent('author', AuthorList)
}]

registerItemRoute('book', 'bookDetails')
registerItemRoute('author', 'authorDetails')
registerListRoute('book', 'bookList')
registerListRoute('author', 'authorList')
