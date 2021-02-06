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
    symbol: actionTypeMap[type],
    text: type
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
      icons: [actionTypeIcon(action.type)]
    }))
  }]
}
