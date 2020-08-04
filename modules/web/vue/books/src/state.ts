import { Entity, isRelationChange, Model2, ModelChange, Relation } from '@agrzes/yellow-2020-common-model'
import _ from 'lodash'
import { skip, take } from 'rxjs/operators'
import Vue from 'vue'
import { Module } from 'vuex'

export async function modelState<R>(model: Model2):
  Promise<Module<any, any>> {
    const instances = model.instances()
    const instanceRelations = model.instanceRelations()
    return {
        namespaced: true,
        state: {
          entities: await instances.pipe(take(1)).toPromise(),
          relations: await instanceRelations.pipe(take(1)).toPromise()
        },
        getters: {
          list: (state) => <T>(entity: Entity<T>) => _.values(state[entity.typeTag]),
          get: (state) => <T>(entity: Entity<T>, key: string) => state[entity.typeTag][key]
        },
        mutations: {
          entities(state, entities) {
            Vue.set(state, 'entities', entities)
          },
          relations(state, relations) {
            Vue.set(state, 'relations', relations)
          }
        },
        actions: {
          update<T extends Entity<any>>({}, {item, type}: {item: InstanceType<T>, type: T}) {
            model.update(type, item)
          },
          delete<T extends Entity<any>>({}, {id, type}: {id: string, type: T}) {
            model.delete(type, id)
          },
          async listen({commit}) {
            instances.pipe(skip(1)).subscribe({next(entities) {
              commit('entities', entities)
            }})
            instanceRelations.pipe(skip(1)).subscribe({next(relations) {
              commit('relations', relations)
            }})
          }
        }
    }
}
