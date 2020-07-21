import { Entity, Model } from '@agrzes/yellow-2020-common-books'
import _ from 'lodash'
import { Module } from 'vuex'

export async function modelState<R>(model: Model):
  Promise<Module<any, any>> {
    return {
        namespaced: true,
        state: {
          entities: _.fromPairs(await Promise.all(_.map(model.entities,
            async (entity) => [entity.typeTag, _.keyBy(await model.list(entity), entity.key)])))
        },
        getters: {
          list: (state) => <T>(entity: Entity<T>) => _.values(state[entity.typeTag]),
          get: (state) => <T>(entity: Entity<T>, key: string) => state[entity.typeTag][key]
        },
        mutations: {
        },
        actions: {
        }
    }
}
