
import _ from 'lodash'
import { Entity, Index, rel } from './data'

export class Book<Ref = string> {
  public title: string
  public description?: string
  public author: Array<Ref | Author<Ref>>
  public genre: Array<Ref | Genre<Ref>>
  public libraries: Array<LibraryEntry<Ref>>
  public static typeTag = 'book'
  public static key<T>(book: Book<T>) {
    return _.kebabCase(book.title)
  }
  public static index(index: Index, book: Book<string>) {
    const key = Book.key(book)
    index.indexRelation(Book, book, 'author', Author, 'books')
    index.indexRelation(Book, book, 'genre', Genre, 'books')
    index.indexRelationEntity(Book, book, 'libraries', 'library', Library, 'entries', 'book')
  }
  public static resolve(index: Index, book: Book<string>) {
    const key = Book.key(book)
    book.author = index.resolveRelations(Book, book, 'author', Author) as Array<string | Author<string>>
    book.genre = index.resolveRelations(Book, book, 'genre', Genre) as Array<string | Genre<string>>
    _.forEach(book.libraries, (library) => {
      library.library = index.resolve<Library<string>>(Library, library.library as string)
      library.book = book
    })
    book.libraries = [...(book.libraries || []),
                      ..._.map(index.resolveRelation(Book, key, 'libraries.library'), 'relationData')]
  }
}

export class Author<Ref = never> {
  public name: string
  public books: Array<Ref | Book<Ref>>
  public static typeTag = 'author'
  public static key<T>(author: Author<T>) {
    return _.kebabCase(author.name)
  }
  public static index<T>(index: Index, author: Author<string>) {
    index.indexRelation(Author, author, 'books', Book, 'author')
  }
  public static resolve<T>(index: Index, author: Author<string>) {
    author.books = index.resolveRelations(Author, author, 'books', Book) as Array<string | Book<string>>
  }
}

export class Genre<Ref = never> {
  public name: string
  public books: Array<Ref | Book<Ref>>
  public static typeTag = 'genre'
  public static key<T>(genre: Genre<T>) {
    return _.kebabCase(genre.name)
  }
  public static index<T>(index: Index, genre: Genre<string>) {
    index.indexRelation(Genre, genre, 'books', Book, 'genre')
  }
  public static resolve<T>(index: Index, genre: Genre<string>) {
    genre.books = index.resolveRelations(Genre, genre, 'books', Book) as Array<string | Book<string>>
  }
}

export class Library<Ref = never> {
  public name: string
  public description?: string
  public kind: 'physical' | 'digital'
  public entries: Array<LibraryEntry<Ref>>
  public static typeTag = 'library'
  public static key<T>(library: Library<T>) {
    return _.kebabCase(library.name)
  }
  public static index<T>(index: Index, library: Library<string>) {
    index.indexRelationEntity(Library, library, 'entries', 'book', Book, 'libraries', 'library')
  }
  public static resolve<T>(index: Index, library: Library<string>) {
    const key = Library.key(library)

    _.forEach(library.entries, (entry) => {
      entry.book = index.resolve<Book<string>>(Book, entry.book as string)
      entry.library = library
    })
    library.entries = [...(library.entries || []),
                      ..._.map(index.resolveRelation(Library, key, 'entries.book'), 'relationData')]
  }
}

export class LibraryEntry<Ref = never> {
  public owned: boolean
  public price?: number
  public url?: string
  public library: Ref | Library<Ref>
  public book?: Ref | Book<Ref>
}
