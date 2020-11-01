import { defineComponent } from "vue"
import { DetailsLink } from './buttons'

export const RelationSection = defineComponent({
  props: {
    relation: Object,
    label: String
  },
  template: `
    <template v-if="relation">
      <h2>{{label}}</h2>
      <ul>
        <li v-for="item in relation">
          <details-link :item="item"></details-link>
        </li>
      </ul>
    </template>
  `,
  components: {DetailsLink}
})

