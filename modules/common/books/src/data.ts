import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import _ from 'lodash'
import {Observable, Subject} from 'rxjs'
import { CRUD, Entity, PouchCRUD } from './crud'
import { Indexer } from './indexer'
import { Author, Book, Genre, Library } from './model'

export interface ModelChange {
  change: 'change' | 'addRelation' | 'removeRelation' | 'delete'
}

export interface EntityChange extends ModelChange {
  entity: Entity<any>
  key: string
  change: 'change' | 'delete'
}

export interface RelationChange extends ModelChange {
  source: Entity<any>
  sourceKey: string
  sourcePath: string
  target: Entity<any>
  targetKey: string
  targetPath?: string
  change: 'addRelation' | 'removeRelation'
}

export function isEntityChange(change: ModelChange): change is EntityChange {
  return change.change === 'change' || change.change === 'delete'
}

export function isRelationChange(change: ModelChange): change is RelationChange {
  return change.change === 'addRelation' || change.change === 'removeRelation'
}

export interface Model {
  load(): Promise<void>
  list<T>(entity: Entity<T>): Promise<T[]>
  get<T>(entity: Entity<T>, key: string): Promise<T>
  update<T>(entity: Entity<T>, instance: T): Promise<T>
  delete<T>(entity: Entity<T>, key: string): Promise<void>
  changes(): Observable<ModelChange>
  readonly entities: Array<Entity<any>>
}

export class IndexModel implements Model {
  private data: Map<Entity<any>, Record<string, InstanceType<Entity<any>>>> = new Map()
  public index: Indexer = new Indexer()
  private changesSubject = new Subject<ModelChange>()
  constructor(private crud: CRUD, public entities: Array<Entity<any>>) {}

  public async load() {
    await Promise.all(_.map(this.entities, async (type) => {
      this.data.set(type, _.keyBy(await this.crud.list(type), type.key))
    }))
    _.forEach(this.entities, (type) => {
      _.forEach(this.data.get(type), _.bind(this.index.index, this.index, type))
    })
    this.crud.changes().subscribe({
      next: async (change) => {
        if (change.change === 'change') {
          const instance = await this.crud.get(change.entity, change.key)
          this.data.get(change.entity)[change.key] = instance
          _.forEach(this.index.index(change.entity, instance), (c) => this.changesSubject.next(c))
        } else {
          delete this.data.get(change.entity)[change.key]
          _.forEach(this.index.remove(change.entity, change.key), (c) => this.changesSubject.next(c))
        }
      }
    })
  }
  public async list<T>(entity: Entity<T>): Promise<T[]> {
    return _.values(this.data.get(entity))
  }
  public async get<T>(entity: Entity<T>, key: string): Promise<T> {
    return this.data.get(entity)[key]
  }
  public async update<T>(entity: Entity<T>, instance: T): Promise<T> {
    return await this.crud.save(entity, instance)
  }
  public async delete<T>(entity: Entity<T>, key: string): Promise<void> {
    await this.crud.delete(entity, key)
  }
  public changes(): Observable<ModelChange> {
    return this.changesSubject
  }

}

export const bookModel = new IndexModel(
  new PouchCRUD(new PouchDB('http://couchdb.home.agrzes.pl:5984/books'), [Author, Book, Genre, Library]),
  [Author, Book, Genre, Library])
