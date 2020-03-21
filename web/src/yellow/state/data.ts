import * as _ from 'lodash'
import { Module } from 'vuex'
import { DataAccess } from '../data'
import Vue from 'vue'

export default function dataState<S,R>(access: DataAccess<S,string,string,any>): Module<{[key:string]:S},R> {
    return {
        namespaced: true,
        state: {
        },
        mutations: {
            update(state, data: {[key:string]:S}) {
                _.forEach(data,(value,key) => Vue.set(state,key, value))
            }
        },
        actions: {
            async fetch(context, key?: string) {
                if (key) {
                    context.commit('update', { [key]:await access.get(key)})
                } else {
                    context.commit('update', _.mapValues(_.keyBy(await access.list(),'key'),'data'))
                }
            }
        }
    }
}


