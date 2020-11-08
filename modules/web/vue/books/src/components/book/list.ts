import { Book } from '@agrzes/yellow-2020-common-books'
import { CreateButton,  SimpleValue, ListBadge, ListItemButtons, CountBadge, SmallLinks, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent} from 'vue'
import { listRelations} from '@agrzes/yellow-2020-web-vue-state'
import { PlanReadingButton} from './planReading'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const BooksList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="title"></simple-value>
    <small-links :relation="authors[key]"></small-links>
    <small-links :relation="series[key]"></small-links>
    <list-badge :value="genres[key]"></list-badge>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
    <plan-reading-button :item="item"></plan-reading-button>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Book">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper, PlanReadingButton, ListBadge
  },
  computed: {
    ...listRelations(Book,{authors: 'author',genres:'genre',series:'series'})
  }
})
