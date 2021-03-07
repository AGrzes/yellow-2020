import {Observable} from 'rxjs'
import { Action } from './action'
import { webSocket } from 'rxjs/webSocket';

export function data(): Observable<Action[]> {
  return webSocket(`${window.location.protocol === 'https:' ? 'wss:':'ws:' }//${window.location.host}/rx`)
}
