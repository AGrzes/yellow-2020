import { defineComponent } from "vue"
import { DetailsLink } from './buttons'

export const SimpleValue = defineComponent({
  props: {
    item: Object,
    property: String
  },
  template: `
  {{item[property]}}
  `,
  components: {DetailsLink}
})

export const RelationSection = defineComponent({
  props: {
    relation: Object,
    label: String
  },
  template: `
    <template v-if="relation">
      <h6 class="card-subtitle">{{label}}</h6>
      <ul>
        <li v-for="item in relation">
          <details-link :item="item"></details-link>
        </li>
      </ul>
    </template>
  `,
  components: {DetailsLink}
})
export const SmallLinks = defineComponent({
  props: {
    relation: Object
  },
  template: `
  <small v-for="item in relation">
    <details-link :item="item"></details-link>
  </small>
  `,
  components: {DetailsLink}
})

export const CountBadge = defineComponent({
  props: {
    value: Object,
    style: String
  },
  template: `
   <span :class="clazz" v-if="value">{{value.length}}</span>
  `,
  computed: {
    clazz() {
      return {
        badge: true,
        'badge-pill': true,
        [`badge-${this.style || 'primary'}`]: true
      }
    }
  }
})

export const CardWrapper = defineComponent({
  template: `
  <div class="card h-100">
    <div class="card-body">
      <h5 v-if="$slots.title" class="card-title"><slot name="title"></slot></h5>
      <slot></slot>
    </div>
    <div class="card-footer text-right">
      <slot name="footer"></slot>
    </div>
  </div>
  `
})

export const ListWrapper = defineComponent({
  props: {
    list: Object
  },
  template: `
  <ul class="list-group">
    <li v-for="(item,key) in list" class="list-group-item">
      <span class="d-flex">
        <span class="mr-auto">
          <slot :item="item" :key="key"></slot>
        </span>
        <span class="flex-grow-0 flex-shrink-0 align-self-center">
          <slot name="itemActions" :item="item" :key="key"></slot>
        </span>
      </span>
    </li>
    <li class="list-group-item">
      <slot name="listActions"></slot>
    </li>
  </ul>
  `
})
