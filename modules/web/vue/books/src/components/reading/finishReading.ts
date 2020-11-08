import { Reading } from '@agrzes/yellow-2020-common-books'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { itemSingleRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const FinishReadingButton = defineComponent({
  props: {
    item: Object
  },
  template: `
<button @click="finish()" class="btn btn-outline-success" type="button" title="Finish" v-if="active">
  <slot>
    <i class="fas fa-flag-checkered"></i>
  </slot>
</button>
  `,
  computed: {
    active() {
      return _.includes(['planned', 'inProgress'],this.item.status)
    }
  },
  methods: {
    async finish() {
      const id = Reading.key(this.item)
      const item = this.item
      const book = itemSingleRelationResolver(this.$store.state.model,Reading,Reading.key(item),'book') as any
      if (book.pages) {
        const lastProgress = (_.last<any>(item.progress) || {}).progress || 0
        item.progress = item.progress || []
        item.progress.push({date: new Date().toISOString().substring(0,10),progress: book.pages,change: book.pages-lastProgress})
      }
      item.status = 'finished'
      await this.$store.dispatch(`model/update`, {item, type: Reading})
      await this.$store.dispatch(`notifications/add`, {title: 'Reading finished', content: `Reading with key ${id} was finished` })
    }
  }
})
