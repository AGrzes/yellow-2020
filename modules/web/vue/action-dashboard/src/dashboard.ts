import { defineComponent } from "vue"
import { actions } from "./action"
import { actionsToDashboard } from "./actions-to-dashboard"

export const ActionItem = defineComponent({
  props: {
    item: Object
  },
  template: `
<span class="d-flex ">
  <span class="check">

  </span>
  <span class="mandatory-icons p-1">
    <i class="fas fa-user m-1"></i>
    <i class="fas fa-user m-1"></i>
    <i class="fas fa-user m-1"></i>
    <i class="fas fa-user m-1"></i>
    <i class="fas fa-user m-1"></i>
  </span>
  <span class="main-title  p-1">
    <a href="#">{{item.title}}</a>
  </span>
  <span class="sub-title  p-1">
    <small class="ml-1"><a href="#">{{item.subtitle}}</a></small>
  </span>
  <span class="optional-icons  p-1">
    <i class="fas fa-user p-1"></i>
    <i class="fas fa-user p-1"></i>
    <i class="fas fa-user p-1"></i>
    <i class="fas fa-user p-1"></i>
    <i class="fas fa-user p-1"></i>
  </span>
  <span class="actions  p-1">

  </span>
</span>
  `
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
    <div class="col-9">
      <div class="row">
        <div class="col-4">
          <action-list v-for="group in groups" :group="group"></action-list>
        </div>
        <div class="col-4">
        </div>
        <div class="col-4">
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  components: {
    ActionList
  },
  data() {
    return {
      groups: actionsToDashboard(actions)
    }
  }
})
