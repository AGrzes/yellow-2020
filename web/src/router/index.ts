import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
Vue.use(VueRouter)
const routes: RouteConfig[] = []
const router = new VueRouter({
    mode: 'history',
    routes,
    linkActiveClass: 'active'
})

export default router
