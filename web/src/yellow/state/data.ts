import * as _ from 'lodash'
import { Module } from 'vuex'
import { DataAccess } from '../data'

export default function dataState<S,R>(access: DataAccess<S,string,string,any>): Module<{[key:string]:S},R> {
    return {
        namespaced: true,
        state: {
        },
        mutations: {
            update(state, data: {[key:string]:S}) {
                _.assign(state,data)
            }
        },
        actions: {
            async fetch(context, key?: string) {
                if (key) {
                    context.commit('update', { [key]:(await access.get(key)).data})
                } else {
                    context.commit('update', _.mapValues(_.keyBy(await access.list(),'key'),'data'))
                }
            }
        }
    }
}


