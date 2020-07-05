
import _ from 'lodash'
import { Index, rel } from './data'

export class Book<Ref = never> {
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
    _.forEach(book.author, (author: string) => index.index(rel(Book, key, 'author', Author, author, 'books')))
    _.forEach(book.genre, (genre: string) => index.index(rel(Book, key, 'genre', Genre, genre, 'books')))
    _.forEach(book.libraries, (entry: LibraryEntry<string>) =>
      index.index(rel(Book, key, 'libraries.library', Library, entry.library as string, 'entries.book', entry)))
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
    const key = Author.key(author)
    _.forEach(author.books, (book: string) => index.index(rel(Author, key, 'books', Book, book, 'author')))
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
    const key = Genre.key(genre)
    _.forEach(genre.books, (book: string) => index.index(rel(Genre, key, 'books', Book, book, 'genre')))
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
    const key = Library.key(library)
    _.forEach(library.entries, (entry: LibraryEntry<string>) =>
      index.index(rel(Library, key, 'entries.book', Book, entry.book as string, 'libraries.library', entry)))
  }
}

export class LibraryEntry<Ref = never> {
  public owned: boolean
  public price?: number
  public url?: string
  public library: Ref | Library<Ref>
  public book?: Ref | Book<Ref>
}
