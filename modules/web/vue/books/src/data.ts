import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import _ from 'lodash'
import { Author, Book, Genre, Library, LibraryEntry } from './model'

export interface Entity<T> {
  new (...args: any): T
  readonly typeTag: string
  key(instance: T): string
}

interface CRUD<Key = string> {
  list<T>(clazz: Entity<T>): Promise<T[]>
  get<T>(clazz: Entity<T>, key: Key): Promise<T>
  save<T>(clazz: Entity<T>, instance: T): Promise<T>
  delete<T>(clazz: Entity<T>, key: Key): Promise<T|boolean>
}

function materialize<T>(clazz: Entity<T>, data: T): T {
  return Object.create(clazz.prototype, Object.getOwnPropertyDescriptors(data))
}

function materializeClass<T>(clazz: Entity<T>) {
  return (data: T): T => materialize(clazz, data)
}
export class BooksCRUD implements CRUD {
  private revMap = new Map<string, string>()

  constructor(private database: PouchDB.Database, private classes: Array<Entity<any>>) {}

  public async list<T>(clazz: Entity<T>): Promise<T[]> {
    const allDocs = await this.database.allDocs<T>({
      include_docs: true,
      startkey: `${clazz.typeTag}:`,
      endkey: `${clazz.typeTag}:\uffff`
    })
    _.forEach(allDocs.rows, ({doc: {_id, _rev}}) => this.revMap.set(_id, _rev))
    return _.map(_.map(allDocs.rows, 'doc'), materializeClass(clazz))
  }
  public async get<T>(clazz: Entity<T>, key: string): Promise<T> {
    const doc = await this.database.get<T>(`${clazz.typeTag}:${key}`)
    this.revMap.set(doc._id, doc._rev)
    return materialize(clazz, doc)
  }
  public async save<T>(clazz: Entity<T>, instance: T): Promise<T> {
    const id = `${clazz.typeTag}:${clazz.key(instance)}`
    let existing: any = {}
    for (let i = 0; i < 3; i++) {
      try {
        const response = await this.database.put({_id: id, _rev: this.revMap.get(id), ...existing, ...instance})
        return materialize(clazz, {...existing, ...instance})
      } catch (e) {
        if (e.name === 'conflict') {
          existing = await this.database.get<T>(id)
          this.revMap.set(existing._id, existing._rev)
        } else {
          throw e
        }
      }
    }
    throw new Error('Save failed')
  }
  public async delete<T>(clazz: Entity<T>, key: string): Promise<boolean | T> {
    const id = `${clazz.typeTag}:${key}`
    for (let i = 0; i < 3; i++) {
      try {
        await this.database.remove(id, this.revMap.get(id))
        return true
      } catch (e) {
        if (e.name === 'conflict') {
          const doc = await this.database.get<T>(id)
          this.revMap.set(id, doc._rev)
        } else {
          throw e
        }
      }
    }
    throw new Error('Delete failed')
  }

}

export const booksCRUD = new BooksCRUD(
  new PouchDB('http://couchdb.home.agrzes.pl:5984/books'), [Author, Book, Genre, Library])

interface Relation {
  source: Entity<any>
  sourceKey: string
  sourcePath: string
  targetPath: string
  target: Entity<any>
  targetKey: string
}

function rel(source: Entity<any>, sourceKey: string, sourcePath: string,
             target: Entity<any>, targetKey: string, targetPath: string): Relation {
  return {
    source,
    sourceKey,
    sourcePath,
    target,
    targetKey,
    targetPath
  }
}

export class BookModel {
  public books: Record<string, Book<string>>
  public authors: Record<string, Author<string>>
  public genres: Record<string, Genre<string>>
  public libraries: Record<string, Library<string>>
  private forwardRelations: Map<Entity<any>, Record<string, Record<string, Relation[]>>> = new Map()
  private reverseRelations: Map<Entity<any>, Record<string, Record<string, Relation[]>>> = new Map()
  constructor(private crud: BooksCRUD) {}

  public async init() {
    this.books = _.keyBy<Book<string>>(await this.crud.list<Book<string>>(Book), Book.key)
    this.authors = _.keyBy<Author<string>>(await this.crud.list<Author>(Author), Author.key)
    this.genres = _.keyBy<Genre<string>>(await this.crud.list<Genre>(Genre), Genre.key)
    this.libraries = _.keyBy<Library<string>>(await this.crud.list<Library>(Library), Library.key)
    // Index
    _.forEach(this.books, (book) => {
      const key = Book.key(book)
      _.forEach(book.author, (author: string) => this.index(rel(Book, key, 'author', Author, author, 'books')))
      _.forEach(book.genre, (genre: string) => this.index(rel(Book, key, 'genre', Genre, genre, 'books')))
      _.forEach(book.libraries, (entry: LibraryEntry<string>) =>
        this.index(rel(Book, key, 'libraries.library', Library, entry.library as string, 'entries.book')))
    })
    _.forEach(this.authors, (author) => {
      const key = Author.key(author)
      _.forEach(author.books, (book: string) => this.index(rel(Author, key, 'books', Book, book, 'author')))
    })
    _.forEach(this.genres, (genre) => {
      const key = Genre.key(genre)
      _.forEach(genre.books, (book: string) => this.index(rel(Genre, key, 'books', Book, book, 'genre')))
    })
    _.forEach(this.libraries, (library) => {
      const key = Library.key(library)
      _.forEach(library.entries, (entry: LibraryEntry<string>) =>
        this.index(rel(Library, key, 'entries.book', Book, entry.book as string, 'libraries.library')))
    })
    // Resolve
    _.forEach(this.books, (book) => {
      const key = Book.key(book)
      book.author = _.map([...(book.author || []), ...this.resolve(Book, key, 'author')], (author: string) =>
        this.authors[author] || author)
      book.genre = _.map([...book.genre || [], ...this.resolve(Book, key, 'genre')], (genre: string) =>
        this.genres[genre] || genre)
      _.forEach(book.libraries, (library) =>
        library.library = this.libraries[library.library as string] || library.library)
    })
    _.forEach(this.authors, (author) => {
      const key = Author.key(author)
      author.books = _.map([...(author.books || []), ...this.resolve(Author, key, 'books')], (book: string) =>
        this.books[book] || book)
    })
    _.forEach(this.genres, (genre) => {
      const key = Genre.key(genre)
      genre.books = _.map([...genre.books || [], ...this.resolve(Genre, key, 'books')], (book: string) =>
        this.books[book] || book)
    })
    _.forEach(this.libraries, (library) => {
      const key = Library.key(library)

      _.forEach(library.entries, (entry) =>
        entry.book = this.books[entry.book as string] || entry.book)
    })
  }

  private resolve<T>(target: Entity<T>, targetKey: string, targetPath: string): string[] {
    if (this.reverseRelations.has(target)) {
      const rr = this.reverseRelations.get(target)
      return _.map((rr[targetKey] || {})[targetPath] || [], 'sourceKey')
    } else {
      return []
    }
  }

  private index(relation: Relation) {
    if (this.forwardRelations.has(relation.source)) {
      const fr = this.forwardRelations.get(relation.source)
      fr[relation.sourceKey] = fr[relation.sourceKey] || {}
      fr[relation.sourceKey][relation.sourcePath] =  [...(fr[relation.sourceKey][relation.sourcePath] || []), relation]
    } else {
      this.forwardRelations.set(relation.source, {[relation.sourceKey]: {[relation.sourcePath]: [relation]}})
    }
    if (this.reverseRelations.has(relation.target)) {
      const rr = this.reverseRelations.get(relation.target)
      rr[relation.targetKey] = rr[relation.targetKey] || {}
      rr[relation.targetKey][relation.targetPath] = [...(rr[relation.targetKey][relation.targetPath] || []), relation]
    } else {
      this.reverseRelations.set(relation.target, {[relation.targetKey]: {[relation.targetPath]: [relation]}})
    }
  }

}
