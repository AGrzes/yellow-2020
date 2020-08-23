import { Entity, Indexer } from './interface'
import _ from 'lodash'

export interface Entities {
  [typeTag: string]: Entity<any>
}

export interface RelationDescriptor {
  property: string
  target: string 
  reverseProperty: string
}

export interface RelationEntityDescriptor extends RelationDescriptor {
  nestedProperty: string
  reverseNestedProperty: string
}

function isRelationEntityDescriptor(d: RelationDescriptor): d is RelationEntityDescriptor {
  return !!(d as RelationEntityDescriptor).nestedProperty
}

interface EntityDescriptor<T> {
  name: string
  typeTag: string
  key(instance: T): string
  label(instance: T): string
  relations: RelationDescriptor[]
}


export function buildEntities(descriptors: EntityDescriptor<any>[]): Record<string,Entity<any>> {
  const entities = _(descriptors).keyBy('typeTag').mapValues((descriptor): Entity<any> => {
    const {[descriptor.name]: entity} = {[descriptor.name]: class {
      static key = descriptor.key
      static label = descriptor.label
      static typeTag = descriptor.typeTag
      static index = () => null
    }}
    return entity
  }).value()

  _.forEach(descriptors, (descriptor) => {
    const entity = entities[descriptor.typeTag]
    entity.index = (index: Indexer, instance: any) => {
      _.forEach(descriptor.relations, (relation) => {
        if (isRelationEntityDescriptor(relation)) {
          index.indexRelationEntity(entity, instance, 
            relation.property, relation.nestedProperty, 
            entities[relation.target], 
            relation.reverseProperty, relation.reverseNestedProperty)
        } else {
          index.indexRelation(entity, instance, 
            relation.property, 
            entities[relation.target], 
            relation.reverseProperty)
        }
      })
    }
  })
  return entities
}