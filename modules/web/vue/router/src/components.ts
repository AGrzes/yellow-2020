import Vue, { VueConstructor } from 'vue'
import 'vue-router'
import { mapState } from 'vuex'

export function itemComponent(type: string, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component v-if="item" :item="item"></the-component>`,
    computed: {
        ...mapState(type, {
            item(state) {
                return state[this.$route.params.key]
            }
        })
    },
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.$store.dispatch(`${type}/fetch`, to.params.key)
        })
    },
    beforeRouteUpdate(to, from, next) {
        this.$store.dispatch(`${type}/fetch`, to.params.key)
        next()
    },
    components: {
      theComponent
    }
  })
}

export function listComponent(type: string, theComponent: VueConstructor) {
  return Vue.extend({
    template: `<the-component :list="list"></the-component>`,
    computed: {
        ...mapState(type, {
            list(state) {
                return state
            }
        })
    },
    mounted() {
        this.$store.dispatch(`${type}/fetch`)
    },
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.$store.dispatch(`${type}/fetch`, to.params.key)
        })
    },
    beforeRouteUpdate(to, from, next) {
        this.$store.dispatch(`${type}/fetch`, to.params.key)
        next()
    },
    components: {
      theComponent
    }
  })
}
