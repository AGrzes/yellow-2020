import { Reading, Plan, Book } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, RelationEditor, DateEditor, ChoiceEditor, modal, registerEditor} from '@agrzes/yellow-2020-web-vue-components'
import { resolveListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue from 'vue'
import { listRelations, itemRelations, itemRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const PlanRollover = Vue.extend({
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

export const PlanRolloverButton = Vue.extend({
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

export const PlanList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="mr-1">
        {{item.startDate}} - {{item.endDate}}
      </span>
      <span class="badge badge-pill badge-primary mr-auto">
        {{items[key].length}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
        <plan-rollover-button :item="item"></plan-rollover-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="planType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink, PlanRolloverButton
  },
  computed: {
    planType() {
      return Plan
    },
    ...listRelations(Plan,{items: 'items'})
  }
})

export const PlanDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      {{item.startDate}} - {{item.endDate}}
      <span class="badge badge-pill badge-primary">
        {{item.status}}
      </span>
    </h1>
    <template v-if="items">
      <h2>Items</h2>
      <ul>
        <li v-for="reading in items">
          <details-link :item="reading"></details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="reading">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
    <plan-rollover-button :item="item"></plan-rollover-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton, PlanRolloverButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('plan'))
    }
  },
  computed: {
    ...itemRelations(Plan,{items: 'items'})
  }
})

export const EditPlan = Vue.extend({
  props: ['content'],
  template: `
<form>
  <date-editor label="Start Date" property="startDate" :item="current"></date-editor>
  <date-editor label="End Date" property="endDate" :item="current"></date-editor>
  <choice-editor label="Status" property="status" :item="current" :choices="{scheduled:'Scheduled',open:'Open',closed:'Closed'}"></choice-editor>
  <relation-editor label="Items" property="items" :entity="readingType" :item="current"></relation-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  computed: {
    readingType() {
      return Reading
    }
  },
  components: {RelationEditor, DateEditor, ChoiceEditor}
})
registerEditor(Plan, EditPlan)
