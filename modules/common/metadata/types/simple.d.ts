import { ModelAccess, Model, StructuralFeature, Attribute, Relation } from '.';
import { DataAccess } from '@agrzes/yellow-2020-common-data';
interface Ref {
    $ref: string;
}
export interface NamedDescriptor {
    name: string;
}
export interface StructuralFeatureDescriptor extends NamedDescriptor {
    multiplicity: '1' | '?' | '*' | '+';
}
export interface DataTypeDescriptor extends NamedDescriptor {
    nativeType: string;
}
export interface AttributeDescriptor extends StructuralFeatureDescriptor {
    type: Ref;
}
export interface RelationDescriptor extends StructuralFeatureDescriptor {
    target: Ref;
    reverse?: Ref;
}
export interface ClassDescriptor extends NamedDescriptor {
    parent?: Ref;
    features: {
        [name: string]: StructuralFeatureDescriptor;
    };
}
export interface ModelDescriptor {
    classes: {
        [name: string]: ClassDescriptor;
    };
    dataTypes: {
        [name: string]: DataTypeDescriptor;
    };
}
export declare function isAttribute(descriptor: StructuralFeature): descriptor is Attribute;
export declare function isRelation(descriptor: StructuralFeature): descriptor is Relation;
export declare function resolveModels(descriptors: {
    [name: string]: ModelDescriptor;
}): {
    [name: string]: Model;
};
export declare class SimpleModelAccess implements ModelAccess {
    models: {
        [name: string]: Model;
    };
    static loadFromAdapter(modelData: DataAccess<ModelDescriptor, string, any, any>): Promise<SimpleModelAccess>;
    constructor(models: {
        [name: string]: Model;
    });
}
export {};
