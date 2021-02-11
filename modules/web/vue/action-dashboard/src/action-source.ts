import {JiraClient} from '@agrzes/jira-adapter'
import axios from 'axios'
import { toArray, mergeMap,map } from 'rxjs/operators';
import {Observable, concat, from, of, combineLatest, merge} from 'rxjs'
import PouchDB from 'pouchdb'
import { Action } from './action'
import _ from 'lodash'
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
  return projects
}

export function actions(): Observable<any[]> {
  const actions = jiraClient.query(`project = GTD and (resolutiondate is null or resolutiondate >-1w) and type in (Action,Condition)`)
  actions.subscribe(save)
  return actions
}

function ticketsToActions(tickets: any[]): Action[] {
  const byKey = _.keyBy(tickets,'key')
  return _(tickets).filter((ticket) => _.includes(['Action'],ticket.fields.issuetype?.name)).map((ticket) => {
    return {
      summary: ticket.fields.summary,
      status: ticket.fields.status?.name
    }
  }).value()
}

export function data(): Observable<Action[]> {
  return concat(
    from(db.allDocs({include_docs: true})).pipe(mergeMap( r => of(...r.rows)),map(d => d.doc),toArray()),
    merge(projects(),actions()).pipe(toArray())
  ).pipe(map(ticketsToActions))
}
