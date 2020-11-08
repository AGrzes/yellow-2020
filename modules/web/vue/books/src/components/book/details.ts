import { Book } from '@agrzes/yellow-2020-common-books'
import { CardWrapper, RelationSection, DetailsButtons, SimpleValue, ListBadge} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent} from 'vue'
import { itemRelations } from '@agrzes/yellow-2020-web-vue-state'
import { PlanReadingButton } from './planReading'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const BookDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<card-wrapper v-if="item">
  <template v-slot:title>
    <simple-value :item="item" property="title"></simple-value>
    <list-badge :value="genres"></list-badge>
  </template>
  <template v-slot:default>
    <relation-section :relation="authors" label="Authors"></relation-section>
    <relation-section :relation="series" label="Series"></relation-section>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="book"></details-buttons>
    <plan-reading-button :item="item"></plan-reading-button>
  </template>
</card-wrapper>
`,
  components: {
    PlanReadingButton, CardWrapper, RelationSection, DetailsButtons, SimpleValue, ListBadge
  },
  computed: {
    ...itemRelations(Book,{authors:'author',genres:'genre',series: 'series'})
  }
})
