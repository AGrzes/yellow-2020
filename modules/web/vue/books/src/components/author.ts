import { Author, Book, Series } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, RelationEditor, 
  TextEditor, LongTextEditor, EditorDescriptor, renderForm} from '@agrzes/yellow-2020-web-vue-components'
import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listRelations, itemRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'


const authorEditorDefinition: EditorDescriptor[] = [
  {component: TextEditor ,label:'Name',property:'name'},
  {component: LongTextEditor ,label:'Description',property:'description'},
  {component: RelationEditor ,label:'Books',property:'books', entity: Book},
  {component: RelationEditor ,label:'Series',property:'series', entity: Series},
]


export const EditAuthor = defineComponent({
  props: ['content'],
  render() {
    return renderForm(this, authorEditorDefinition)
  },
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {RelationEditor, TextEditor, LongTextEditor}
})

export const AuthorList = defineComponent({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex">
      <span class="mr-auto">
        {{item.name}}
        <span class="badge badge-pill badge-primary" v-if="books[key]">{{books[key].length}}</span>
        <small v-for="serie in series[key]">
          <details-link :item="serie">{{serie.name}}</details-link>
        </small>
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="$models.book.Author">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  computed: {
    ...listRelations(Author,{books: 'books',series:'series'})
  }
})

export const AuthorDetails = defineComponent({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>{{item.name}}</h1>
    <h2>Books</h2>
    <ul>
      <li v-for="book in books">
        <details-link :item="book">{{book.title}}</details-link>
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
    <list-button type="author">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(registry.routerRegistry.resolveListRoute('author'))
    }
  },
  computed: {
    ...itemRelations(Author,{books:'books',series: 'series'})
  }
})
