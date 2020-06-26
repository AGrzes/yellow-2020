import { DataType, Model, Class, Attribute, Relation } from '.'
import _, { Dictionary } from 'lodash'

type Constructor = new (...args: any) => any

type Type = string | Constructor
type NativeType = string | Constructor

interface RootModelBuilder {
  type(type: Type): ClassModelBuilder
  datatype(typeName: string, dataType: NativeType): RootModelBuilder
  datatype(dataType: NativeType): RootModelBuilder
  build(): Model
}

interface ClassModelBuilder extends RootModelBuilder {
  attribute(attributeName: string, datatype: NativeType): AttributeModelBuilder
  relation(relationeName: string, target: Type): RelationModelBuilder
}

interface AttributeModelBuilder extends ClassModelBuilder {
  required(): AttributeModelBuilder
  multiple(): AttributeModelBuilder
}
interface RelationModelBuilder extends ClassModelBuilder {
  required(): RelationModelBuilder
  multiple(): RelationModelBuilder
}

const requiredMap: Record<'1' | '?' | '*' | '+','1' | '?' | '*' | '+'> = {
  '1': '1',
  '?': '1',
  '+': '+',
  '*': '+'
}

const multipleMap: Record<'1' | '?' | '*' | '+','1' | '?' | '*' | '+'> = {
  '1': '+',
  '?': '*',
  '+': '+',
  '*': '*'
}



class RelationModelBuilderImpl implements RelationModelBuilder {
  private theRelation: Relation

  constructor(private parent: ClassModelBuilder, private model: Model, private theType:Class, relationeName: string, target: Type) {
    this.theRelation = {
      model: this.model,
      multiplicity: '?',
      name: relationeName,
      owner: theType,
      target: target as unknown as Class
    }
  }
  build(): Model {
    return this.parent.build()
  }
  required(): AttributeModelBuilder {
    this.theRelation.multiplicity = requiredMap[this.theRelation.multiplicity]
    return this
  }
  multiple(): AttributeModelBuilder {
    this.theRelation.multiplicity = multipleMap[this.theRelation.multiplicity]
    return this
  }
  attribute(attributeName: string, datatype: Type): AttributeModelBuilder {
    return this.parent.attribute(attributeName,datatype)
  }
  relation(attributeName: string, target: Type): RelationModelBuilder {
    return this.parent.relation(attributeName,target)
  }
  type(type: Type): ClassModelBuilder {
    return this.parent.type(type)
  }
  datatype(typeName: any, dataType?: any) {
    return this.parent.datatype(typeName,dataType)
  }
}


class AttributeModelBuilderImpl implements AttributeModelBuilder {
  private theAttribute: Attribute

  constructor(private parent: ClassModelBuilder, private model: Model, private theType:Class, attributeName: string, datatype: NativeType) {
    this.theAttribute = {
      model: this.model,
      multiplicity: '?',
      name: attributeName,
      owner: theType,
      type: null,
    }
  }
  build(): Model {
    return this.parent.build()
  }
  required(): AttributeModelBuilder {
    this.theAttribute.multiplicity = requiredMap[this.theAttribute.multiplicity]
    return this
  }
  multiple(): AttributeModelBuilder {
    this.theAttribute.multiplicity = multipleMap[this.theAttribute.multiplicity]
    return this
  }
  attribute(attributeName: string, datatype: Type): AttributeModelBuilder {
    return this.parent.attribute(attributeName,datatype)
  }
  relation(attributeName: string, target: Type): RelationModelBuilder {
    return this.parent.relation(attributeName,target)
  }
  type(type: Type): ClassModelBuilder {
    return this.parent.type(type)
  }
  datatype(typeName: any, dataType?: any) {
    return this.parent.datatype(typeName,dataType)
  }
}

class ClassModelBuilderImpl implements ClassModelBuilder {
  private theType: Class

  constructor(private parent: RootModelBuilder, private model: Model, type: Type) {
    this.theType = {
      name: _.isString(type) ? type : type.name,
      features: {},
      model
    }
    model.classes[this.theType.name] = this.theType
  }
  build(): Model {
    return this.parent.build()
  }
  attribute(attributeName: string, datatype: Type): AttributeModelBuilder {
    return new AttributeModelBuilderImpl(this, this.model,this.theType,attributeName,datatype)
  }
  relation(attributeName: string, target: Type): RelationModelBuilder {
    return new RelationModelBuilderImpl(this, this.model,this.theType,attributeName,target)
  }
  type(type: Type): ClassModelBuilder {
    return this.parent.type(type)
  }
  datatype(typeName: any, dataType?: any) {
    return this.parent.datatype(typeName,dataType)
  }

}

export class ModelBuilder implements RootModelBuilder {
  protected model: Model = {
    classes: {},
    dataTypes: {}
  }

  type(type: Type): ClassModelBuilder {
    return new ClassModelBuilderImpl(this,this.model,type)
  }
  datatype(typeName: string, dataType: Type): RootModelBuilder
  datatype(dataType: NativeType): RootModelBuilder
  datatype(typeName: string | NativeType, dataType?: NativeType) {
    if (dataType) {
      if (_.isString(dataType)) {
        this.model.dataTypes[typeName as string] = {
          name: typeName as string,
          nativeType: dataType,
          model: this.model
        }
      } else {
        this.model.dataTypes[typeName as string] = {
          name: typeName as string,
          nativeType: dataType.name,
          model: this.model
        }
      }
    } else {
      if (_.isString(typeName)) {
        this.model.dataTypes[typeName] = {
          name: typeName,
          nativeType: typeName,
          model: this.model
        }
      } else {
        const name: string = typeName.name
        this.model.dataTypes[name] = {
          name: name,
          nativeType: name,
          model: this.model
        }
      }
    }
    return this
  }

  build(): Model {
    return this.model
  }

}