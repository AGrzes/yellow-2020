import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import _ from 'lodash'
import { CRUD, Entity, PouchCRUD } from './crud'
import { Author, Book, Genre, Library, LibraryEntry } from './model'
import { EntityChange, ModelChange, RelationChange } from './new-model'

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

  private clearRelations<T>(type: Entity<T>, key: string): Record<string, Relation[]> {
    if (this.forwardRelations.has(type) ) {
      const oldRelations: Record<string, Relation[]> = this.forwardRelations.get(type)[key] || {}
      delete this.forwardRelations.get(type)[key]
      _.forEach(oldRelations,
        (relations) => _.forEach(relations,
          (relation) =>
            _.remove(this.reverseRelations.get(relation.target)[relation.targetKey][relation.targetPath], relation)))
      return oldRelations
    }
    return {}
  }

  public index<T>(type: Entity<T>, instance: T): ModelChange[] {
    const key = type.key(instance)
    if (this.entities.has(type)) {
      this.entities.get(type)[key] = instance
    } else {
      this.entities.set(type, {[key] : instance})
    }
    const oldRelations = _.mapValues(this.clearRelations(type, key), (relations) => _.keyBy(relations, 'targetKey'))

    type.index(this, instance)
    const newRelations = _.mapValues(this.forwardRelations.get(type)[key] || {},
      (relations) => _.keyBy(relations, 'targetKey'))
    const addedRelations: RelationChange[] = _.flatMap(newRelations,
      (relations, path) => _.map(_.omit(relations, _.keys(oldRelations[path])),
      ({source, sourceKey, sourcePath, target, targetKey, targetPath}) =>
        ({source, sourceKey, sourcePath, target, targetKey, targetPath, change: 'addRelation'})))
    const removedRelations: RelationChange[] = _.flatMap(oldRelations,
      (relations, path) => _.map(_.omit(relations, _.keys(newRelations[path])),
      ({source, sourceKey, sourcePath, target, targetKey, targetPath}) =>
        ({source, sourceKey, sourcePath, target, targetKey, targetPath, change: 'removeRelation'})))
    return [{entity: type, key, change: 'change'} as EntityChange, ...addedRelations, ...removedRelations]
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
  public resolveRelationEntities<T extends Entity<any>,
  P extends keyof InstanceType<T> & string,
  E extends InstanceType<T>[P][0],
  NP extends keyof E, RNP extends keyof E, R extends Entity<any>>(
  type: T, entity: InstanceType<T>,
  property: P,
  nestedProperty: NP,
  targetType: R,
  reverseNestedProperty: keyof E & string): E[] {
    const key = type.key(entity)
    return [..._.map(entity[property], (entry: E) => {
      const clone = _.cloneDeep(entry)
      clone[reverseNestedProperty] = entity
      clone[nestedProperty] = this.resolve(targetType, entry[nestedProperty] as string)
      return clone
    }), ..._.map(this.resolveRelation(type, key, `${property}.${nestedProperty}`), ({sourceKey, relationData}) => {
      const clone = _.cloneDeep(relationData)
      clone[reverseNestedProperty] = entity
      clone[nestedProperty] = this.resolve(targetType, sourceKey)
      return clone
    })]
  }
}

export class Model {
  private data: Map<Entity<any>, Record<string, InstanceType<Entity<any>>>> = new Map()
  public index: Index = new Index()
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
  public index: Index = new Index()
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
