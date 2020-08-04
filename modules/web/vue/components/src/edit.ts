import Vue from 'vue'

export const Edit = Vue.extend({
  props: ['content'],
  template: `
<edit-yaml v-model="current"></edit-yaml>
  `,
  data() {
    return {
      current: this.content
    }
  }
})

export const Create = Vue.extend({
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
  }
})
