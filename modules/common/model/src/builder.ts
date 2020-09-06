import { Entity, Indexer } from './model'
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

export interface RelationBuilder extends EntityBuilder {
  target(target: string): RelationBuilder
  reverseProperty(target: string): RelationBuilder
  nestedProperty(target: string): RelationBuilder
  reverseNestedProperty(target: string): RelationBuilder
}

export interface EntityBuilder extends EntitiesBuilder {
  name(name: string): EntityBuilder
  key(key: (instance: any) => string): EntityBuilder
  label(label: (instance: any) => string): EntityBuilder
  relation(property: string): RelationBuilder
}

export interface EntitiesBuilder {
  entity(typeTag: string): EntityBuilder
  build(): Entities
}

class RelationBuilderImpl implements RelationBuilder  {
  constructor(private parent: EntityBuilder, private descriptor: Partial<RelationDescriptor>) {}
  target(target: string): RelationBuilder {
    this.descriptor.target = target
    return this
  }
  reverseProperty(reverseProperty: string): RelationBuilder {
    this.descriptor.reverseProperty = reverseProperty
    return this
  }
  nestedProperty(nestedProperty: string): RelationBuilder {
    (this.descriptor as RelationEntityDescriptor).nestedProperty = nestedProperty
    return this
  }
  reverseNestedProperty(reverseNestedProperty: string): RelationBuilder {
    (this.descriptor as RelationEntityDescriptor).reverseNestedProperty = reverseNestedProperty
    return this
  }
  name(name: string): EntityBuilder {
    return this.parent.name(name)
  }
  key(key: (instance: any) => string): EntityBuilder {
    return this.parent.key(key)
  }
  label(label: (instance: any) => string): EntityBuilder {
    return this.parent.label(label)
  }
  relation(property: string) {
    return this.parent.relation(property)
  }
  entity(typeTag: string): EntityBuilder {
    return this.parent.entity(typeTag)
  }
  build(): Entities {
    return this.parent.build()
  }

}

class EntityBuilderImpl implements EntityBuilder  {
  constructor(private parent: EntitiesBuilder, private descriptor: Partial<EntityDescriptor<any>>) {}
  name(name: string): EntityBuilder {
    this.descriptor.name = name
    return this
  }
  key(key: (instance: any) => string): EntityBuilder {
    this.descriptor.key = key
    return this
  }
  label(label: (instance: any) => string): EntityBuilder {
    this.descriptor.label = label
    return this
  }
  relation(property: string) {
    this.descriptor.relations = this.descriptor.relations || []
    const descriptor: Partial<RelationDescriptor> = { property}
    this.descriptor.relations.push(descriptor as RelationDescriptor)
    return new RelationBuilderImpl(this, descriptor)
  }
  entity(typeTag: string): EntityBuilder {
    return this.parent.entity(typeTag)
  }
  build(): Entities {
    return this.parent.build()
  }
}
export class EntitiesBuilderImpl implements EntitiesBuilder {
  public descriptors: Record<string,Partial<EntityDescriptor<any>>> = {}
  entity(typeTag: string): EntityBuilder {
    this.descriptors[typeTag] = this.descriptors[typeTag] || {typeTag}
    return new EntityBuilderImpl(this, this.descriptors[typeTag])
  }
  build(): Entities {
    _.forEach(this.descriptors,(descriptor) => {
      if (!descriptor.name) {
        descriptor.name = _.upperFirst(_.camelCase(descriptor.typeTag))
      }
      if (!descriptor.key && descriptor.label) {
        descriptor.key = (instance: any) => _.kebabCase( descriptor.label(instance))
      } else if (!descriptor.label && descriptor.key) {
        descriptor.label = (instance: any) => _.startCase( descriptor.key(instance))
      } else if (!descriptor.label && !descriptor.key) {
        throw new Error('Entity not configured correctly')
      }
      descriptor.relations = descriptor.relations || []
      _.forEach(descriptor.relations, (relation) => {
        if (!relation.target) {
          if (this.descriptors[relation.property]) {
            relation.target = relation.property
          }else if (this.descriptors[relation.property.replace(/s$/,'')]) {
            relation.target = relation.property.replace(/s$/,'')
          } else {
            throw new Error('Entity not configured correctly')
          }
        }
        
        if (isRelationEntityDescriptor(relation)) {
          if (!relation.reverseProperty) {
            relation.reverseProperty = `^${relation.nestedProperty}`
          }
          if (!relation.reverseNestedProperty) {
            relation.reverseNestedProperty = `^${relation.property}`
          }
        } else {
          if (!relation.reverseProperty) {
            relation.reverseProperty = `^${relation.property}`
          }
        }
        this.descriptors[relation.target].relations = this.descriptors[relation.target].relations || []
        if (!_.find(this.descriptors[relation.target].relations,
          (reverse) => reverse.target === descriptor.typeTag && reverse.property ===relation.reverseProperty)) {
            this.descriptors[relation.target].relations .push({
              property: relation.reverseProperty,
              reverseProperty: relation.property,
              target: descriptor.typeTag,
              nestedProperty: (relation as RelationEntityDescriptor).reverseNestedProperty,
              reverseNestedProperty: (relation as RelationEntityDescriptor).nestedProperty
            } as RelationEntityDescriptor)
        }
      })

    })
    return buildEntities(_.values(this.descriptors) as EntityDescriptor<any>[])
  }
}

export function builder():EntitiesBuilder {
  return new EntitiesBuilderImpl()
}
