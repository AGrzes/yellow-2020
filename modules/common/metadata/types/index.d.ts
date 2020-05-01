export * from './simple';
export interface ModelElement {
    model: Model;
}
export interface Named extends ModelElement {
    name: string;
}
export interface StructuralFeature extends Named {
    owner: Class;
    multiplicity: '1' | '?' | '*' | '+';
}
export interface DataType extends Named {
    nativeType: string;
}
export interface Attribute extends StructuralFeature {
    type: DataType;
}
export interface Relation extends StructuralFeature {
    target: Class;
    reverse?: Relation;
}
export interface Class extends Named {
    parent?: Class;
    children?: Class[];
    features: {
        [name: string]: StructuralFeature;
    };
}
export interface Model {
    classes: {
        [name: string]: Class;
    };
    dataTypes: {
        [name: string]: DataType;
    };
}
export interface ModelAccess {
    models: {
        [name: string]: Model;
    };
}
export declare function fixupModel(model: Model): void;
