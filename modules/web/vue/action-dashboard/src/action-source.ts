import {JiraClient} from '@agrzes/jira-adapter'
import axios from 'axios'
import { toArray, mergeMap,map } from 'rxjs/operators';
import {Observable, concat, from, of, combineLatest} from 'rxjs'
import PouchDB from 'pouchdb'
const jiraClient = new JiraClient(axios.create({
  baseURL: process.env.JIRA_URL,
  auth: {
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  }
}))

const db = new PouchDB('action-dashboard')

const save = async (p) => {
  try {
    await db.put({_id:p.key, ...p})
  } catch (e) {
    if(e.name === 'conflict') {
      await db.put({_id:p.key,_rev: (await db.get(p.key))._rev, ...p})
    }
  }
  
}

export function projects(): Observable<any[]> {
  const projects = jiraClient.query(`project='GTD' and type in (Project, Thread, Activity) `)
  projects.subscribe(save)
  return concat(from(db.allDocs({include_docs: true})).pipe(mergeMap( r => of(...r.rows)),map(d => d.doc),toArray()),projects.pipe(toArray()))
}

export function actions(): Observable<any[]> {
  const actions = jiraClient.query(`project = GTD and (resolutiondate is null or resolutiondate >-1w) and type in (Action,Condition)`)
  actions.subscribe(save)
  return concat(from(db.allDocs({include_docs: true})).pipe(mergeMap( r => of(...r.rows)),map(d => d.doc),toArray()),actions.pipe(toArray()))
}

export function data(): Observable<any[]> {
  return combineLatest([projects(),actions()]).pipe(map(([p,a]) => ([...p,...a])))
}
