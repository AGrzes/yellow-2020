import _ from "lodash";
import { Action } from "./action";
import { Group, Item } from "./dashboard-model";


export function actionsToDashboard(actions: Action[]): Group[] {
  return [{
    header: {
      title: 'Actions'
    },
    items: _.map(actions,(action): Item => ({
      title: action.summary,
      subtitle: action.project?.name
    }))
  }]
}
