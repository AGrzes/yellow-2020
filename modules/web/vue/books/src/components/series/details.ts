import { Series} from '@agrzes/yellow-2020-common-books'
import { SimpleValue, RelationSection, CardWrapper, DetailsButtons} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import {  itemRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const SeriesDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<card-wrapper v-if="item">
  <template v-slot:title>
    <simple-value :item="item" property="name"></simple-value>
  </template>
  <template v-slot:default>
    <relation-section :relation="books" label="Books"></relation-section>
    <relation-section :relation="authors" label="Authors"></relation-section>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="series"></details-buttons>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, SimpleValue
  },
  computed: {
    ...itemRelations(Series,{books:'books',authors:'author'})
  }
})
