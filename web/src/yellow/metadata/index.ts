import * as _ from 'lodash'

export interface ModelElement {
    model: Model
}

export interface Named extends ModelElement {
    name: string
}

export interface StructuralFeature extends Named {
    owner: Class
    multiplicity: '1' | '?' | '*' | '+'
}

export interface DataType extends Named {
    nativeType: string
}

export interface Attribute extends StructuralFeature {
    type: DataType
}

export interface Relation extends StructuralFeature {
    target: Class
    reverse?: Relation
}

export interface Class extends Named {
    parent?: Class
    children?: Class[]
    features: {[name: string]: StructuralFeature}
}

export interface Model {
    classes: {[name: string]: Class}
    dataTypes: {[name: string]: DataType}
}

export interface ModelAccess {
    models: {[name: string]: Model}
}

export function fixupModel(model: Model) {
    _.forEach(model.classes,(clazz) => {
        if(!clazz.model) {
            clazz.model = model
        }
    })
    _.forEach(model.dataTypes,(type) => {
        if(!type.model) {
            type.model = model
        }
    })
}