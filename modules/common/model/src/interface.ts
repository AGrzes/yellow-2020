import {Observable} from 'rxjs'

export interface Relation {
  source: Entity<any>
  sourceKey: string
  sourcePath: string
  sourceNestedPath?: string
  targetPath: string
  targetNestedPath?: string
  target: Entity<any>
  targetKey: string,
  relationEntity?: any
}

export interface Indexer {
  resolveRelationEntity(relation: Relation): any
  relations(type: Entity<any>): Readonly<Record<string, Record<string, any[]>>>
  instances<T>(type: Entity<T>): Readonly<Record<string, InstanceType<Entity<T>>>>
  resolveRelation<T>(target: Entity<T>, targetKey: string, targetPath: string): Relation[]
  index<T>(type: Entity<T>, instance: T): ModelChange[]
  remove<T>(type: Entity<T>, key: string): ModelChange[]
  resolve<T>(type: Entity<T>, key: string): T | string
  relation(relation: Relation): void
  indexRelation<T extends Entity<any>, R extends Entity<any>>(type: T,
                                                              entity: InstanceType<T>,
                                                              property: keyof InstanceType<T> & string,
                                                              targetType: R,
                                                              reverseProperty: keyof InstanceType<R> & string): void
  indexRelationEntity<
    T extends Entity<any>,
    P extends keyof InstanceType<T> & string,
    E extends InstanceType<T>[P][0],
    NP extends keyof E,
    RNP extends keyof E,
    R extends Entity<any>>(type: T,
                           entity: InstanceType<T>,
                           property: P,
                           nestedProperty: NP,
                           targetType: R,
                           reverseProperty: keyof InstanceType<R> & string,
                           reverseNestedProperty: keyof E & string): void
  resolveRelations<T extends Entity<any>, R extends Entity<any>>(type: T,
                                                                 entity: InstanceType<T>,
                                                                 property: keyof InstanceType<T> & string,
                                                                 targetType: R): Array<InstanceType<R> | string>
  resolveRelationEntities<
  T extends Entity<any>,
   P extends keyof InstanceType<T> & string,
   E extends InstanceType<T>[P][0],
   NP extends keyof E,
   RNP extends keyof E,
   R extends Entity<any>>(type: T,
                          entity: InstanceType<T>,
                          property: P,
                          nestedProperty: NP,
                          targetType: R,
                          reverseNestedProperty: keyof E & string): E[]
}

export interface Entity<T> {
  new (...args: any): T
  readonly typeTag: string
  key(instance: T): string
  label(instance: T): string
  index(index: Indexer, instance: T): void
}

export interface Change {
  entity: Entity<any>
  key: string
  change: 'change' | 'delete'
}

export interface CRUD<Key = string> {
  list<T>(clazz: Entity<T>): Promise<T[]>
  get<T>(clazz: Entity<T>, key: Key): Promise<T>
  save<T>(clazz: Entity<T>, instance: T): Promise<T>
  delete<T>(clazz: Entity<T>, key: Key): Promise<T|boolean>
  changes(): Observable<Change>
}

export interface ModelChange {
  change: 'change' | 'addRelation' | 'removeRelation' | 'delete'
}

export interface EntityChange extends ModelChange {
  entity: Entity<any>
  key: string
  change: 'change' | 'delete'
}

export interface RelationChange extends ModelChange, Relation {
  change: 'addRelation' | 'removeRelation'
}

export function isEntityChange(change: ModelChange): change is EntityChange {
  return change.change === 'change' || change.change === 'delete'
}

export function isRelationChange(change: ModelChange): change is RelationChange {
  return change.change === 'addRelation' || change.change === 'removeRelation'
}

export interface Model2 {
  load(): Promise<void>
  list<T>(entity: Entity<T>): Promise<T[]>
  get<T>(entity: Entity<T>, key: string): Promise<T>
  update<T>(entity: Entity<T>, instance: T): Promise<T>
  delete<T>(entity: Entity<T>, key: string): Promise<void>
  changes(): Observable<ModelChange>
  readonly entities: Array<Entity<any>>
  relations(type: Entity<any>): Promise<Readonly<Record<string, Record<string, any[]>>>>
  instances(): Observable<Record<string, Record<string, InstanceType<Entity<any>>>>>
  instanceRelations(): Observable<Record<string, Record<string, Record<string, any[]>>>>
}
