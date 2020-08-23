import _ from 'lodash'
import Vue from 'vue'
import { mapState } from 'vuex'

export const TextEditor = Vue.extend({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <input type="text" class="form-control" v-model="item[property]"/>
</div>
  `
})

export const LongTextEditor = Vue.extend({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <textarea type="text" class="form-control" v-model="item[property]"></textarea>
</div>
  `
})

export const CurrencyEditor = Vue.extend({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <input type="number" step="0.01"  class="form-control" v-model.number="item[property]"/>
</div>
  `
})

export const BooleanEditor = Vue.extend({
  props: ['label','property','item'],
  template: `
<div class="form-check">
  <input type="checkbox" class="form-check-input" v-model="item[property]"/>
  <label class="form-check-label">{{label}}</label>
</div>
  `
})