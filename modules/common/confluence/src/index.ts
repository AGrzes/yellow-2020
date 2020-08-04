
import axios from 'axios'
import _ from 'lodash'

export interface ConfluenceConfig {
  username: string
  password: string
  endpoint: string
}

export interface ConfluenceClient {
  search(cql: string, expand: Expand): Promise<any[]>
  searchGenerator(cql: string, expand: Expand): AsyncGenerator<any>
  request(path: string, params: any): Promise<any>
  get(spaceKey: string, title: string, expand: Expand): Promise<any>
  properties(spaceKey: string, cql: string, properties: Properties): Promise<any>
}

type Expand = string | string[]
type Properties = string | string[]

export default function client(config: ConfluenceConfig): ConfluenceClient {
  const username = config.username
  const password = config.password
  const endpoint = config.endpoint

  const api = {
    async search(cql: string, expand: Expand): Promise<any[]> {
      const result = []
      for await(const item of this.searchGenerator(cql, expand)) {
        result.push(item)
      }
      return result
    },
    async *searchGenerator(cql: string, expand: Expand): AsyncGenerator<any> {
      let result = (await axios.get(endpoint + '/rest/api/content/search', {
        params: {
          cql,
          expand: _.isArray(expand) ? expand.join(',') : expand,
          limit: 200,
          pageSize: 200,
          maxResults: 200
        },
        auth: {
          username,
          password
        }
      })).data
      yield* result.results
      while (result._links.next) {
        result = (await axios.get(result._links.base + result._links.next, {
          auth: {
            username,
            password
          }
        })).data
        yield* result.results
      }
    },
    request(path: string, params: any) {
      return axios.get(endpoint + path, {
        params,
        auth: {
          username,
          password
        }
      }).then(_.property('data'))
    },
    get(spaceKey: string, title: string, expand: Expand) {
      return axios.get(endpoint + '/rest/api/content', {
        params: {
          spaceKey,
          title,
          expand: _.isArray(expand) ? expand.join(',') : expand
        },
        auth: {
          username,
          password
        }
      }).then(_.flow(_.property('data'), _.property('results'), _.first))
    },
    properties(spaceKey: string, cql: string, properties: Properties) {
      return axios.get(endpoint + '/rest/masterdetail/1.0/detailssummary/lines', {
        params: {
          spaceKey,
          cql,
          headings: _.isArray(properties) ? properties.join(',') : properties,
          pageSize: 1000
        },
        auth: {
          username,
          password
        }
      }).then((response) => {
        const headings = response.data.renderedHeadings
        return response.data.detailLines.map((line) => {
          return {
            id: line.id,
            title: line.title,
            properties: _.zipObject(headings, line.details)
          }
        })
      })
    }
  }

  return api
}
