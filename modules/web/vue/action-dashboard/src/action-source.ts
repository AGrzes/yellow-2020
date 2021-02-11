import {JiraClient} from '@agrzes/jira-adapter'
import axios from 'axios'
import { toArray, mergeMap,map } from 'rxjs/operators';
import {Observable, concat, from, of} from 'rxjs'
import PouchDB from 'pouchdb'
const jiraClient = new JiraClient(axios.create({
  baseURL: process.env.JIRA_URL,
  auth: {
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  }
}))

const db = new PouchDB('action-dashboard')

export function actions(): Observable<any[]> {
  const projects = jiraClient.query(`project='GTD' and type = Project `)
  projects.subscribe(async (p) => {
    try {
      await db.put({_id:p.key, ...p})
    } catch (e) {
      if(e.name === 'conflict') {
        await db.put({_id:p.key,_rev: (await db.get(p.key))._rev, ...p})
      }
    }
    
  })
  return concat(from(db.allDocs({include_docs: true})).pipe(mergeMap( r => of(...r.rows)),map(d => d.doc),toArray()),projects.pipe(toArray()))
}
