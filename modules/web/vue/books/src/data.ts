import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import _ from 'lodash'
import { Author, Book, Genre, Library } from './model'

interface Entity<T> {
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
        return materialize(clazz, {...existing, instance})
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
          this.revMap.set(doc._id, doc._rev)
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