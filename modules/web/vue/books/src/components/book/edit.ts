import { Author, Genre, Library, Series } from '@agrzes/yellow-2020-common-books'
import { RelationEditor, RelationEntityEditor, 
  TextEditor, LongTextEditor, CurrencyEditor, BooleanEditor, EditorDescriptor, renderForm} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent} from 'vue'
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
