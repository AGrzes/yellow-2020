import { Author, Book, Genre, Library, Series, Reading, Plan } from '@agrzes/yellow-2020-common-books'
import { itemComponent, listComponent } from '@agrzes/yellow-2020-web-vue-router'
import { RouterRegistry } from '@agrzes/yellow-2020-web-vue-plugin'
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

export function registerRoutes(registry: RouterRegistry): void {
  registry.registerItemRoute('book', 'bookDetails')
  registry.registerItemRoute('author', 'authorDetails')
  registry.registerItemRoute('library', 'libraryDetails')
  registry.registerItemRoute('genre', 'genreDetails')
  registry.registerItemRoute('series', 'seriesDetails')
  registry.registerItemRoute('reading', 'readingDetails')
  registry.registerItemRoute('plan', 'planDetails')
  registry.registerListRoute('book', 'bookList')
  registry.registerListRoute('author', 'authorList')
  registry.registerListRoute('library', 'libraryList')
  registry.registerListRoute('genre', 'genreList')
  registry.registerListRoute('series', 'seriesList')
  registry.registerListRoute('reading', 'readingList')
  registry.registerListRoute('plan', 'planList')
  _.forEach(bookRoutes,(route) => registry.route(route))
}


