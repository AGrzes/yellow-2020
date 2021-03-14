import { Action } from './action'
import _ from 'lodash'

export function filterContext([actions,contexts]:[Action[],string[]]): Action[] {
  if (contexts?.length) {
    return _.filter(actions,(action) => _.some(contexts,context => _.includes(action.context,context) ))
  } else {
    return actions
  }
}