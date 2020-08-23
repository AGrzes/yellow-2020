import { bookRoutes} from '@agrzes/yellow-2020-web-vue-books'
import { navigationMenu, NotificationsList } from '@agrzes/yellow-2020-web-vue-components'
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import { uiModel } from '../uiModel'
Vue.use(VueRouter)

async function router() {
    const model = await uiModel()
    const routes: RouteConfig[] = [{
        name: 'references',
        path: '/references',
        component: {
          template: `
        <div class="container-fluid">
            <notifications-list></notifications-list>
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
               navigationMenu, NotificationsList
           }
        },
        children: [...bookRoutes]
      }]
    return new VueRouter({
        mode: 'history',
        routes,
        linkActiveClass: 'active'
    })
}

export default router
