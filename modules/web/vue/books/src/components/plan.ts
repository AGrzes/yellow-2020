import { Reading, Plan } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, RelationEditor, DateEditor, ChoiceEditor} from '@agrzes/yellow-2020-web-vue-components'
import { resolveListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue from 'vue'
import { listRelations, itemRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

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
        <edit-button :item="item" :component="editPlan"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="planType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  computed: {
    planType() {
      return Plan
    },
    editPlan() {
      return EditPlan
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
    <edit-button :item="item" :component="editPlan">Edit</edit-button>
    <list-button type="reading">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('plan'))
    }
  },
  computed: {
    ...itemRelations(Plan,{items: 'items'}),
    editPlan() {
      return EditPlan
    }
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
