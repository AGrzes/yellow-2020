import { RouteConfig } from 'vue-router'
import Vue from 'vue'
import { mapState } from 'vuex'
import { VueConstructor } from 'vue'
import { BookDetails, AuthorDetails, AuthorList, BooksList, BooksCards, BooksTable } from '@agrzes/yellow-2020-web-vue-books'

function itemComponent(type: string, theComponent: VueConstructor) {
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

function listComponent(type: string, theComponent: VueConstructor) {
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


export const bookRoutes: RouteConfig[] = [{
  path: `book/:key`,
  name: `bookDetails`,
  component: itemComponent('book', BookDetails)
},{
  path: `book`,
  name: `bookList`,
  component: listComponent('book', BooksList)
},{
  path: `bookTable`,
  name: `bookTable`,
  component: listComponent('book', BooksTable)
},{
  path: `bookCards`,
  name: `bookCards`,
  component: listComponent('book', BooksCards)
},{
  path: `author/:key`,
  name: `authorDetails`,
  component: itemComponent('author', AuthorDetails)
},{
  path: `author`,
  name: `authorList`,
  component: listComponent('author', AuthorList)
}]