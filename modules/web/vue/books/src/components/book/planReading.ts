import { Book, Reading } from '@agrzes/yellow-2020-common-books'
import { DateEditor, SingleRelationEditor, modal} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent} from 'vue'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const PlanReading = defineComponent({
  props: ['content'],
  template: `
<form>
  <date-editor label="Start Date" property="startDate" :item="current"></date-editor>
  <single-relation-editor label="Book" property="book" :entity="$models.book.Book" :item="current"></single-relation-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {SingleRelationEditor, DateEditor}
})

export const PlanReadingButton = defineComponent({
  props: {
    item: Object
  },
  template: `
<button @click="plan()" class="btn btn-outline-success" type="button" title="Plan Reading">
  <slot>
    <i class="fas fa-calendar-plus"></i>
  </slot>
</button>
  `,
  methods: {
    async plan() {
      const book = this.item
      const bookId = Book.key(book)
      modal({
        component: PlanReading,
        parent: this.$root,
        title: 'Plan Reading',
        props: {content: {book: bookId}},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              const item = {
                ...m.component.current,
                status: 'planned'
              }
              const id = Reading.key(item)
              await this.$store.dispatch(`model/update`, {item, type: Reading})
              await this.$store.dispatch(`notifications/add`, {title: 'Reading planned', content: `Reading with key ${id} planned` })
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



