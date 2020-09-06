import Vue, { VueConstructor } from 'vue'
import 'vue-router'
import { mapState } from 'vuex'
import { Entity } from '@agrzes/yellow-2020-common-model'

export function itemComponent(entity: Entity<any>, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component v-if="item" :item="item"></the-component>`,
    computed: {
      ...mapState('model', {
          item(state: any) {
              return state.entities[entity.typeTag][this.$route.params.key]
          }
      })
  },
    components: {
      theComponent
    }
  })
}

export function listComponent(entity: Entity<any>, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component :list="list"></the-component>`,
    computed: {
      ...mapState('model', {
          list(state: any) {
              return state.entities[entity.typeTag]
          }
      })
    },
    components: {
      theComponent
    }
  })
}
