
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
    _.forEach(book.author, (author: string) => index.relation(rel(Book, key, 'author', Author, author, 'books')))
    _.forEach(book.genre, (genre: string) => index.relation(rel(Book, key, 'genre', Genre, genre, 'books')))
    _.forEach(book.libraries, (entry: LibraryEntry<string>) =>
      index.relation(rel(Book, key, 'libraries.library', Library, entry.library as string, 'entries.book', entry)))
  }
  public static resolve(index: Index, book: Book<string>) {
    const key = Book.key(book)
    book.author = _.map([...(book.author || []), ..._.map(index.resolveRelation(Book, key, 'author'), 'sourceKey')],
      (author: string) => index.resolve<Author<string>>(Author, author))
    book.genre = _.map([...book.genre || [], ..._.map(index.resolveRelation(Book, key, 'genre'), 'sourceKey')],
      (genre: string) => index.resolve<Genre<string>>(Genre, genre))
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
    const key = Author.key(author)
    _.forEach(author.books, (book: string) => index.relation(rel(Author, key, 'books', Book, book, 'author')))
  }
  public static resolve<T>(index: Index, author: Author<string>) {
    const key = Author.key(author)
    author.books = _.map([...(author.books || []), ..._.map(index.resolveRelation(Author, key, 'books'), 'sourceKey')],
      (book: string) => index.resolve<Book<string>>(Book, book))
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
    _.forEach(genre.books, (book: string) => index.relation(rel(Genre, key, 'books', Book, book, 'genre')))
  }
  public static resolve<T>(index: Index, genre: Genre<string>) {
    const key = Genre.key(genre)
    genre.books = _.map([...genre.books || [], ..._.map(index.resolveRelation(Genre, key, 'books'), 'sourceKey')],
      (book: string) => index.resolve<Book<string>>(Book, book))
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
      index.relation(rel(Library, key, 'entries.book', Book, entry.book as string, 'libraries.library', entry)))
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
