import _ from 'lodash'
import { Module } from 'vuex'
import { BookModel } from './data'

export default function modelState<R>(model: BookModel):
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
