import { Author, Book, Genre, Library, Reading, Series } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  EditButton, RelationEditor, RelationEntityEditor, 
  TextEditor, LongTextEditor, CurrencyEditor, BooleanEditor, DateEditor, SingleRelationEditor, 
  modal, EditorDescriptor, renderForm, CardWrapper, RelationSection, DetailsButtons, SimpleValue,
  ListBadge, ListItemButtons, CountBadge, SmallLinks, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import _ from 'lodash'
import { defineComponent} from 'vue'
import { listRelations, itemRelations} from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

const bookEditorDefinition: EditorDescriptor[] = [
  {component: TextEditor ,label:'Title',property:'title'},
  {component: LongTextEditor ,label:'Description',property:'description'},
  {component: RelationEditor ,label:'Author',property:'author', entity: Author},
  {component: RelationEditor ,label:'Genre',property:'genre', entity: Genre},
  {component: RelationEditor ,label:'Series',property:'series', entity: Series},
  {component: RelationEntityEditor ,label:'Libraries',property:'libraries', 
    entity: Library, nestedProperty: 'library', children: [
      {component: TextEditor ,label:'Url',property:'url'},
      {component: CurrencyEditor ,label:'Price',property:'price'},
      {component: BooleanEditor ,label:'Owned',property:'owned'}
    ]},
]

export const EditBook = defineComponent({
  props: ['content'],
  render() {
    return renderForm(this, bookEditorDefinition)
  },
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {RelationEditor,RelationEntityEditor, TextEditor, LongTextEditor, CurrencyEditor, BooleanEditor}
})

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

export const BooksList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="title"></simple-value>
    <small-links :relation="authors[key]"></small-links>
    <small-links :relation="series[key]"></small-links>
    <list-badge :value="genres[key]"></list-badge>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
    <plan-reading-button :item="item"></plan-reading-button>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Book">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper, PlanReadingButton, ListBadge
  },
  computed: {
    ...listRelations(Book,{authors: 'author',genres:'genre',series:'series'})
  }
})

export const BooksTable = defineComponent({
  props: {
    list: Object
  },
  template: `
<table class="table-sm table-striped">
  <thead>
    <tr>
      <th>Title</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item,key) in list" >
      <td>{{item.title}}</td>
      <td>
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </td>
    </tr>
  </tbody>
</table>`,
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BooksCards = defineComponent({
  props: {
    list: Object
  },
  template: `
<div class="row">
  <div v-for="(item,key) in list" class="col-3 mt-4">
    <div class="card h-100" >
      <div class="card-body">
        {{item.title}}
      </div>
      <div class="card-footer text-right">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </div>
    </div>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BookDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<card-wrapper v-if="item">
  <template v-slot:title>
    <simple-value :item="item" property="title"></simple-value>
    <list-badge :value="genres"></list-badge>
  </template>
  <template v-slot:default>
    <relation-section :relation="authors" label="Authors"></relation-section>
    <relation-section :relation="series" label="Series"></relation-section>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="book"></details-buttons>
    <plan-reading-button :item="item"></plan-reading-button>
  </template>
</card-wrapper>
`,
  components: {
    PlanReadingButton, CardWrapper, RelationSection, DetailsButtons, SimpleValue, ListBadge
  },
  computed: {
    ...itemRelations(Book,{authors:'author',genres:'genre',series: 'series'})
  }
})
