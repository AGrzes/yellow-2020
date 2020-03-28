import { Class, DataType, ModelAccess, Model, StructuralFeature, Attribute, Relation } from '.'
import { DataAccess } from '../data'
import * as _ from 'lodash'

interface Ref {
    $ref: string
}

export interface NamedDescriptor {
    name: string
}

export interface StructuralFeatureDescriptor extends NamedDescriptor {
    multiplicity: '1' | '?' | '*' | '+'
}

export interface DataTypeDescriptor extends NamedDescriptor {
    nativeType: string
}

export interface AttributeDescriptor extends StructuralFeatureDescriptor {
    type: Ref
}

export interface RelationDescriptor extends StructuralFeatureDescriptor {
    target: Ref
    reverse?: Ref
}

export interface ClassDescriptor extends NamedDescriptor {
    parent?: Ref
    features: {[name: string]: StructuralFeatureDescriptor}
}

export interface ModelDescriptor {
    classes: {[name: string]: ClassDescriptor}
    dataTypes: {[name: string]: DataTypeDescriptor}
}

function isAttributeDescriptor(descriptor: StructuralFeatureDescriptor): descriptor is AttributeDescriptor {
    return !!(descriptor as AttributeDescriptor).type
}

function isRelationDescriptor(descriptor: StructuralFeatureDescriptor): descriptor is RelationDescriptor {
    return !!(descriptor as RelationDescriptor).target
}

export function isAttribute(descriptor: StructuralFeature): descriptor is Attribute {
    return !!(descriptor as Attribute).type
}

export function isRelation(descriptor: StructuralFeature): descriptor is Relation {
    return !!(descriptor as Relation).target
}

function constructStructuralFeature(descriptor: StructuralFeatureDescriptor): StructuralFeature {
    if (isAttributeDescriptor(descriptor)) {
        return {
            type: descriptor.type,
            name: descriptor.name,
            multiplicity: descriptor.multiplicity
        } as unknown as Attribute
    } else if (isRelationDescriptor(descriptor)) {
        return {
            target: descriptor.target,
            reverse: descriptor.reverse,
            name: descriptor.name,
            multiplicity: descriptor.multiplicity
        } as unknown as Attribute
    }
}

function constructClass(descriptor: ClassDescriptor): Class {
    const clazz = {
        parent: descriptor.parent,
        name: descriptor.name,
        features: _.mapValues(descriptor.features,constructStructuralFeature)
    } as unknown as Class
    _.forEach(clazz.features, (sf) => sf.owner = clazz)
    return clazz
}

function constructDataType(descriptor: DataTypeDescriptor): DataType {
    return {
        name: descriptor.name,
        nativeType: descriptor.nativeType
    } as DataType
}

function constructModel(descriptor: ModelDescriptor): Model {
    const model = {
        classes: _.mapValues(descriptor.classes, constructClass),
        dataTypes: _.mapValues(descriptor.dataTypes, constructDataType)
    }
    _.forEach(model.classes, (me) => me.model = model)
    _.forEach(model.dataTypes, (me) => me.model = model)
    return model
}

function resolveRef<T>(models: {[name: string]: Model}, model: Model, ref: Ref): T {
    if (ref && ref.$ref) {
        const parts = ref.$ref.split('#')
        if (!_.isEmpty(parts[0])) {
            model = models[parts[0]]
        }
        return _.get(model, parts[1].replace('/','.'))
    }
}

function resolveParent(models: {[name: string]: Model}, model: Model, clazz: Class) {
    if (clazz.parent) {
        clazz.parent = resolveRef(models,model,clazz.parent as unknown as Ref)
        if (clazz.parent.children) {
            clazz.parent.children.push(clazz)
        } else {
            clazz.parent.children = [clazz]
        }
    }
}

function resolveStructuralFeature(models: {[name: string]: Model}, model: Model, feature: StructuralFeature) {
    if (isAttribute(feature)) {
        feature.type = resolveRef(models,model,feature.type as unknown as Ref)
    }
    if (isRelation(feature)) {
        feature.target = resolveRef(models,model,feature.target as unknown as Ref)
        feature.reverse = resolveRef(models,model,feature.reverse as unknown as Ref)
    }
}

function resolveClassRefs(models: {[name: string]: Model}, model: Model, clazz: Class) {
    resolveParent(models,model,clazz)
    _.forEach(clazz.features,_.partial(resolveStructuralFeature,models,model))
}

function resolveModelRefs(models: {[name: string]: Model}, model: Model) {
    _.forEach(model.classes,_.partial(resolveClassRefs, models,model))
}

function resolveModelsRefs(models: {[name: string]: Model}) {
    _.forEach(models,_.partial(resolveModelRefs,models))
}

export function resolveModels(descriptors: {[name: string]: ModelDescriptor}): {[name: string]: Model} {
    const result = _.mapValues(descriptors, constructModel)
    resolveModelsRefs(result)
    return result
}

export class SimpleModelAccess implements ModelAccess {
    static async loadFromAdapter(modelData: DataAccess<ModelDescriptor,string,any,any>) {
        return new SimpleModelAccess(resolveModels(_.mapValues(_.keyBy( await modelData.list(),'key'),'data')))
    }

    constructor(public models: {[name: string]: Model}) {}
}