import { defineComponent } from "vue"
import { actionsToDashboard } from "./actions-to-dashboard"
import {data} from './action-source'
import {combineLatest, of} from 'rxjs'
import {map} from 'rxjs/operators'
import _ from 'lodash'

export const ActionItem = defineComponent({
  props: {
    item: Object
  },
  template: `
<span class="d-flex ">
  <span class="check">

  </span>
  <span class="mandatory-icons p-1">
  <span v-for="icon in item.icons" data-toggle="tooltip" data-placement="bottom" :title="icon.text">
    <i class="m-1" :class="icon.symbol"></i>
  </span>
  </span>
  <span class="main-title  p-1">
    <a href="#">{{item.title}}</a>
  </span>
  <span class="sub-title  p-1">
    <small class="ml-1"><a href="#">{{item.subtitle}}</a></small>
  </span>
  <span class="optional-icons  p-1">
    <span v-for="icon in item.optionalIcons" data-toggle="tooltip" data-placement="bottom" :title="icon.text">
      <i class="m-1" :class="icon.symbol"></i>
    </span>
    
  </span>
  <span class="actions  p-1">

  </span>
</span>
  `,
  watch: {
    item() {
      $('[data-toggle="tooltip"]').tooltip()
    }
  }
})

export const ActionList = defineComponent({
  props:{
    group: Object
  },
  template: `
<div class="card mt-4">
  <div class="card-header">
    {{group.header.title}}
  </div>
  <ul class="list-group list-group-flush">
    <li v-for="item in group.items" class="list-group-item py-1 px-2"><action-item :item="item" ></action-item></li>
  </ul>
</div>
  `,
  components: {
    ActionItem
  }
})

export const ActionDashboard = defineComponent({

  template: `
<div class="container-fluid">
  <div class="row">
    <div class="col-2 pl-0">
      <div class="bg-dark text-white pt-4 pl-2 h-100">
        <h5 class="card-title">Card title</h5>
        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
        <p class="card-text">Last updated 3 mins ago</p>
      </div>
    </div>
    <div class="col-8">
      <div class="row">
        <div class="col-12">
          <action-list v-for="group in groups" :group="group"></action-list>
        </div>
      </div>
    </div>
    <div class="col-2 pl-0">
      <div class="bg-dark text-white pt-4 pl-2 h-100">
        <h5 class="card-title">Card title</h5>
        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
        <p class="card-text">Last updated 3 mins ago</p>
      </div>
    </div>
  </div>
</div>
  `,
  components: {
    ActionList
  },
  mounted() {
    combineLatest([data(),of(['pc','home'])]).pipe(
      map(([data, contexts]) => {
        if (contexts?.length) {
          return _.filter(data,(action) => _.some(contexts,context => _.includes(action.context,context) ))
        } else {
          return data
        }
      }), 
      map(actionsToDashboard))
    .subscribe((groups) => {
      this.$data.groups = groups
    })
  },
  data() {
    return {
      groups: null
    }
  }
})
