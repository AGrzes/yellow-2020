import { TextEditor, DateEditor, SingleRelationEditor,
  NestedEntityEditor,NumberEditor, ChoiceEditor } from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const EditReading = defineComponent({
  props: ['content'],
  template: `
<form>
  <date-editor label="Start Date" property="startDate" :item="current"></date-editor>
  <single-relation-editor label="Book" property="book" :entity="$models.book.Book" :item="current"></single-relation-editor>
  <choice-editor label="Status" property="status" :item="current" :choices="{planned:'Planned',inProgress:'In Progress',finished:'Finished',abandoned:'Abandoned'}"></choice-editor>
  <nested-entity-editor label="Progress" property="progress" :item="current" v-slot="x">
    <date-editor label="Date" property="date" :item="x.entity"></date-editor>
    <number-editor label="Progress" property="progress" :item="x.entity"></number-editor>
    <number-editor label="Change" property="change" :item="x.entity"></number-editor>
  </nested-entity-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {SingleRelationEditor, TextEditor, DateEditor, NestedEntityEditor, NumberEditor, ChoiceEditor}
})
