import _ from 'lodash'
import Vue from 'vue'
import { mapState } from 'vuex'

export const RelationEditor = Vue.extend({
  props: ['label','property','entity','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <ul class="list-group">
    <li class="list-group-item" v-for="(v,i) in item[property]">
      <div class="input-group">
        <select class="form-control" v-model="item[property][i]">
          <option v-for="(a,k) in domain" :value="k">{{instanceLabel(a)}}</option>
        </select>
        <div class="input-group-append">
          <button @click="item[property].splice(i,1)" class="btn btn-outline-secondary" type="button" title="Delete">
              <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>  
    </li>
    <li class="list-group-item">
      <div class="input-group">
        <select class="form-control" v-model="newEntry">
          <option v-for="(a,k) in domain" :value="k">{{instanceLabel(a)}}</option>
        </select>
        <div class="input-group-append">
          <button @click="add()" class="btn btn-outline-secondary" type="button" title="Delete">
              <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>  
    </li>
  </ul>
</div>
  `,
  data() {
    return {
      newEntry: ''
    }
  },
  methods: {
    add() {
      if (this.item[this.property]) {
        this.item[this.property].push(this.newEntry)
      } else {
        Vue.set(this.item,this.property,[this.newEntry])
      }
      this.newEntry = ''
    },
    instanceLabel(instance: any) {
      return this.entity.label(instance)
    }
  },
  computed: {
    ...mapState('model', {
        domain(state: any) {
            return state.entities[this.entity.typeTag]
        }
    })
  }
})

export const RelationEntityEditor = Vue.extend({
  props: ['label','property','entity','item','nestedProperty'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <ul class="list-group">
    <li class="list-group-item" v-for="(v,i) in item[property]">
      <div class="input-group">
        <select class="form-control" v-model="v[nestedProperty]">
          <option v-for="(a,k) in domain" :value="k">{{instanceLabel(a)}}</option>
        </select>
        <div class="input-group-append">
          <button @click="item[property].splice(i,1)" class="btn btn-outline-secondary" type="button" title="Delete">
              <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>  
      <slot v-bind:entity="v">
      </slot>
    </li>
    <li class="list-group-item">
      <div class="input-group">
        <select class="form-control" v-model="newEntry[nestedProperty]">
          <option v-for="(a,k) in domain" :value="k">{{instanceLabel(a)}}</option>
        </select>
        <div class="input-group-append">
          <button @click="add()" class="btn btn-outline-secondary" type="button" title="Delete">
              <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>  
      <slot v-bind:entity="newEntry">
      </slot>
    </li>
  </ul>
</div>
  `,
  data() {
    return {
      newEntry: {}
    }
  },
  methods: {
    add() {
      if (this.item[this.property]) {
        this.item[this.property].push(this.newEntry)
      } else {
        Vue.set(this.item,this.property,[this.newEntry])
      }
      this.newEntry = ''
    },
    instanceLabel(instance: any) {
      return this.entity.label(instance)
    }
  },
  computed: {
    ...mapState('model', {
        domain(state: any) {
            return state.entities[this.entity.typeTag]
        }
    })
  }
})