export * from './components'
import { registerRoutes } from './routes'
import { registerEditors } from './components'
import { Plugin } from '@agrzes/yellow-2020-web-vue-plugin'
import { Author, Book, Series, Genre, Library, Reading, Plan } from '@agrzes/yellow-2020-common-books'

export const plugin: Plugin ={
  registerRoutes,
  registerEditors,
  registerModel(registry) {
    registry.registerModel('book',{Book,Author,Series,Genre,Library,Reading,Plan})
  }
}
