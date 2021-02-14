import _ from "lodash";
import { Action } from "./action";
import { Group, Icon, Item } from "./dashboard-model";

const actionTypeMap = {
  do: 'exclamation',
  brainstorm: 'brain',
  discuss: 'comments'
}

function actionTypeIcon(type: string): Icon {
  return {
    symbol: actionTypeMap[type] || 'question',
    text: type
  }
}

function peopleIcon(people: string[]): Icon {
  return  people? {
    symbol: 'user',
    text: _.join(people)
  }: null
}

const contextMap = {
  home: 'home',
  pc: 'desktop',
  wl: 'laptop',
  desk: 'inbox',
  errands: 'tree',
  office: 'briefcase',
  online: 'signal',
  any: 'question'
}

function contextIcon(context: string): Icon {
  return {
    symbol: contextMap[context] || 'question',
    text: context
  }
}


export function actionsToDashboard(actions: Action[]): Group[] {
  return [{
    header: {
      title: 'Actions'
    },
    items: _.map(actions,(action): Item => ({
      title: action.summary,
      subtitle: action.project?.name,
      icons: [..._.map(action.context,contextIcon),actionTypeIcon(action.type)],
      optionalIcons: _.filter([peopleIcon(action.people)])
    }))
  }]
}
