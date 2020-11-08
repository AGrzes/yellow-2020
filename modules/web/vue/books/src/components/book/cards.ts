import { DeleteButton, DetailsButton, EditButton} from '@agrzes/yellow-2020-web-vue-components'
import _ from 'lodash'
import { defineComponent} from 'vue'
import { Entity} from '@agrzes/yellow-2020-common-model'

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
