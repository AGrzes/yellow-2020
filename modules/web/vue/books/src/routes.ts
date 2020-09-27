import { Author, Book, Genre, Library, Series, Reading, Plan } from '@agrzes/yellow-2020-common-books'
import { registerItemRoute, registerListRoute, itemComponent, listComponent } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import { RouteRecordRaw } from 'vue-router'
import { AuthorDetails, AuthorList, BookDetails, BooksList, GenreDetails,
  GenreList, LibraryDetails, LibraryList, SeriesDetails, SeriesList, ReadingDetails, ReadingList, PlanDetails, PlanList } from './components'

export const bookRoutes: RouteRecordRaw[] = [{
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
}, {
  path: `reading/:key`,
  name: `readingDetails`,
  component: itemComponent(Reading, ReadingDetails)
}, {
  path: `reading`,
  name: `readingList`,
  component: listComponent(Reading, ReadingList)
}, {
  path: `plan/:key`,
  name: `planDetails`,
  component: itemComponent(Plan, PlanDetails)
}, {
  path: `plan`,
  name: `planList`,
  component: listComponent(Plan, PlanList)
}]

registerItemRoute('book', 'bookDetails')
registerItemRoute('author', 'authorDetails')
registerItemRoute('library', 'libraryDetails')
registerItemRoute('genre', 'genreDetails')
registerItemRoute('series', 'seriesDetails')
registerItemRoute('reading', 'readingDetails')
registerItemRoute('plan', 'planDetails')
registerListRoute('book', 'bookList')
registerListRoute('author', 'authorList')
registerListRoute('library', 'libraryList')
registerListRoute('genre', 'genreList')
registerListRoute('series', 'seriesList')
registerListRoute('reading', 'readingList')
registerListRoute('plan', 'planList')
