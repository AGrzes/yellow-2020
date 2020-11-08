import { Library } from '@agrzes/yellow-2020-common-books'
import { SimpleValue, DetailsLink, RelationSection, CardWrapper, DetailsButtons, ValueBadge, BooleanBadge} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { itemRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const LibraryDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<card-wrapper v-if="item">
  <template v-slot:title>
    <value-badge :value="item.kind"></value-badge>
    <simple-value :item="item" property="name"></simple-value>
  </template>
  <template v-slot:default>
    <p v-if="item.description">{{item.description}}</p>
    <relation-section :relation="entries" label="Books">
      <template v-slot:default="{item:entry}">
        <details-link :item="entry.book" class="mr-auto"></details-link>
        <boolean-badge :value="entry.owned" label="Owned"></boolean-badge>
        <a class="btn btn-success btn-sm mr-1" v-if="entry.url" :href="entry.url" target="_blank">
          Buy
          <span class="badge badge-light" v-if="entry.price">{{entry.price}}</span>
        </a>
      </template>
    </relation-section>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="author"></details-buttons>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, SimpleValue, ValueBadge, DetailsLink, BooleanBadge
  },
  computed: {
    ...itemRelations(Library,{entries:'entries'})
  }
})
