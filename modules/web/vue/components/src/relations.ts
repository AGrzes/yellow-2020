import _ from 'lodash'
import Vue from 'vue'
import { mapState } from 'vuex'
import {CreateButton} from './buttons'

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
          <create-button :type="entity" @created="onCreated($event)">
            <i class="fas fa-plus-square"></i>
          </create-button>
        </div>
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
    onCreated(created) {
      this.newEntry = this.entity.key(created)
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
  },
  components: {
    CreateButton
  }
})

export const SingleRelationEditor = Vue.extend({
  props: ['label','property','entity','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <div class="input-group">
    <select class="form-control" v-model="item[property]">
      <option v-for="(a,k) in domain" :value="k">{{instanceLabel(a)}}</option>
    </select>
    <div class="input-group-append">
      <create-button :type="entity" @created="onCreated($event)">
        <i class="fas fa-plus-square"></i>
      </create-button>
    </div>
  </div>
</div>
  `,
  methods: {
    instanceLabel(instance: any) {
      return this.entity.label(instance)
    },
    onCreated(created) {
      Vue.set(this.item,this.property,this.entity.key(created))
    },
  },
  computed: {
    ...mapState('model', {
        domain(state: any) {
            return state.entities[this.entity.typeTag]
        }
    })
  },
  components: {
    CreateButton
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
          <create-button :type="entity" @created="onCreated($event)">
            <i class="fas fa-plus-square"></i>
          </create-button>
        </div>
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
      this.newEntry = {}
    },
    onCreated(created) {
      Vue.set(this.newEntry,this.nestedProperty,this.entity.key(created))
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
  },
  components: {
    CreateButton
  }
})

export const NestedEntityEditor = Vue.extend({
  props: ['label','property','item'],
  template: `
<div class="form-group">
  <label>{{label}}</label>
  <ul class="list-group">
    <li class="list-group-item" v-for="(v,i) in item[property]"> 
      <slot v-bind:entity="v">
      </slot>
      <button @click="item[property].splice(i,1)" class="btn btn-outline-secondary" type="button" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </li>
    <li class="list-group-item">
      <slot v-bind:entity="newEntry">
      </slot>
      <button @click="add()" class="btn btn-outline-secondary" type="button" title="Add">
        <i class="fas fa-plus"></i>
      </button>
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
      this.newEntry = {}
    }
  }
})
