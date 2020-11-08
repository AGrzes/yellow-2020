import { Plan } from '@agrzes/yellow-2020-common-books'
import { RelationSection, CardWrapper, DetailsButtons, ValueBadge, SimpleValue} from '@agrzes/yellow-2020-web-vue-components'
import { PlanRolloverButton } from './planRollover'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listRelations, itemRelations, itemRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const PlanDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<card-wrapper v-if="item">
  <template v-slot:title>
    {{item.startDate}} - {{item.endDate}}
    <value-badge :value="item.status"></value-badge>
  </template>
  <template v-slot:default>
    <relation-section :relation="items" label="Items"></relation-section>
    <relation-section :relation="series" label="Series"></relation-section>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="plan"></details-buttons>
    <plan-rollover-button :item="item"></plan-rollover-button>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, ValueBadge, SimpleValue, PlanRolloverButton
  },
  computed: {
    ...itemRelations(Plan,{items: 'items'})
  }
})

