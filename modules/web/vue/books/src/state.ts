import { BookModel } from '@agrzes/yellow-2020-common-books'
import _ from 'lodash'
import { Module } from 'vuex'

export function modelState<R>(model: BookModel):
  Module<Pick<BookModel, 'books'| 'authors'| 'genres'| 'libraries'>, R> {
    return {
        namespaced: true,
        state: {
          ..._.pick(model, 'books', 'authors', 'genres', 'libraries')
        },
        mutations: {
        },
        actions: {
        }
    }
}
