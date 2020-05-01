import { Module } from 'vuex';
import { Model } from '@agrzes/yellow-2020-common-model';
import { Class } from '@agrzes/yellow-2020-common-metadata';
export declare class ModelStateAdapter {
    private model;
    constructor(model: Model);
    state<R>(type: Class): Module<any, R>;
}
