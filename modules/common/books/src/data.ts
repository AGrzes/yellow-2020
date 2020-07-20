import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import _ from 'lodash'
import { CRUD, Entity, PouchCRUD } from './crud'
import { Indexer } from './indexer'
import { Author, Book, Genre, Library } from './model'

export class Model {
  private data: Map<Entity<any>, Record<string, InstanceType<Entity<any>>>> = new Map()
  public index: Indexer = new Indexer()
  constructor(private crud: CRUD, private entities: Array<Entity<any>>) {}

  public async init() {
    await Promise.all(_.map(this.entities, async (type) => {
      this.data.set(type, _.keyBy(await this.crud.list(type), type.key))
    }))
    _.forEach(this.entities, (type) => {
      _.forEach(this.data.get(type), _.bind(this.index.index, this.index, type))
    })
  }
}

export class BookModel {
  public books: Record<string, Book<string>>
  public authors: Record<string, Author<string>>
  public genres: Record<string, Genre<string>>
  public libraries: Record<string, Library<string>>
  public index: Indexer = new Indexer()
  constructor(private crud: PouchCRUD, private entities: Record<string, Entity<any>>) {}

  public async init() {
    await Promise.all(_.map(this.entities, async (type, name) => {
      this[name] =  _.keyBy(await this.crud.list(type), type.key)
    }))
    _.forEach(this.entities, (type, name) => {
      _.forEach(this[name], _.bind(this.index.index, this.index, type))
    })
  }
}

export const booksCRUD = new PouchCRUD(
  new PouchDB('http://couchdb.home.agrzes.pl:5984/books'), [Author, Book, Genre, Library])

export const booksModel = new BookModel(booksCRUD, {books: Book, authors: Author, genres: Genre, libraries: Library})
