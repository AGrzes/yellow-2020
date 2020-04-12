import * as _ from 'lodash'
import { Module } from 'vuex'
import { Model } from '../model'
import { Class } from '../metadata'
import Vue from 'vue'

export class ModelStateAdapter {
    public constructor(private model: Model) {}

    public state<R>(type: Class): Module<any,R> {
        const model=this.model
        return {
            namespaced: true,
            state: {
                ...this.model.map(type)
            },
            mutations: {
                update(state,{key,value}) {
                    Vue.set(state,key,value)
                }
            },
            actions: {
                async fetch(context) {
                    //
                },
                async raw(context,{key,value}) {
                    if (value) {
                        await model.raw(type,key,value)
                        context.commit('update',{key,value: model.get(type,key)})
                    } else {
                        return model.raw(type,key)
                    }
                }
            }
        }
    }
}