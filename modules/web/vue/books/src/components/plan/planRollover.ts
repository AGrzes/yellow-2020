import { Reading, Plan } from '@agrzes/yellow-2020-common-books'
import { DateEditor, modal } from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { itemRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
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
