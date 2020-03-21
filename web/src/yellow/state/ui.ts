import { Module } from 'vuex'
import { UIModel } from '../ui-model'

export default function uiState<R>(model: UIModel): Module<UIModel,R> {
    return {
        namespaced: true,
        state: model,
        actions: {
            async fetch(context) {
                //
            }
        }
    }
}


