import { Author, Book, Genre, Library, Reading, Series } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, RelationEditor, RelationEntityEditor, 
  TextEditor, LongTextEditor, CurrencyEditor, BooleanEditor, DateEditor, SingleRelationEditor, modal} from '@agrzes/yellow-2020-web-vue-components'
import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import _ from 'lodash'
import { DefineComponent, defineComponent, h } from 'vue'
import { listRelations, itemRelations} from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

interface EditorDescriptor {
  component: DefineComponent
  label: string,
  property: string
  nestedProperty?: string
  entity?: Entity<unknown>
  children?: EditorDescriptor[]
}

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

function renderEditor(instance: any,{component,label,property,entity,nestedProperty,children}: EditorDescriptor) {
  return h(component,{label,property,item: instance, entity, nestedProperty}, children ? 
    {
      default: ({entity:item}) => (_.map(children, (childEditor) => renderEditor(item,childEditor)))
    }
    : null)
}

function renderForm(instance: any, editors: EditorDescriptor[]) {
  return h('form',null,[
    _.map(editors, (editor) => renderEditor(instance.current,editor))
  ])
}


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
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="mr-1">
        {{item.title}}
        <small v-for="author in authors[key]" class="ml-1">
          <details-link :item="author">{{author.name}}</details-link>
        </small>
        <small v-for="serie in series[key]" class="ml-1">
          <details-link :item="serie">{{serie.name}}</details-link>
        </small>
      </span>
      <span class="badge badge-pill badge-primary mr-1" v-for="genre in genres[key]">
        {{genre.name}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center ml-auto">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
        <plan-reading-button :item="item"></plan-reading-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="$models.book.Book">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink, PlanReadingButton
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
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      {{item.title}}
      <span class="badge badge-pill badge-primary mr-1" v-for="genre in genres">
        {{genre.name}}
      </span>
    </h1>
    <h2>Authors</h2>
    <ul>
      <li v-for="author in authors">
        <details-link :item="author">{{author.name}}</details-link>
      </li>
    </ul>
    <template v-if="series">
      <h2>Series</h2>
      <ul>
        <li v-for="serie in series">
          <details-link :item="serie">{{serie.name}}</details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="book">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
    <plan-reading-button :item="item"></plan-reading-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton, PlanReadingButton
  },
  methods: {
    deleted() {
      this.$router.push(registry.routerRegistry.resolveListRoute('book'))
    }
  },
  computed: {
    ...itemRelations(Book,{authors:'author',genres:'genre',series: 'series'})
  }
})
