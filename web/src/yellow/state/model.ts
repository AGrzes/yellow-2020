import * as _ from 'lodash'
import { Module } from 'vuex'
import { Model } from '../model'
import { Class } from '../metadata'


export class ModelStateAdapter {
    public constructor(private model: Model) {}

    public state<R>(type: Class): Module<any,R> {
        return {
            namespaced: true,
            state: {
                ...this.model.map(type)
            },
            actions: {
                async fetch(context) {
                    //
                }
            }
        }
    }
}
