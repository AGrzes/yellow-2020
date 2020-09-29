import { Author, Book, Plan, Reading } from '@agrzes/yellow-2020-common-books'
import { EditorRegistry } from '@agrzes/yellow-2020-web-vue-plugin'
import { EditAuthor} from './author'
import { EditBook} from './book'
import { EditPlan} from './plan'
import { EditReading} from './reading'

export * from './author'
export * from './book'
export * from './genre'
export * from './library'
export * from './plan'
export * from './reading'
export * from './series'

export function registerEditors(registry: EditorRegistry) {
  registry.registerEditor(Author, EditAuthor)
  registry.registerEditor(Book, EditBook)
  registry.registerEditor(Plan, EditPlan)
  registry.registerEditor(Reading, EditReading)
}
