import * as _ from 'lodash'
import { RouteConfig } from 'vue-router'
import { UIModel } from '../ui-model'
import Vue from 'vue'
import { mapState } from 'vuex'
import { modal } from '@agrzes/yellow-vue-components'

const Edit = Vue.extend({
    props: ['content'],
    template: `
  <edit-yaml v-model="current"></edit-yaml>
    `,
    data() {
      return {
        current: this.content
      }
    }
})
const Create = Vue.extend({
    props: ['content'],
    template: `
    <form>
        <div class="form-group">
            <label for="key">Key</label>
            <input type="text" class="form-control" id="key" v-model="key">
        </div>
        <edit-yaml v-model="current"></edit-yaml>
    </form>
    `,
    data() {
      return {
        current: this.content,
        key: ''
      }
    }
})

export function modelRoutes(model: UIModel): RouteConfig[] {
    return [{
        path: '/',
        component: {
            template: `
                <div class="container">
                    <router-view></router-view>
                </div>
            `
        },
        children:  _.flatMap(model.views,(view) => ([{
            path: `${view.pathName}/:key`,
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
                },
                methods: {
                    async edit() {
                        modal({
                          component: Edit,
                          host: this.$el,
                          title: 'Edit',
                          props: {content: await this.$store.dispatch(`${view.dataModel}/raw`,{key:this.$route.params.key})},
                          buttons: [
                            {
                              name: 'Save',
                              onclick:async (m) => {
                                await this.$store.dispatch(`${view.dataModel}/raw`,{key: this.$route.params.key,value: m.component.current})
                                m.close()
                              },
                              class: 'btn-primary'
                            }, {
                              name: 'Cancel',
                              onclick(m) {
                                m.close()
                              },
                              class: 'btn-secondary'
                            }
                          ]
                        })
                    }
                }
            })
        },{
            path: `${view.pathName}`,
            name: `${view.pathName}-list`,
            component: Vue.extend({
                template: `<ul>
                    <li v-for="(item,key) in list">
                        ${view.listItemTemplate}
                        <router-link :to="{name:'${view.pathName}-item', params:{key}}">Details</router-link>
                    </li>
                    <li><a @click="add()">add</a></li>
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
                },
                methods: {
                    async edit(key: string) {
                        modal({
                          component: Edit,
                          host: this.$el,
                          title: 'Edit',
                          props: {content: await this.$store.dispatch(`${view.dataModel}/raw`,{key})},
                          buttons: [
                            {
                              name: 'Save',
                              onclick:async (m) => {
                                await this.$store.dispatch(`${view.dataModel}/raw`,{key,value: m.component.current})
                                m.close()
                              },
                              class: 'btn-primary'
                            }, {
                              name: 'Cancel',
                              onclick(m) {
                                m.close()
                              },
                              class: 'btn-secondary'
                            }
                          ]
                        })
                    },
                    async add() {
                        modal({
                          component: Create,
                          host: this.$el,
                          title: 'Create',
                          props: {content: {}},
                          buttons: [
                            {
                              name: 'Save',
                              onclick:async (m) => {
                                await this.$store.dispatch(`${view.dataModel}/raw`,{key: m.component.key,value: m.component.current})
                                m.close()
                              },
                              class: 'btn-primary'
                            }, {
                              name: 'Cancel',
                              onclick(m) {
                                m.close()
                              },
                              class: 'btn-secondary'
                            }
                          ]
                        })
                    }
                }
            })
        }]))
    }]
}



