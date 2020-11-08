import { Book, Reading } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DetailsLink, TextEditor, DateEditor, SingleRelationEditor,
  NestedEntityEditor,NumberEditor, ChoiceEditor, modal, ValueBadge, RelationSection, CardWrapper, DetailsButtons,
  ListItemButtons, SimpleValue, CountBadge, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listSingleRelations, itemSingleRelations, itemSingleRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
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

export const ReadingList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="startDate"></simple-value>
    <details-link :item="book[key]"></details-link>
    <value-badge :value="item.status"></value-badge>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
    <reading-progress-button :item="item"></reading-progress-button>
    <finish-reading-button :item="item"></finish-reading-button>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Reading">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, ListWrapper, ValueBadge, FinishReadingButton, ReadingProgressButton, DetailsLink
  },
  computed: {
    ...listSingleRelations(Reading,{book: 'book'})
  }
})

export const ReadingDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<card-wrapper v-if="item">
  <template v-slot:title>
    <simple-value :item="item" property="startDate"></simple-value>
    <details-link :item="book"></details-link>
    <value-badge :value="item.status"></value-badge>
  </template>
  <template v-slot:default>
    <ul class="list-group">
      <li class="list-group-item" v-for="increment in item.progress">
        <small>
          {{increment.date}}
        </small>
        <span class="badge badge-pill badge-success">
        {{increment.progress}}
        </span>
        <span class="badge badge-pill badge-primary" v-if="increment.change">
          +{{increment.change}}
        </span>
      </li>
    </ul>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="reading"></details-buttons>
    <reading-progress-button :item="item"></reading-progress-button>
    <finish-reading-button :item="item"></finish-reading-button>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, SimpleValue, FinishReadingButton, ReadingProgressButton, DetailsLink, ValueBadge
  },
  computed: {
    ...itemSingleRelations(Reading,{book:'book'})
  }
})

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
