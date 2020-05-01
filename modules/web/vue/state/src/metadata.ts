import * as _ from 'lodash'
import { Module } from 'vuex'
import { DataAccess } from '@agrzes/yellow-2020-common-data'
import { ModelDescriptor, SimpleModelAccess, ModelAccess } from '@agrzes/yellow-2020-common-metadata'

export default function metadataState<R>(access: DataAccess<ModelDescriptor,string,string,any>): Module<ModelAccess,R> {
    return {
        namespaced: true,
        state: {
            models: {}
        },
        mutations: {
            update(state, modelAccess: ModelAccess) {
                state.models = modelAccess.models
            }
        },
        actions: {
            async fetch(context) {
                context.commit('update', await SimpleModelAccess.loadFromAdapter(access))
            }
        }
    }
}


