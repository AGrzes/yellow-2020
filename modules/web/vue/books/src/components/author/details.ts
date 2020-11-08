import { Author } from '@agrzes/yellow-2020-common-books'
import { RelationSection, CardWrapper, DetailsButtons, SimpleValue} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { itemRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const AuthorDetails = defineComponent({
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
    <relation-section :relation="series" label="Series"></relation-section>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="author"></details-buttons>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, SimpleValue
  },
  computed: {
    ...itemRelations(Author,{books:'books',series: 'series'})
  }
})
