import { Entity, isRelationChange, Model, ModelChange, Relation } from '@agrzes/yellow-2020-common-books'
import _ from 'lodash'
import Vue from 'vue'
import { Module } from 'vuex'

export async function modelState<R>(model: Model):
  Promise<Module<any, any>> {
    return {
        namespaced: true,
        state: {
          entities: _.fromPairs(await Promise.all(_.map(model.entities,
            async (entity) => [entity.typeTag, _.keyBy(await model.list(entity), entity.key)]))),
          relations: _.fromPairs(await Promise.all(_.map(model.entities,
            async (entity) => [entity.typeTag, await model.relations(entity)])))
        },
        getters: {
          list: (state) => <T>(entity: Entity<T>) => _.values(state[entity.typeTag]),
          get: (state) => <T>(entity: Entity<T>, key: string) => state[entity.typeTag][key]
        },
        mutations: {
          change(state, change: ModelChange) {
            if (isRelationChange(change)) {
              if (change.change === 'addRelation') {
                state.relations[change.source.typeTag] = state.relations[change.source.typeTag] || {}
                state.relations[change.source.typeTag][change.sourceKey] =
                  state.relations[change.source.typeTag][change.sourceKey] || {}
                state.relations[change.source.typeTag][change.sourceKey][change.sourcePath] =
                  state.relations[change.source.typeTag][change.sourceKey][change.sourcePath] || []
                state.relations[change.source.typeTag][change.sourceKey][change.sourcePath]
                  .push(model.get(change.target, change.targetKey))
                state.relations[change.target.typeTag] = state.relations[change.target.typeTag] || {}
                state.relations[change.target.typeTag][change.targetKey] =
                  state.relations[change.target.typeTag][change.targetKey] || {}
                state.relations[change.target.typeTag][change.targetKey][change.targetPath] =
                  state.relations[change.target.typeTag][change.targetKey][change.targetPath] || []
                state.relations[change.target.typeTag][change.targetKey][change.targetPath]
                  .push(model.get(change.source, change.sourceKey))
              } else if (change.change === 'removeRelation') {
                state.relations[change.source.typeTag] = state.relations[change.source.typeTag] || {}
                state.relations[change.source.typeTag][change.sourceKey] =
                  state.relations[change.source.typeTag][change.sourceKey] || {}
                state.relations[change.source.typeTag][change.sourceKey][change.sourcePath] =
                  state.relations[change.source.typeTag][change.sourceKey][change.sourcePath] || []
                _.remove(state.relations[change.source.typeTag][change.sourceKey][change.sourcePath],
                  (instance) => instance === change.targetKey || change.target.key(instance) === change.targetKey)
                state.relations[change.target.typeTag] = state.relations[change.target.typeTag] || {}
                state.relations[change.target.typeTag][change.targetKey] =
                  state.relations[change.target.typeTag][change.targetKey] || {}
                state.relations[change.target.typeTag][change.targetKey][change.targetPath] =
                  state.relations[change.target.typeTag][change.targetKey][change.targetPath] || []
                _.remove(state.relations[change.target.typeTag][change.targetKey][change.targetPath],
                  (instance) => instance === change.sourceKey || change.source.key(instance) === change.sourceKey)
              }
            }
          },
          entities(state, entities) {
            console.log(entities)
            Vue.set(state, 'entities', entities)
          }
        },
        actions: {
          update<T extends Entity<any>>({commit}, {item, type}: {item: InstanceType<T>, type: T}) {
            model.update(type, item)
          },
          listen({commit}) {
            model.changes().subscribe({next(change) {
              commit('change', change)
            }})
            model.instances().subscribe({next(entities) {
              commit('entities', entities)
            }})
          }
        }
    }
}
