import { Author, Book, Series } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, RelationEditor, 
  TextEditor, LongTextEditor, EditorDescriptor, renderForm, RelationSection, CardWrapper} from '@agrzes/yellow-2020-web-vue-components'
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
<card-wrapper v-if="item">
  <template v-slot:title>
    {{item.name}}
  </template>
  <template v-slot:default>
    <relation-section :relation="books" label="Books"></relation-section>
    <relation-section :relation="series" label="Series"></relation-section>
  </template>
  <template v-slot:footer>
    <edit-button :item="item">Edit</edit-button>
    <list-button type="author">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </template>
</card-wrapper>`,
  components: {
    DeleteButton, EditButton, ListButton,RelationSection, CardWrapper
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
