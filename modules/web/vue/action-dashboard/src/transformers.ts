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

function energyToNumber(energy:string): Number {
  if (energy) {
    switch (energy) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
    }
  }
}

export function filterMinimumEnergy(actions: Action[], [minEnergy,maxEnergy]: [string, string]): Action[] {
  const min = minEnergy ? energyToNumber(minEnergy) : 0
  const max = maxEnergy ? energyToNumber(maxEnergy) : Number.MAX_SAFE_INTEGER
  return _.filter(actions,(action) => {
    const actual = energyToNumber(action.minimumEnergy)
    return min <= actual && actual <= max
  })
}

function priorityToNumber(priority:string): Number {
  if (priority) {
    switch (priority) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
    }
  }
}

export function filterPriority(actions: Action[], [minPriority,maxPriority]: [string, string]): Action[] {
  const min = minPriority ? priorityToNumber(minPriority) : 0
  const max = maxPriority ? priorityToNumber(maxPriority) : Number.MAX_SAFE_INTEGER
  return _.filter(actions,(action) => {
    const actual = priorityToNumber(action.priority)
    return min <= actual && actual <= max
  })
}
