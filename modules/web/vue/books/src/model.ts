
import _ from 'lodash'

export class Book<Ref = never> {
  public title: string
  public description?: string
  public author: Array<Ref | Author<Ref>>
  public genre: Array<Ref | Genre<Ref>>
  public libraries: Array<LibraryEntry<Ref>>
  public static typeTag = 'book'
  public static key(book: Book) {
    return _.snakeCase(book.title)
  }
}

export class Author<Ref = never> {
  public name: string
  public books: Array<Ref | Book<Ref>>
  public static typeTag = 'author'
  public static key(author: Author) {
    return _.snakeCase(author.name)
  }
}

export class Genre<Ref = never> {
  public name: string
  public books: Array<Ref | Book<Ref>>
  public static typeTag = 'genre'
  public static key(genre: Genre) {
    return _.snakeCase(genre.name)
  }
}

export class Library<Ref = never> {
  public name: string
  public description?: string
  public kind: 'physical' | 'digital'
  public entries: Array<Ref | LibraryEntry<Ref>>
  public static typeTag = 'library'
  public static key(library: Library) {
    return _.snakeCase(library.name)
  }
}

export class LibraryEntry<Ref = never> {
  public owned: boolean
  public price?: number
  public url?: string
  public library: Ref | Library<Ref>
  public book?: Ref | Book<Ref>
}
