import { PouchCRUD, PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import { TheIndexer } from '@agrzes/yellow-2020-common-indexer'
import { CRUD, Entity, Indexer, isEntityChange,
  isRelationChange, Model2, ModelChange } from '@agrzes/yellow-2020-common-model'
import _ from 'lodash'
import {merge, Observable, of, Subject} from 'rxjs'
import { map } from 'rxjs/operators'
import { Author, Book, Genre, Library, Series } from './model'

export class IndexModel implements Model2 {
  public index: Indexer = new TheIndexer()
  private changesSubject = new Subject<ModelChange>()
  private instancesSubject = new Subject<Record<string, Array<InstanceType<Entity<any>>>>>()
  private instanceRelationsSubject = new Subject<Readonly<Record<string, Record<string, any[]>>>>()
  constructor(private crud: CRUD, public entities: Array<Entity<any>>) {}

  public async load() {
    await Promise.all(_.map(this.entities, async (type) => {
      _.forEach(_.keyBy(await this.crud.list(type), type.key), _.bind(this.index.index, this.index, type))
    }))
    this.crud.changes().subscribe({
      next: async (change) => {
        if (change.change === 'change') {
          const instance = await this.crud.get(change.entity, change.key)
          _.forEach(this.index.index(change.entity, instance), (c) => this.changesSubject.next(c))
        } else {
          _.forEach(this.index.remove(change.entity, change.key), (c) => this.changesSubject.next(c))
        }
      }
    })
  }
  public async relations(entity: Entity<any>): Promise<Readonly<Record<string, Record<string, any[]>>>> {
    return this.index.relations(entity)
  }
  public async list<T>(entity: Entity<T>): Promise<T[]> {
    return _.values(this.index.instances(entity))
  }
  public async get<T>(entity: Entity<T>, key: string): Promise<T> {
    return this.index.instances(entity)[key]
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
  public instances(): Observable<Record<string, Record<string, InstanceType<Entity<any>>>>> {
    const accumulator = _(this.entities)
      .keyBy('typeTag')
      .mapValues((entity) => _.cloneDeep<Record<string, InstanceType<Entity<any>>>>(this.index.instances(entity)))
      .value()
    return merge(
      of(_.cloneDeep(accumulator)),
      this.changesSubject.pipe(map((change) => {
        if (isEntityChange(change)) {
          const {entity, key} = change
          if (change.change === 'change') {
            accumulator[entity.typeTag] = accumulator[entity.typeTag] || {}
            accumulator[entity.typeTag][key] = this.index.instances(entity)[key]
          } else {
            accumulator[entity.typeTag] = accumulator[entity.typeTag] || {}
            delete accumulator[entity.typeTag][key]
          }
        }
        return _.cloneDeep(accumulator)
      }))
    )
  }

  public instanceRelations(): Observable<Record<string, Record<string, Record<string, any[]>>>> {
    const accumulator = _(this.entities)
    .keyBy('typeTag')
    .mapValues((entity) => _.cloneDeep<Record<string, Record<string, any[]>>>(this.index.relations(entity)))
    .value()

    return merge(
      of(_.cloneDeep(accumulator)),
      this.changesSubject.pipe(map((change) => {
        if (isRelationChange(change)) {
          if (change.change === 'addRelation') {
            accumulator[change.source.typeTag] = accumulator[change.source.typeTag] || {}
            accumulator[change.source.typeTag][change.sourceKey] =
              accumulator[change.source.typeTag][change.sourceKey] || {}
            accumulator[change.source.typeTag][change.sourceKey][change.sourcePath] =
              accumulator[change.source.typeTag][change.sourceKey][change.sourcePath] || []
            accumulator[change.source.typeTag][change.sourceKey][change.sourcePath]
              .push(change.relationEntity
                ? this.index.resolveRelationEntity(change)
                : this.index.resolve(change.target, change.targetKey))
            accumulator[change.target.typeTag] = accumulator[change.target.typeTag] || {}
            accumulator[change.target.typeTag][change.targetKey] =
              accumulator[change.target.typeTag][change.targetKey] || {}
            accumulator[change.target.typeTag][change.targetKey][change.targetPath] =
              accumulator[change.target.typeTag][change.targetKey][change.targetPath] || []
            accumulator[change.target.typeTag][change.targetKey][change.targetPath]
              .push(change.relationEntity
                ? this.index.resolveRelationEntity(change)
                : this.index.resolve(change.source, change.sourceKey))
          } else if (change.change === 'removeRelation') {
            accumulator[change.source.typeTag] = accumulator[change.source.typeTag] || {}
            accumulator[change.source.typeTag][change.sourceKey] =
              accumulator[change.source.typeTag][change.sourceKey] || {}
            accumulator[change.source.typeTag][change.sourceKey][change.sourcePath] =
              accumulator[change.source.typeTag][change.sourceKey][change.sourcePath] || []
            _.remove(accumulator[change.source.typeTag][change.sourceKey][change.sourcePath],
              (instance) => instance === change.targetKey
              || change.target.key(instance) === change.targetKey
              || change.target.key(instance[change.sourceNestedPath]) === change.targetKey)
            accumulator[change.target.typeTag] = accumulator[change.target.typeTag] || {}
            accumulator[change.target.typeTag][change.targetKey] =
              accumulator[change.target.typeTag][change.targetKey] || {}
            accumulator[change.target.typeTag][change.targetKey][change.targetPath] =
              accumulator[change.target.typeTag][change.targetKey][change.targetPath] || []
            _.remove(accumulator[change.target.typeTag][change.targetKey][change.targetPath],
              (instance) => instance === change.sourceKey
              || change.source.key(instance) === change.sourceKey
              || change.source.key(instance[change.targetNestedPath]) === change.sourceKey)
          }
        }
        return _.cloneDeep(accumulator)
      })
    ))
  }
}

export const bookModel = new IndexModel(
  new PouchCRUD(new PouchDB('http://couchdb.home.agrzes.pl:5984/books'), [Author, Book, Genre, Library, Series]),
  [Author, Book, Genre, Library, Series])
