
import { Indexer, buildEntities, RelationEntityDescriptor } from '@agrzes/yellow-2020-common-model'
import _ from 'lodash'

export const { book: Book, author: Author, genre: Genre, series: Series, library: Library } = buildEntities([
  {
    name: 'Book',
    typeTag: 'book',
    key(item: any) {
      return _.kebabCase(item.title)
    },
    label(item: any) {
      return item.title
    },
    relations: [{
      property: 'author',
      target: 'author',
      reverseProperty: 'books'
    },{
      property: 'genre',
      target: 'genre',
      reverseProperty: 'books'
    },{
      property: 'series',
      target: 'series',
      reverseProperty: 'books'
    },{
      property: 'libraries',
      nestedProperty: 'library',
      target: 'library',
      reverseProperty: 'entries',
      reverseNestedProperty: 'book'
    } as RelationEntityDescriptor]
  },{
    name: 'Author',
    typeTag: 'author',
    key(item: any) {
      return _.kebabCase(item.name)
    },
    label(item: any) {
      return item.name
    },
    relations: [{
      property: 'books',
      target: 'book',
      reverseProperty: 'author'
    },{
      property: 'series',
      target: 'series',
      reverseProperty: 'author'
    }]
  },{
    name: 'Genre',
    typeTag: 'genre',
    key(item: any) {
      return _.kebabCase(item.name)
    },
    label(item: any) {
      return item.name
    },
    relations: [{
      property: 'books',
      target: 'book',
      reverseProperty: 'genre'
    }]
  },{
    name: 'Series',
    typeTag: 'series',
    key(item: any) {
      return _.kebabCase(item.name)
    },
    label(item: any) {
      return item.name
    },
    relations: [{
      property: 'books',
      target: 'book',
      reverseProperty: 'series'
    },{
      property: 'author',
      target: 'author',
      reverseProperty: 'series'
    }]
  },{
    name: 'Library',
    typeTag: 'library',
    key(item: any) {
      return _.kebabCase(item.name)
    },
    label(item: any) {
      return item.name
    },
    relations: [{
      reverseProperty: 'libraries',
      reverseNestedProperty: 'library',
      target: 'book',
      property: 'entries',
      nestedProperty: 'book'
    } as RelationEntityDescriptor]
  }
])

export class LibraryEntry<Ref = never> {
  public owned: boolean
  public price?: number
  public url?: string
  public library: Ref
  public book?: Ref 
}
