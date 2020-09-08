
import { builder, Entity } from '@agrzes/yellow-2020-common-model'
import _ from 'lodash'

const label = (field:string) => _.property<any,string>(field)
export const { book: Book, author: Author, genre: Genre, series: Series, library: Library, reading: Reading } = 
  builder()
    .entity('book').label(label('title'))
      .relation('author').reverseProperty('books')
      .relation('genre').reverseProperty('books')
      .relation('series').reverseProperty('books')
      .relation('libraries').nestedProperty('library').target('library').reverseNestedProperty('book').reverseProperty('entries')
    .entity('author').label(label('name'))
      .relation('series').reverseProperty('author')
    .entity('genre').label(label('name'))
    .entity('series').label(label('name'))
    .entity('library').label(label('name'))
    .entity('reading').label(({book}) => _.startCase(book)).key(({book,startDate}) => `${book}:${startDate}`)
      .relation('book').reverseProperty('readings')
    .build()

export class LibraryEntry<Ref = never> {
  public owned: boolean
  public price?: number
  public url?: string
  public library: Ref
  public book?: Ref 
}
