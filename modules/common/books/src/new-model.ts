import _ from 'lodash'
import {Observable, Subject} from 'rxjs'
import { CRUD, Entity } from './crud'
import { Index } from './data'

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
}

export class IndexModel implements Model {
  private data: Map<Entity<any>, Record<string, InstanceType<Entity<any>>>> = new Map()
  public index: Index = new Index()
  private changesSubject = new Subject<ModelChange>()
  constructor(private crud: CRUD, private entities: Array<Entity<any>>) {}

  public async load() {
    await Promise.all(_.map(this.entities, async (type) => {
      this.data.set(type, _.keyBy(await this.crud.list(type), type.key))
    }))
    _.forEach(this.entities, (type) => {
      _.forEach(this.data.get(type), _.bind(this.index.index, this.index, type))
    })
    this.crud.changes().subscribe({
      async next(change) {
        if (change.change === 'change') {
          this.data.get(change.entity)[change.key] = await this.crud.get(change.entity, change.key)
        } else {
          delete this.data.get(change.entity)[change.key]
        }
        this.changesSubject.next(change)
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
