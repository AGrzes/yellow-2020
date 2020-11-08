import { RelationEditor, DateEditor, ChoiceEditor } from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { Entity} from '@agrzes/yellow-2020-common-model'

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

