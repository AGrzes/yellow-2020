import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import _ from 'lodash'
import { Author, Book, Genre, Library, LibraryEntry } from './model'

export interface Entity<T> {
  new (...args: any): T
  readonly typeTag: string
  key(instance: T): string
  index(index: Index, instance: T): void
  resolve(index: Index, instance: T): void
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

interface Relation {
  source: Entity<any>
  sourceKey: string
  sourcePath: string
  targetPath: string
  target: Entity<any>
  targetKey: string,
  relationData?: any
}

export function rel(source: Entity<any>, sourceKey: string, sourcePath: string,
                    target: Entity<any>, targetKey: string, targetPath: string, relationData?: any): Relation {
  return {
    source,
    sourceKey,
    sourcePath,
    target,
    targetKey,
    targetPath,
    relationData
  }
}

export class Index {
  private entities: Map<Entity<any>, Record<string, InstanceType<Entity<any>>>> = new Map()
  private forwardRelations: Map<Entity<any>, Record<string, Record<string, Relation[]>>> = new Map()
  private reverseRelations: Map<Entity<any>, Record<string, Record<string, Relation[]>>> = new Map()
  public resolveRelation<T>(target: Entity<T>, targetKey: string, targetPath: string): Relation[] {
    if (this.reverseRelations.has(target)) {
      const rr = this.reverseRelations.get(target)
      return (rr[targetKey] || {})[targetPath] || []
    } else {
      return []
    }
  }

  public index<T>(type: Entity<T>, instance: T) {
    if (this.entities.has(type)) {
      this.entities.get(type)[type.key(instance)] = instance
    } else {
      this.entities.set(type, {[type.key(instance)] : instance})
    }
    type.index(this, instance)
  }

  public resolve<T>(type: Entity<T>, key: string): T| string {
    if (this.entities.has(type)) {
      return this.entities.get(type)[key] as T
    } else {
      return key
    }
  }

  public relation(relation: Relation) {
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

  public indexRelation<T extends Entity<any>, R extends Entity<any>>(type: T, entity: InstanceType<T>,
                                                                     property: keyof InstanceType<T> & string,
                                                                     targetType: R,
                                                                     reverseProperty: keyof InstanceType<R> & string ) {
    const key = type.key(entity)
    _.forEach(entity[property],
      (target: string) => this.relation(rel(type, key, property, targetType, target, reverseProperty)))
  }
  public indexRelationEntity<T extends Entity<any>,
    P extends keyof InstanceType<T> & string,
    E extends InstanceType<T>[P][0],
    NP extends keyof E, RNP extends keyof E, R extends Entity<any>>(
    type: T, entity: InstanceType<T>,
    property: P,
    nestedProperty: NP,
    targetType: R,
    reverseProperty: keyof InstanceType<R> & string,
    reverseNestedProperty: keyof E & string) {
    const key = type.key(entity)
    _.forEach(entity[property], (entry: E) =>
      this.relation(rel(type, key, `${property}.${nestedProperty}`,
      targetType, entry[nestedProperty] as string, `${reverseProperty}.${reverseNestedProperty}`, entry)))
  }

  public resolveRelations<T extends Entity<any>, R extends Entity<any>>(
    type: T, entity: InstanceType<T>,
    property: keyof InstanceType<T> & string,
    targetType: R): Array<InstanceType<R> | string> {
    const key = type.key(entity)
    return  _.map([...(entity[property] as string[] || []),
      ..._.map(this.resolveRelation(type, key, property), 'sourceKey')],
      (target: string) => this.resolve<InstanceType<R>>(targetType, target))
  }
}

export class BookModel {
  public books: Record<string, Book<string>>
  public authors: Record<string, Author<string>>
  public genres: Record<string, Genre<string>>
  public libraries: Record<string, Library<string>>
  private index: Index = new Index()
  constructor(private crud: BooksCRUD, private entities: Record<string, Entity<any>>) {}

  public async init() {
    await Promise.all(_.map(this.entities, async (type, name) => {
      this[name] =  _.keyBy(await this.crud.list(type), type.key)
    }))
    _.forEach(this.entities, (type, name) => {
      _.forEach(this[name], _.bind(this.index.index, this.index, type))
    })
    _.forEach(this.entities, (type, name) => {
      _.forEach(this[name], _.partial(type.resolve, this.index))
    })
  }
}

export const booksCRUD = new BooksCRUD(
  new PouchDB('http://couchdb.home.agrzes.pl:5984/books'), [Author, Book, Genre, Library])

export const booksModel = new BookModel(booksCRUD, {books: Book, authors: Author, genres: Genre, libraries: Library})
