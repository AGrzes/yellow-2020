import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import { uiModel } from '../uiModel'
import { modelRoutes } from '../yellow/route/model'
Vue.use(VueRouter)
const routes: RouteConfig[] = [...modelRoutes(uiModel)]
const router = new VueRouter({
    mode: 'history',
    routes,
    linkActiveClass: 'active'
})

export default router
