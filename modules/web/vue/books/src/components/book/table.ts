import { DeleteButton, DetailsButton, EditButton } from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent} from 'vue'
import { Entity} from '@agrzes/yellow-2020-common-model'

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
