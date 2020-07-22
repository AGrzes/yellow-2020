import _ from 'lodash'
import { Entity } from './crud'
import { EntityChange, ModelChange, RelationChange } from './data'

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
export function rel(source: Entity<any>, sourceKey: string, sourcePath: string,
                    target: Entity<any>, targetKey: string, targetPath: string, relationEntity?: any): Relation {
  return _.omitBy({
    source,
    sourceKey,
    sourcePath,
    target,
    targetKey,
    targetPath,
    relationEntity
  }, _.isUndefined) as Relation
}

export function relent(source: Entity<any>, sourceKey: string, sourcePath: string, sourceNestedPath: string,
                       target: Entity<any>, targetKey: string, targetPath: string, targetNestedPath: string,
                       relationEntity?: any): Relation {
  return _.omitBy({
    source,
    sourceKey,
    sourcePath,
    sourceNestedPath,
    target,
    targetKey,
    targetPath,
    targetNestedPath,
    relationEntity
  }, _.isUndefined) as Relation
}

export class Indexer {
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
      (relation) =>
        ({...relation, change: 'addRelation'})))
    const removedRelations: RelationChange[] = _.flatMap(oldRelations,
      (relations, path) => _.map(_.omit(relations, _.keys(newRelations[path])),
      (relation) =>
        ({...relation, change: 'removeRelation'})))
    return [{entity: type, key, change: 'change'} as EntityChange, ...addedRelations, ...removedRelations]
  }

  public remove<T>(type: Entity<T>, key: string): ModelChange[] {
    if (this.entities.has(type)) {
      delete this.entities.get(type)[key]
    } else {
      return []
    }
    const oldRelations = _.mapValues(this.clearRelations(type, key), (relations) => _.keyBy(relations, 'targetKey'))
    const newRelations = {}
    const removedRelations: RelationChange[] = _.flatMap(oldRelations,
      (relations, path) => _.map(_.omit(relations, _.keys(newRelations[path])),
      (relation) =>
        ({...relation, change: 'removeRelation'})))
    return [{entity: type, key, change: 'delete'} as EntityChange, ...removedRelations]
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
      this.relation(relent(type, key, property, nestedProperty as string,
      targetType, entry[nestedProperty] as string, reverseProperty, reverseNestedProperty, entry)))
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
    }), ..._.map(this.resolveRelation(type, key, property), ({sourceKey, relationEntity}) => {
      const clone = _.cloneDeep(relationEntity)
      clone[reverseNestedProperty] = entity
      clone[nestedProperty] = this.resolve(targetType, sourceKey)
      return clone
    })]
  }
}
