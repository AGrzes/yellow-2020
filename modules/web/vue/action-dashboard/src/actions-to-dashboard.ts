import _ from "lodash";
import { Action } from "./action";
import { Group, Icon, Item } from "./dashboard-model";

const actionTypeMap = {
  do: 'fas fa-exclamation',
  brainstorm: 'fas fa-brain',
  discuss: 'fas fa-comments'
}

function actionTypeIcon(type: string): Icon {
  return {
    symbol: actionTypeMap[type] || 'fas fa-question',
    text: type
  }
}

function peopleIcon(people: string[]): Icon {
  return  people? {
    symbol: 'fas fa-user',
    text: _.join(people)
  }: null
}

const contextMap = {
  home: 'fas fa-home',
  pc: 'fas fa-desktop',
  wl: 'fas fa-laptop',
  desk: 'fas fa-inbox',
  errands: 'fasfa-tree',
  office: 'fas fa-briefcase',
  online: 'fas fa-signal',
  any: 'fas fa-question'
}

function contextIcon(context: string): Icon {
  return {
    symbol: contextMap[context] || 'fas fa-question',
    text: context
  }
}

const statusMap = {
  Defined: 'far fa-square',
  'In Progress': 'far fa-caret-square-right',
  Done: 'far fa-check-square',
  Integrated: 'fas fa-square-full',
  Abandoned: 'far fa-minus-square',
  'Tuned Out': 'far fa-caret-square-left'
}

function statusIcon(status: string): Icon {
  return {
    symbol: statusMap[status] || 'far fa-question',
    text: status
  }
}

function locationIcon(location: string): Icon {
  return  location? {
    symbol: 'far fa-map-marker',
    text: location
  }: null
}

export function actionsToDashboard(actions: Action[]): Group[] {
  return _(actions).flatMap((a) => (a.context ? _.map(a.context,(c) => ({...a, mainContext: c})) : [a])).groupBy('mainContext').map((ac,g) => ({
    header: {
      title: g
    },
    items: _.map(ac,(action): Item => ({
      title: action.summary,
      subtitle: action.project?.name,
      icons: [statusIcon(action.status),..._.map(action.context,contextIcon),actionTypeIcon(action.type)],
      optionalIcons: _.filter([peopleIcon(action.people),locationIcon(action.location)])
    }))
  })).value()
}
