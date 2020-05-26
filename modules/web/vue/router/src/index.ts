import { EntityView, UIModel } from '@agrzes/yellow-2020-common-ui-model'
import { modal } from '@agrzes/yellow-vue-components'
import '@fortawesome/fontawesome-free/css/all.css'
import * as _ from 'lodash'
import Vue from 'vue'
import { RouteConfig } from 'vue-router'
import { ThisTypedComponentOptionsWithArrayProps } from 'vue/types/options'
import { mapState } from 'vuex'

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

function itemComponent(view: EntityView) {
  return Vue.extend({
    template: `<div v-if="item">
<list-item :item="item"></list-item>
<router-link :to="{name:'${view.pathName}-list'}">Back</router-link>
</div>`,
    computed: {
        ...mapState(view.dataModel, {
            item(state) {
                return state[this.$route.params.key]
            }
        })
    },
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.$store.dispatch(`${view.dataModel}/fetch`, to.params.key)
        })
    },
    beforeRouteUpdate(to, from, next) {
        this.$store.dispatch(`${view.dataModel}/fetch`, to.params.key)
        next()
    },
    components: {
      'list-item': {
        props: ['item'],
        template: view.detailsTemplate
      }
    },
    methods: {
        async edit() {
            modal({
              component: Edit,
              host: this.$el,
              title: 'Edit',
              props: {content: await this.$store.dispatch(`${view.dataModel}/raw`, {
                key: this.$route.params.key
              })},
              buttons: [
                {
                  name: 'Save',
                  onclick: async (m) => {
                    await this.$store.dispatch(`${view.dataModel}/raw`,
                      {
                        key: this.$route.params.key,
                        value: m.component.current
                      })
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
}

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
        children:  _.flatMap(model.views, (view) => ([{
            path: `${view.pathName}/:key`,
            name: `${view.pathName}-item`,
            component: itemComponent(view)
        }, {
            path: `${view.pathName}`,
            name: `${view.pathName}-list`,
            component: Vue.extend({
                template: `<ul class="list-group">
                    <li v-for="(item,key) in list" class="list-group-item">
                      <span class="d-flex">
                        <span class="mr-auto">
                        ${view.listItemTemplate}
                        </span>
                        <span class="flex-grow-0 flex-shrink-0 align-self-center">
                          <button @click="edit(key)" class="btn btn-outline-primary" type="button" title="Edit">
                            <i class="fas fa-edit"></i>
                          </button>
                          <router-link :to="{name:'${view.pathName}-item', params:{key}}" class="btn btn-outline-info" role="button" title="Details">
                            <i class="fas fa-eye"></i>
                          </router-link>
                          <button @click="remove(key)" class="btn btn-outline-danger" type="button" title="Delete">
                            <i class="fas fa-trash"></i>
                          </button>
                        </span>
                      </span>
                    </li>
                    <li class="list-group-item"><a @click="add()">add</a></li>
                </ul>`,
                computed: {
                    ...mapState(view.dataModel, {
                        list(state) {
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
                          props: {content: await this.$store.dispatch(`${view.dataModel}/raw`, {key})},
                          buttons: [
                            {
                              name: 'Save',
                              onclick: async (m) => {
                                await this.$store.dispatch(`${view.dataModel}/raw`, {key, value: m.component.current})
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
                    async remove(key: string) {
                        await this.$store.dispatch(`${view.dataModel}/delete`, key)
                    },
                    async add() {
                        modal({
                          component: Create,
                          host: this.$el,
                          title: 'Create',
                          props: {content: {key: 'value'}},
                          buttons: [
                            {
                              name: 'Save',
                              onclick: async (m) => {
                                await this.$store.dispatch(`${view.dataModel}/raw`, {key: m.component.key, value: m.component.current})
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
