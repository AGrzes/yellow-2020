import { defineComponent } from "vue"
import { actionsToDashboard } from "./actions-to-dashboard"
import { data } from './action-source'
import { of, Subject, BehaviorSubject, combineLatest} from 'rxjs'
import { map, distinctUntilChanged } from 'rxjs/operators'
import _ from 'lodash'
import { filterActionable, filterContext, managedMap, filterMinimumTime, filterMinimumEnergy } from './transformers'

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

export const SelectControl = defineComponent({
  props: {
    values: Object,
    subject: Subject,
    label: String
  },
  template: `
  <form>
    <div class="form-group">
      <label>{{label}}</label>
      <select class="form-control" :value="selected" @change="set($event.target.value)" >
        <option v-for="(label,key) in values" :value="key">{{label}}</option>
      </select>
    </div>
  </form>
  `,
  mounted() {
    this.$props.subject
    .subscribe((selected: string) => {
      this.$data.selected = selected
    })
  },
  data() {
    return {
      selected: {}
    }
  },
  methods: {
    set(key: string) {
      this.$props.subject.next(key)
    }
  }
})

export const OptionListControl = defineComponent({
  props: {
    values: Object,
    subject: Subject
  },
  template: `
  <form>
    <div class="form-check" v-for="(label,key) in values">
      <input class="form-check-input" type="checkbox" :checked="selected[key]" @change="set(key, $event.target.checked)" :id="key">
      <label class="form-check-label" :for="key">
        {{label}}
      </label>
    </div>
  </form>
  `,
  mounted() {
    this.$props.subject
    .subscribe((selected: string[]) => {
      this.$data.selected = _(selected).keyBy().mapValues(()=> true).value()
    })
  },
  data() {
    return {
      selected: {}
    }
  },
  methods: {
    set(key: string, enabled: boolean) {
      this.$data.selected[key] = enabled
      this.$props.subject.next(_(this.$data.selected).pickBy().keys().value())
    }
  }
})

export const ActionDashboard = defineComponent({

  template: `
<div class="container-fluid">
  <div class="row">
    <div class="col-2 pl-0 bg-dark text-white">
      <div class=" pt-4 pl-2 h-100">
        <select-control label="Context Preset" :values="contextPresetValues" :subject="contextPreset"></select-control>
        <option-list-control :values="contextValues" :subject="contexts"></option-list-control>
        <select-control label="Min Time" :values="minTimeValues" :subject="minTime"></select-control>
        <select-control label="Max Time" :values="maxTimeValues" :subject="maxTime"></select-control>
        <select-control label="Min Energy" :values="energyValues" :subject="minEnergy"></select-control>
        <select-control label="Max Energy" :values="energyValues" :subject="maxEnergy"></select-control>
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
    ActionList,OptionListControl, SelectControl
  },
  mounted() {
    data().pipe(
      managedMap(filterContext,this.$data.contexts),
      managedMap(filterActionable,of(true)),
      managedMap(filterMinimumTime,this.$data.time),
      managedMap(filterMinimumEnergy,this.$data.energy),
      map(actionsToDashboard)
    )
    .subscribe((groups) => {
      this.$data.groups = groups
    })
  },
  data() {
    const contexts = new BehaviorSubject<string[]>(['pc'])
    const contextPreset = new BehaviorSubject<string>(null)

    const minTime = new BehaviorSubject<number>(0)
    const maxTime = new BehaviorSubject<number>(Number.MAX_SAFE_INTEGER)

    const time = combineLatest([minTime,maxTime]).pipe(distinctUntilChanged())

    const minEnergy = new BehaviorSubject<string>('low')
    const maxEnergy = new BehaviorSubject<string>('high')

    const energy = combineLatest([minEnergy,maxEnergy]).pipe(distinctUntilChanged())

    const presetMap: Record<string,string[]> = {
      personal: ['pc','home','desk','any'],
      work: ['wl','office','any'],
      errands: ['errands','any']
    }
    const inversePresetMap = new Map<string[],string>(_(presetMap).toPairs().map(([k,v]):[string[],string,] => ([v,k])).value())

    contexts.pipe(
      map((c) => inversePresetMap.get(c)),
      distinctUntilChanged()
    ).subscribe(contextPreset)

    contextPreset.pipe(
      map(p => presetMap[p]),
      distinctUntilChanged()
    ).subscribe(contexts)

    return {
      groups: null,
      contexts,
      contextPreset,
      minTime,
      maxTime,
      time,
      minEnergy,
      maxEnergy,
      energy,
      contextValues: _.keyBy(['pc','home','wl','errands','desk','office','any']),
      contextPresetValues: _(presetMap).keys().keyBy().value(),
      minTimeValues: { 0: 'any', 5: '5m',15: '15m',30: '30m',60: '1h', 120: '2h', 180: '3h',240: '4h'},
      maxTimeValues: { 5: '5m',15: '15m',30: '30m',60: '1h', 120: '2h', 180: '3h',240: '4h', [Number.MAX_SAFE_INTEGER]: 'any', },
      energyValues: _.keyBy(['low','medium','high']),
    }
  }
})
