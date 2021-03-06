import _ from 'lodash'
import { defineComponent } from 'vue'

export const TextEditor = defineComponent({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <input type="text" class="form-control" v-model="item[property]"/>
</div>
  `
})

export const DateEditor = defineComponent({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <input type="date" class="form-control" v-model="item[property]"/>
</div>
  `
})

export const NumberEditor = defineComponent({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <input type="number" class="form-control" v-model="item[property]"/>
</div>
  `
})

export const LongTextEditor = defineComponent({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <textarea class="form-control" v-model="item[property]"></textarea>
</div>
  `
})

export const CurrencyEditor = defineComponent({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <input type="number" step="0.01"  class="form-control" v-model.number="item[property]"/>
</div>
  `
})

export const BooleanEditor = defineComponent({
  props: ['label','property','item'],
  template: `
<div class="form-check">
  <input type="checkbox" class="form-check-input" v-model="item[property]"/>
  <label class="form-check-label">{{label}}</label>
</div>
  `
})

export const ChoiceEditor = defineComponent({
  props: ['label','property','item','choices'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <select class="custom-select" v-model="item[property]">
    <option v-for="(label,key) in choices" :key="key" :value="key">{{label}}</option>
  </select>
</div>
  `
})
