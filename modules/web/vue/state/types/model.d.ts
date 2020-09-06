import { Entity, Model2 } from '@agrzes/yellow-2020-common-model';
import { Module } from 'vuex';
export declare const listRelationResolver: (state: any, entity: Entity<any>, keys: string[], relation: string) => {
    [x: string]: any;
};
export declare const listRelations: (entity: Entity<any>, relations: Record<string, string>) => {
    [x: string]: () => {
        [x: string]: any;
    };
};
export declare const itemRelationResolver: (state: any, entity: Entity<any>, key: string, relation: string) => any;
export declare const itemRelations: (entity: Entity<any>, relations: Record<string, string>) => {
    [x: string]: () => any;
};
export declare function modelState<R>(model: Model2): Promise<Module<any, any>>;
