import { Class } from '@agrzes/yellow-2020-common-metadata'
import { Model } from '@agrzes/yellow-2020-common-model'
import * as _ from 'lodash'
import Vue from 'vue'
import { Module } from 'vuex'

export class ModelStateAdapter {
    public constructor(private model: Model) {}

    public state<R>(type: Class): Module<any, R> {
        const model = this.model
        return {
            namespaced: true,
            state: {
                ...this.model.map(type)
            },
            mutations: {
                update(state, {key, value}) {
                    Vue.set(state, key, value)
                },
                delete(state, key) {
                    Vue.delete(state, key)
                }
            },
            actions: {
                async fetch(context) {
                    //
                },
                async raw(context, {key, value}) {
                    if (value) {
                        await model.raw(type, key, value)
                        context.commit('update', {key, value: model.get(type, key)})
                    } else {
                        return model.raw(type, key)
                    }
                },
                async delete(context, key) {
                    await model.delete(type, key)
                    context.commit('delete', key)
                }
            }
        }
    }
}
