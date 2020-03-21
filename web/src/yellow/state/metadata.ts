import * as _ from 'lodash'
import { Module } from 'vuex'
import { DataAccess } from '../data'
import { ModelDescriptor, SimpleModelAccess } from '../metadata/simple'
import { ModelAccess } from '../metadata'

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


