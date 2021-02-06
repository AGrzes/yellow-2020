import { defineComponent } from "vue"

export const ActionItem = defineComponent({
  props: {
    name: String
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
    <a href="#">{{name||'Action name'}}</a>
  </span>
  <span class="sub-title  p-1">
    <small class="ml-1"><a href="#">Project</a></small>
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

  template: `
<div class="card mt-4">
  <div class="card-header">
    Featured
  </div>
  <ul class="list-group list-group-flush">
    <li class="list-group-item py-1 px-2" ><action-item name="Very long action name that will force wrapping"></action-item></li>
    <li class="list-group-item py-1 px-2"><action-item></action-item></li>
    <li class="list-group-item py-1"><action-item></action-item></li>
    <li class="list-group-item py-1"><action-item></action-item></li>
    <li class="list-group-item py-1"><action-item></action-item></li>
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
    <div class="col-3 pl-0">
      <div class="bg-dark text-white pt-4 pl-2 h-100">
        <h5 class="card-title">Card title</h5>
        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
        <p class="card-text">Last updated 3 mins ago</p>
      </div>
    </div>
    <div class="col-9">
      <div class="row">
        <div class="col-4">
          <action-list></action-list>
          <action-list></action-list>
          <action-list></action-list>
        </div>
        <div class="col-4">
          <action-list></action-list>
          <action-list></action-list>
          <action-list></action-list>
        </div>
        <div class="col-4">
          <action-list></action-list>
          <action-list></action-list>
          <action-list></action-list>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  components: {
    ActionList
  }
})
