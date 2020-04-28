import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import { uiModel } from '../uiModel'
import { modelRoutes } from '../yellow/route/model'
Vue.use(VueRouter)

async function router() {
    const routes: RouteConfig[] = [...modelRoutes(await uiModel())]
    return new VueRouter({
        mode: 'history',
        routes,
        linkActiveClass: 'active'
    })
}


export default router
