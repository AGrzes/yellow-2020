
import {MenuItem} from '@agrzes/yellow-2020-common-ui-model'
import Vue from 'vue'

export const navigationMenu = Vue.extend({
  props: {
    navigation: Array as () => MenuItem[]
  },
  template: `
<ul class="nav flex-column">
    <menu-item :item="item"  v-for="(item,key) in navigation" :key="key"></menu-item>
</ul>
  `,
  components: {
    menuItem: {
      name: 'menu-item',
      props: {
        item: Object as () => MenuItem
      },
      template: `
      <router-link tag="li" class="nav-item" :to="item.route">
        <a class="nav-link">{{item.label}}</a>
        <ul class="list-unstyled pl-3" v-if="item.children">
            <menu-item :item="childItem" v-for="(childItem,key) in item.children" :key="key"></menu-item>
        </ul>
      </router-link>

      `
    }
  }
})
