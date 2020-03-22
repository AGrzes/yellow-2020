import * as _ from 'lodash'
import { RouteConfig } from 'vue-router'
import { UIModel } from '../ui-model'
import Vue from 'vue'
import { mapState } from 'vuex'

export function modelRoutes(model: UIModel): RouteConfig[] {
    return _.flatMap(model.views,(view) => ([{
        path: `/${view.pathName}/:key`,
        name: `${view.pathName}-item`,
        component: Vue.extend({
            template: `<div v-if="item">
    ${view.detailsTemplate}
    <router-link :to="{name:'${view.pathName}-list'}">Back</router-link>
</div>`,
            computed: {
                ...mapState(view.dataModel,{
                    item (state) {
                        return state[this.$route.params.key]
                    }
                })
            },
            beforeRouteEnter (to, from, next) {
                next(vm => {
                    vm.$store.dispatch(`${view.dataModel}/fetch`,to.params.key)
                })
            },
            beforeRouteUpdate (to, from, next) {
                this.$store.dispatch(`${view.dataModel}/fetch`,to.params.key)
                next()
            }
        })
    },{
        path: `/${view.pathName}`,
        name: `${view.pathName}-list`,
        component: Vue.extend({
            template: `<ul>
                <li v-for="(item,key) in list">
                    ${view.listItemTemplate}
                    <router-link :to="{name:'${view.pathName}-item', params:{key}}">Details</router-link>
                </li>
            </ul>`,
            computed: {
                ...mapState(view.dataModel,{
                    list (state) {
                        return state
                    }
                })
            },
            mounted() {
                this.$store.dispatch(`${view.dataModel}/fetch`)
            }
        })
    }]))
}



