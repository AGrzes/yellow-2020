import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import { navigationMenu, NotificationsList } from '@agrzes/yellow-2020-web-vue-components'
import { createWebHistory, RouteRecordRaw, createRouter } from 'vue-router'
import { uiModel } from '../uiModel'

async function router() {
    const model = await uiModel()
    const routes: RouteRecordRaw[] = [{
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
        children: [...registry.routerRegistry.routes]
      }]
    return createRouter({
        history: createWebHistory(),
        routes,
        linkActiveClass: 'active'
    })
}

export default router
