import {JiraClient} from '@agrzes/jira-adapter'
import axios from 'axios'
import { toArray } from 'rxjs/operators';
const jiraClient = new JiraClient(axios.create({
  baseURL: process.env.JIRA_URL,
  auth: {
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  }
}))

jiraClient.query(`project='GTD' and type = Project `).pipe(toArray()).subscribe((a) => console.log(a))
