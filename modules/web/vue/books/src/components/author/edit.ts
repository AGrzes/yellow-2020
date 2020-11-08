import { Book, Series } from '@agrzes/yellow-2020-common-books'
import { RelationEditor, TextEditor, LongTextEditor, EditorDescriptor, renderForm} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent } from 'vue'
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

