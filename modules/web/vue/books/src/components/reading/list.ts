import { Reading } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DetailsLink, ValueBadge,
  ListItemButtons, SimpleValue, CountBadge, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
import { FinishReadingButton } from './finishReading'
import { ReadingProgressButton } from './readingProgress'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listSingleRelations, itemSingleRelations, itemSingleRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const ReadingList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="startDate"></simple-value>
    <details-link :item="book[key]"></details-link>
    <value-badge :value="item.status"></value-badge>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
    <reading-progress-button :item="item"></reading-progress-button>
    <finish-reading-button :item="item"></finish-reading-button>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Reading">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, ListWrapper, ValueBadge, FinishReadingButton, ReadingProgressButton, DetailsLink
  },
  computed: {
    ...listSingleRelations(Reading,{book: 'book'})
  }
})
