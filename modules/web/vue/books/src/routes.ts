import { Author, Book, Genre, Library, Series } from '@agrzes/yellow-2020-common-books'
import { registerItemRoute, registerListRoute, itemComponent, listComponent } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import { RouteConfig } from 'vue-router'
import { AuthorDetails, AuthorList, BookDetails, BooksList, GenreDetails,
  GenreList, LibraryDetails, LibraryList, SeriesDetails, SeriesList } from './components'

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
}, {
  path: `series/:key`,
  name: `seriesDetails`,
  component: itemComponent(Series, SeriesDetails)
}, {
  path: `series`,
  name: `seriesList`,
  component: listComponent(Series, SeriesList)
}]

registerItemRoute('book', 'bookDetails')
registerItemRoute('author', 'authorDetails')
registerItemRoute('library', 'libraryDetails')
registerItemRoute('genre', 'genreDetails')
registerItemRoute('series', 'seriesDetails')
registerListRoute('book', 'bookList')
registerListRoute('author', 'authorList')
registerListRoute('library', 'libraryList')
registerListRoute('genre', 'genreList')
registerListRoute('series', 'seriesList')
