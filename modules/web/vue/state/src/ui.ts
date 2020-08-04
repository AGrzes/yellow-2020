import { UIModel } from '@agrzes/yellow-2020-common-ui-model'
import { Module } from 'vuex'

export default function uiState<R>(model: UIModel): Module<UIModel, R> {
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
