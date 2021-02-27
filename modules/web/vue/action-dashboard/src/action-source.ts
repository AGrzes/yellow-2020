import axios from 'axios'
import { mergeMap } from 'rxjs/operators';
import {Observable, interval} from 'rxjs'
import { Action } from './action'
import _ from 'lodash'

export function data(): Observable<Action[]> {
  return interval(10000).pipe(mergeMap(async () => (await axios.get('/api/actions')).data))
}
