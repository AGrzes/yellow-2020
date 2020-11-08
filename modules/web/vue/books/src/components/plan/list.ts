import { Plan } from '@agrzes/yellow-2020-common-books'
import { CreateButton, ListItemButtons, SimpleValue, CountBadge, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
import { PlanRolloverButton } from './planRollover'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listRelations} from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const PlanList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="startDate"></simple-value>
    -
    <simple-value :item="item" property="endDate"></simple-value>
    <count-badge :value="items[key]"></count-badge>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
    <plan-rollover-button :item="item"></plan-rollover-button>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Plan">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, ListWrapper, PlanRolloverButton
  },
  computed: {
    ...listRelations(Plan,{items: 'items'})
  }
})

