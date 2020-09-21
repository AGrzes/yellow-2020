import { Book, Reading } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, 
  TextEditor, DateEditor, SingleRelationEditor,
  NestedEntityEditor,NumberEditor, ChoiceEditor, modal, registerEditor} from '@agrzes/yellow-2020-web-vue-components'
import { resolveListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue from 'vue'
import { listSingleRelations, itemSingleRelations, itemSingleRelationResolver } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const FinishReadingButton = Vue.extend({
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

export const ReadingProgress = Vue.extend({
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

export const ReadingProgressButton = Vue.extend({
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

export const ReadingList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="mr-1">
        <small>{{item.startDate}}</small>
        {{book[key].title}}
      </span>
      <span class="badge badge-pill badge-primary mr-auto">
        {{item.status}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
        <reading-progress-button :item="item"></reading-progress-button>
        <finish-reading-button :item="item"></finish-reading-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="readingType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink, FinishReadingButton, ReadingProgressButton
  },
  computed: {
    readingType() {
      return Reading
    },
    ...listSingleRelations(Reading,{book: 'book'})
  }
})

export const ReadingDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      <small>{{item.startDate}}</small>
      {{book.title}}
      <span class="badge badge-pill badge-primary">
        {{item.status}}
      </span>
    </h1>
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
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="reading">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
    <reading-progress-button :item="item"></reading-progress-button>
    <finish-reading-button :item="item"></finish-reading-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton, FinishReadingButton, ReadingProgressButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('reading'))
    }
  },
  computed: {
    ...itemSingleRelations(Reading,{book:'book'})
  }
})

export const EditReading = Vue.extend({
  props: ['content'],
  template: `
<form>
  <date-editor label="Start Date" property="startDate" :item="current"></date-editor>
  <single-relation-editor label="Book" property="book" :entity="bookType" :item="current"></single-relation-editor>
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
  computed: {
    bookType() {
      return Book
    }
  },
  components: {SingleRelationEditor, TextEditor, DateEditor, NestedEntityEditor, NumberEditor, ChoiceEditor}
})
registerEditor(Reading, EditReading)
