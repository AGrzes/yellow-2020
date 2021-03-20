import {JiraClient} from '@agrzes/jira-adapter'
import axios from 'axios'
import { toArray, mergeMap,map } from 'rxjs/operators';
import {Observable, concat, from, of, combineLatest, merge} from 'rxjs'
import PouchDB from 'pouchdb'
import _ from 'lodash'
import moment from 'moment';

export interface Comment {
  content: string
  timestamp?: string
  author?: string 
}

export interface Project {
  name: string
  priority?: string
  area?: string[]
  tags?: string[]
  status?: string
}

export interface Action {
  key?: string
  summary: string
  description?: string
  comments?: Comment[]
  project?: Project
  minimumTime?: string
  fullTime?: string
  minimumEnergy?: string
  context?: string[]
  location?: string
  people?: string[]
  tags?: string[]
  status: string
  type?: string
  actionable: boolean
  priority: string
}

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

function priority(action,project: Project): string {
  switch(action.fields.priority?.name) {
    case "High" : return "high"
    case "Medium": if (project) {
      switch(project.priority) {
        case "High" : return "high"
        case "Medium": return "medium"
        case "Low": return "low"
        default: return "medium"
      }
    } else {
      return "medium"
    }
    case "Low": return "low"
    default: return "medium"
  }
}

function ticketsToActions(tickets: any[]): Action[] {
  const byKey = _.keyBy(tickets,'key')
  const lookupProject = (ticket): Project => {
    const link = _.find(ticket.fields.issuelinks,(link) => link.outwardIssue && link.type?.outward === 'supports')
    if (link && link.outwardIssue.key) {
      const project = byKey[link.outwardIssue.key]
      return {
        name: project.fields.summary,
        area: _.filter(project.fields.labels, (label) => _.startsWith(label,'AOC.')),
        priority: project.fields.priority?.name,
        tags: _.filter(project.fields.labels, (label) => !_.startsWith(label,'AOC.')),
        status: project.fields.status?.name
      }
    }
  }


  return _(tickets).filter((ticket) => _.includes(['Action'],ticket.fields.issuetype?.name)).map((ticket) => {
    const project = lookupProject(ticket)
    return {
      summary: ticket.fields.summary,
      status: ticket.fields.status?.name,
      description: ticket.fields.description,
      comments:  _.map(ticket.fields.comment?.comments,(comment) => ({
        content: comment.body,
        timestamp: comment.created,
        author: comment.author?.name
      })),
      project: project,
      minimumTime: _.join(ticket.fields.customfield_10102,', '),
      fullTime: _.join(ticket.fields.customfield_10102,', '),
      minimumEnergy: _.join(ticket.fields.customfield_10101,', '),
      context: ticket.fields.customfield_10000,
      location: ticket.fields.customfield_10002,
      people: ticket.fields.customfield_10001,
      tags: ticket.fields.labels,
      type: _.head(ticket.fields.customfield_10100 as string[]),
      key: ticket.key,
      actionable: ticket.fields.status?.name === 'Defined' 
        && (!project || project.status === 'Active') 
        && (!ticket.fields.customfield_10200 || moment(ticket.fields.customfield_10200).isBefore(moment())),
      priority: priority(ticket,project)
    }
  }).value()
}

export function data(): Observable<Action[]> {
  return concat(
    from(db.allDocs({include_docs: true})).pipe(mergeMap( r => of(...r.rows)),map(d => d.doc),toArray()),
    merge(projects(),actions()).pipe(toArray())
  ).pipe(map(ticketsToActions))
}
