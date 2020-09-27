import { defineComponent } from 'vue'
import {EditYaml} from './editor'

export const Edit = defineComponent({
  props: ['content'],
  template: `
<edit-yaml v-model="current"></edit-yaml>
  `,
  data() {
    return {
      current: this.content
    }
  },
  components: {
    EditYaml
  }
})

export const Create = defineComponent({
  props: ['content'],
  template: `
  <form>
      <div class="form-group">
          <label for="key">Key</label>
          <input type="text" class="form-control" id="key" v-model="key">
      </div>
      <edit-yaml v-model="current"></edit-yaml>
  </form>
  `,
  data() {
    return {
      current: this.content,
      key: ''
    }
  },
  components: {
    EditYaml
  }
})
