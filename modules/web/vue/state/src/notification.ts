import * as _ from 'lodash'
import { Module } from 'vuex'

export interface Notification {
  content: string
  title: string
  icon?: string
}

export const notifications : Module<{notifications: Notification[]},any>  = {
    namespaced: true,
    state: {
        notifications: []
    },
    mutations: {
        add(state, notification: Notification) {
            state.notifications.push(notification)
        },
        remove(state, notification: Notification) {
          state.notifications.splice(state.notifications.indexOf(notification),1)
        }
    },
    actions: {
        add(context, notification: Notification) {
            context.commit('add', notification)
        },
        remove(context, notification: Notification) {
          context.commit('remove', notification)
        }
    }
}