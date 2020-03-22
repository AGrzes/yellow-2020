import * as _ from 'lodash'
import { RouteConfig } from 'vue-router'
import { UIModel } from '../ui-model'
import Vue from 'vue'
import { mapState } from 'vuex'

export function modelRoutes(model: UIModel): RouteConfig[] {
    return _.flatMap(model.views,(view) => ([{
        path: `/${view.pathName}/:key`,
        component: Vue.extend({
            template: view.detailsTemplate,
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
    }]))
}



