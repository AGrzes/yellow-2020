import * as _ from 'lodash'
import { Module } from 'vuex'
import { DataAccess } from '@agrzes/yellow-2020-common-data'
import Vue from 'vue'

export default function dataState<S,R>(access: DataAccess<S,string,string,any>): Module<{[key:string]:S},R> {
    return {
        namespaced: true,
        state: {
        },
        mutations: {
            update(state, data: {[key:string]:S}) {
                _.forEach(data,(value,key) => Vue.set(state,key,value))
            }
        },
        actions: {
            async fetch(context, key?: string) {
                if (key) {
                    const item = await access.get(key)
                    if (item) {
                        context.commit('update', { [key]: item.data})
                    }
                } else {
                    context.commit('update', _.mapValues(_.keyBy(await access.list(),'key'),'data'))
                }
            }
        }
    }
}


