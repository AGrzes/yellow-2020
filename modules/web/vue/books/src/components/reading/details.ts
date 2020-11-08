import { Reading } from '@agrzes/yellow-2020-common-books'
import { DetailsLink, ValueBadge, RelationSection, CardWrapper, DetailsButtons, SimpleValue } from '@agrzes/yellow-2020-web-vue-components'
import { FinishReadingButton } from './finishReading'
import { ReadingProgressButton } from './readingProgress'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { itemSingleRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const ReadingDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<card-wrapper v-if="item">
  <template v-slot:title>
    <simple-value :item="item" property="startDate"></simple-value>
    <details-link :item="book"></details-link>
    <value-badge :value="item.status"></value-badge>
  </template>
  <template v-slot:default>
    <ul class="list-group">
      <li class="list-group-item" v-for="increment in item.progress">
        <small>
          {{increment.date}}
        </small>
        <span class="badge badge-pill badge-success">
        {{increment.progress}}
        </span>
        <span class="badge badge-pill badge-primary" v-if="increment.change">
          +{{increment.change}}
        </span>
      </li>
    </ul>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="reading"></details-buttons>
    <reading-progress-button :item="item"></reading-progress-button>
    <finish-reading-button :item="item"></finish-reading-button>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, SimpleValue, FinishReadingButton, ReadingProgressButton, DetailsLink, ValueBadge
  },
  computed: {
    ...itemSingleRelations(Reading,{book:'book'})
  }
})
