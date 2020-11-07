import { Genre } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton,
  DetailsLink, EditButton, ListButton, ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper,
  RelationSection, CardWrapper, DetailsButtons} from '@agrzes/yellow-2020-web-vue-components'
import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listRelations, itemRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const GenreList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="name"></simple-value>
    <count-badge :value="books[key]"></count-badge>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Genre">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper
  },
  computed: {
    ...listRelations(Genre,{books: 'books'})
  }
})

export const GenreDetails = defineComponent({
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
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="genre"></details-buttons>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, SimpleValue
  },
  computed: {
    ...itemRelations(Genre,{books:'books'})
  }
})
