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
