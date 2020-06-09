import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import { uiModel } from '../uiModel'
import { modelRoutes } from '@agrzes/yellow-2020-web-vue-router'
import { navigationMenu } from '@agrzes/yellow-2020-web-vue-components'
Vue.use(VueRouter)

async function router() {
    const model = await uiModel()
    const routes: RouteConfig[] = [{
        name: 'references',
        path: '/references',
        component: {
          template: `
        <div class="container-fluid">
            <div class="row mt-4">
              <div class="col-2">
                <navigation-menu :navigation="navigation"></navigation-menu>
              </div>
              <div class="col-10">
                <router-view></router-view>
              </div>
           </div>
        </div>
           `,
           data() {
               return {
                   navigation: model.navigation
               }
           },
           components: {
               navigationMenu
           }
        },
        children: modelRoutes(await uiModel())
      }]
    return new VueRouter({
        mode: 'history',
        routes,
        linkActiveClass: 'active'
    })
}


export default router
