import { Reading } from '@agrzes/yellow-2020-common-books'
import { NumberEditor, modal } from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { itemSingleRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const ReadingProgress = defineComponent({
  props: ['content'],
  template: `
<form>
  <number-editor label="Progress" property="progress" :item="current"></number-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {NumberEditor}
})

export const ReadingProgressButton = defineComponent({
  props: {
    item: Object
  },
  template: `
<button @click="progress()" class="btn btn-outline-success" type="button" title="Progress">
  <slot>
    <i class="fas fa-forward"></i>
  </slot>
</button>
  `,
  methods: {
    async progress() {
      modal({
        component: ReadingProgress,
        parent: this.$root,
        title: 'Progress',
        props: {content: _.last(this.item.progress)},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {

              const id = Reading.key(this.item)
              const item = this.item
              const book = itemSingleRelationResolver(this.$store.state.model,Reading,Reading.key(item),'book') as any
              if (book.pages) {
                const progress = m.component.current.progress
                const lastProgress = (_.last<any>(item.progress) || {}).progress || 0
                item.progress = item.progress || []
                item.progress.push({date: new Date().toISOString().substring(0,10),progress,change: progress-lastProgress})
              }
              await this.$store.dispatch(`model/update`, {item, type: Reading})
              await this.$store.dispatch(`notifications/add`, {title: 'Reading moved forward', content: `Reading with key ${id} moved forward` })
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
