import { Author, Book, Series } from '@agrzes/yellow-2020-common-books'
import { CreateButton, RelationEditor, TextEditor, LongTextEditor, EditorDescriptor, renderForm, RelationSection, CardWrapper, 
  DetailsButtons, ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper} from '@agrzes/yellow-2020-web-vue-components'
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
  }
})

export const AuthorList = defineComponent({
  props: {
    list: Object
  },
  template: `
<list-wrapper :list="list">
  <template v-slot:default="{item,key}">
    <simple-value :item="item" property="name"></simple-value>
    <count-badge :value="books[key]"></count-badge>
    <small-links :relation="series[key]"></small-links>
  </template>
  <template v-slot:itemActions="{item}">
    <list-item-buttons :item="item"></list-item-buttons>
  </template>
  <template v-slot:listActions>
    <create-button :type="$models.book.Author">Add</create-button>
  </template>
</list-wrapper>
`,
  components: {
    CreateButton, ListItemButtons, SimpleValue, CountBadge, SmallLinks, ListWrapper
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
    <simple-value :item="item" property="name"></simple-value>
  </template>
  <template v-slot:default>
    <relation-section :relation="books" label="Books"></relation-section>
    <relation-section :relation="series" label="Series"></relation-section>
  </template>
  <template v-slot:footer>
    <details-buttons :item="item" parent="author"></details-buttons>
  </template>
</card-wrapper>`,
  components: {
    RelationSection, CardWrapper, DetailsButtons, SimpleValue
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
