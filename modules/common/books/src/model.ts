
import _ from 'lodash'
import { Indexer } from './indexer'

export class Book<Ref = string> {
  public title: string
  public description?: string
  public author: Array<Ref | Author<Ref>>
  public genre: Array<Ref | Genre<Ref>>
  public series: Array<Ref | Series<Ref>>
  public libraries: Array<LibraryEntry<Ref>>
  public static typeTag = 'book'
  public static key<T>(book: Book<T>) {
    return _.kebabCase(book.title)
  }
  public static index(index: Indexer, book: Book<string>) {
    const key = Book.key(book)
    index.indexRelation(Book, book, 'author', Author, 'books')
    index.indexRelation(Book, book, 'genre', Genre, 'books')
    index.indexRelationEntity(Book, book, 'libraries', 'library', Library, 'entries', 'book')
  }
  public static resolveAuthor(index: Indexer, book: Book<string>) {
    return index.resolveRelations(Book, book, 'author', Author) as Array<string | Author<string>>
  }
  public static resolveGenre(index: Indexer, book: Book<string>) {
    return index.resolveRelations(Book, book, 'genre', Genre) as Array<string | Genre<string>>
  }
  public static resolveLibraries(index: Indexer, book: Book<string>) {
    return index.resolveRelationEntities(Book, book, 'libraries', 'library', Library, 'book')
  }
}

export class Author<Ref = never> {
  public name: string
  public books: Array<Ref | Book<Ref>>
  public static typeTag = 'author'
  public static key<T>(author: Author<T>) {
    return _.kebabCase(author.name)
  }
  public static index<T>(index: Indexer, author: Author<string>) {
    index.indexRelation(Author, author, 'books', Book, 'author')
  }
  public static resolveBooks(index: Indexer, author: Author<string>) {
    return index.resolveRelations(Author, author, 'books', Book) as Array<string | Book<string>>
  }
}

export class Genre<Ref = never> {
  public name: string
  public books: Array<Ref | Book<Ref>>
  public static typeTag = 'genre'
  public static key<T>(genre: Genre<T>) {
    return _.kebabCase(genre.name)
  }
  public static index<T>(index: Indexer, genre: Genre<string>) {
    index.indexRelation(Genre, genre, 'books', Book, 'genre')
  }
  public static resolveBooks(index: Indexer, genre: Genre<string>) {
    return index.resolveRelations(Genre, genre, 'books', Book) as Array<string | Book<string>>
  }
}

export class Series<Ref = never> {
  public name: string
  public books: Array<Ref | Book<Ref>>
  public static typeTag = 'series'
  public static key<T>(series: Series<T>) {
    return _.kebabCase(series.name)
  }
  public static index<T>(index: Indexer, series: Series<string>) {
    index.indexRelation(Series, series, 'books', Book, 'series')
  }
  public static resolveBooks(index: Indexer, series: Series<string>) {
    return index.resolveRelations(Series, series, 'books', Book) as Array<string | Book<string>>
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
  public static index<T>(index: Indexer, library: Library<string>) {
    index.indexRelationEntity(Library, library, 'entries', 'book', Book, 'libraries', 'library')
  }
  public static resolveEntries(index: Indexer, library: Library<string>) {
    return index.resolveRelationEntities(Library, library, 'entries', 'book', Book, 'library')
  }
}

export class LibraryEntry<Ref = never> {
  public owned: boolean
  public price?: number
  public url?: string
  public library: Ref | Library<Ref>
  public book?: Ref | Book<Ref>
}
