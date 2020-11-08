import { Reading, Plan, Book } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton,
  DetailsLink, EditButton, ListButton, RelationEditor, DateEditor, ChoiceEditor, modal,
  RelationSection, CardWrapper, DetailsButtons, ValueBadge, 
  ListItemButtons, SimpleValue, CountBadge, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listRelations, itemRelations, itemRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const PlanRollover = defineComponent({
  props: ['content'],
  template: `
<form>
  <date-editor label="Start Date" property="startDate" :item="current"></date-editor>
  <date-editor label="End Date" property="endDate" :item="current"></date-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {DateEditor}
})

export const PlanRolloverButton = defineComponent({
  props: {
    item: Object
  },
  template: `
<button @click="rollover()" class="btn btn-outline-primary" type="button" title="Plan Rollover">
  <slot>
    <i class="fas fa-step-forward"></i>
  </slot>
</button>
  `,
  methods: {
    async rollover() {
      const plan = this.item
      const id = Plan.key(plan)
      modal({
        component: PlanRollover,
        parent: this.$root,
        title: 'Plan Rollover',
        props: {content: {}},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              const items = itemRelationResolver(this.$store.state.model,Plan,id,'items') as any
              const item = {
                ...m.component.current,
                status: 'scheduled',
                items: _.map(_.filter(items,({status})=> _.includes(['planned','inProgress'],status)),Reading.key)
              }
              await this.$store.dispatch(`model/update`, {item, type: Plan})
              await this.$store.dispatch(`notifications/add`, {title: 'Plan Rolled Over', content: `Plan with key ${id} rolled over` })
              m.close()
            },
            class: 'btn-primary'
          }, {
            name: 'Cancel',
            onclick(m) {
              m.close()
            },
            class: 'btn-secondary'
          }
        ]
      })
    }
  }
})

export const PlanList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <span class="mr-1">
      {{item.startDate}} - {{item.endDate}}
    </span>
    <count-badge :value="items[key]"></count-badge>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Plan">Add</create-button>
    <plan-rollover-button :item="item"></plan-rollover-button>
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

export const EditPlan = defineComponent({
  props: ['content'],
  template: `
<form>
  <date-editor label="Start Date" property="startDate" :item="current"></date-editor>
  <date-editor label="End Date" property="endDate" :item="current"></date-editor>
  <choice-editor label="Status" property="status" :item="current" :choices="{scheduled:'Scheduled',open:'Open',closed:'Closed'}"></choice-editor>
  <relation-editor label="Items" property="items" :entity="$models.book.Reading" :item="current"></relation-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {RelationEditor, DateEditor, ChoiceEditor}
})

