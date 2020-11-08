import { Author} from '@agrzes/yellow-2020-common-books'
import { CreateButton,  ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const AuthorList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="name"></simple-value>
    <count-badge :value="books[key]"></count-badge>
    <small-links :relation="series[key]"></small-links>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Author">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper
  },
  computed: {
    ...listRelations(Author,{books: 'books',series:'series'})
  }
})
