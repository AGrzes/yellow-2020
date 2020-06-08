import * as ace from 'ace-builds'
import 'ace-builds/webpack-resolver'
import * as YAML from 'js-yaml'
import Vue from 'vue'

export const EditYaml = Vue.extend({
  props: ['value'],
  template: `
<div style="height: 200px" ref="editor">{{yaml}}</div>
  `,
  mounted() {
    const editor = ace.edit(this.$refs.editor, {
      mode: 'ace/mode/yaml',
      theme: 'ace/theme/chrome',
      selectionStyle: 'text'
    })

    editor.on('change', (e) => {
      try {
        this.$emit('input', YAML.safeLoad(editor.getValue()))
      } catch {
        //
      }
    })
  },
  computed: {
    yaml() {
      return YAML.safeDump(this.value)
    }
  }
})

Vue.component('edit-yaml', EditYaml)

export const EditJSON = Vue.extend({
  props: ['value'],
  template: `
<div style="height: 200px" ref="editor">{{json}}</div>
  `,
  mounted() {
    const editor = ace.edit(this.$refs.editor, {
      mode: 'ace/mode/json',
      theme: 'ace/theme/chrome',
      selectionStyle: 'text'
    })

    editor.on('change', (e) => {
      try {
        this.$emit('input', JSON.parse(editor.getValue()))
      } catch {
        //
      }
    })
  },
  computed: {
    json() {
      return JSON.stringify(this.value)
    }
  }
})

Vue.component('edit-json', EditJSON)
