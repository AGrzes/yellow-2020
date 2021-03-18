import { Action } from './action'
import _ from 'lodash'
import {combineLatest, OperatorFunction, Observable} from 'rxjs'
import {map} from 'rxjs/operators'

export function managedMap<I,C,R>(project:(input: I, control: C) => R, control: Observable<C>): OperatorFunction<I, R> {
  return (source) => {
    return combineLatest([source,control]).pipe(map(([i,c]) => project(i,c)))
  }
}

export function filterContext(actions: Action[], contexts: string[]): Action[] {
  if (contexts?.length) {
    return _.filter(actions,(action) => _.some(contexts,context => _.includes(action.context,context) ))
  } else {
    return actions
  }
}

export function filterActionable(actions: Action[], enable: boolean): Action[] {
  if (enable) {
    return _.filter(actions,(action) => action.actionable)
  } else {
    return actions
  }
}

function timeToNumber(time:string): Number {
  if (time) {
    const hours = time.match(/(\d+)h/)
    const minutes = time.match(/(\d+)m/)
    if (hours) {
      return _.parseInt(hours[1])*60
    } else if (minutes) {
      return _.parseInt(minutes[1])
    }
  }
}

export function filterMinimumTime(actions: Action[], [minTime,maxTime]: [number, number]): Action[] {
  minTime = minTime || 0
  maxTime = maxTime || Number.MAX_SAFE_INTEGER
  return _.filter(actions,(action) => {
    const actualTime = timeToNumber(action.minimumTime)
    return minTime <= actualTime && actualTime <= maxTime
  })
}
