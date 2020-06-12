import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import { Class, SimpleModelAccess } from '@agrzes/yellow-2020-common-metadata'
import { setupModel, SimpleTypedDataAccess } from '@agrzes/yellow-2020-common-model'
import confluenceClient from '@agrzes/yellow-2020-common-confluence'
import {JSDOM} from 'jsdom'
import _ from 'lodash'
import debug from 'debug'
import { loadMetadata } from './modelLoader'

const log = debug('agrzes:yellow-2020-local-sample')

async function loadConfluenceData(): Promise<any> {
  const confluence = confluenceClient({
      username: process.env.CONFLUENCE_USER,
      password: process.env.CONFLUENCE_PASSWORD,
      endpoint: process.env.CONFLUENCE_URL
  })
  const results = (await confluence.search(
    'label = "movie" and space.key = "REF"',
    ['body.storage','metadata.labels']
  ))
  return _.map(results, ({title,body: {storage: {value: storage}}, metadata:{labels:{results: labels}}})=> {
    const movie: any = {
      title,
      links: {},
      labels: _(labels).map('name').filter((label) => label !== 'movie').value()
    }
    const dom = new JSDOM(storage)
    dom.window.document.querySelectorAll('a').forEach((link)=> {
      if (link.href.startsWith('http://www.rottentomatoes.com') || link.href.startsWith('https://www.rottentomatoes.com')  ) {
        movie.links.rottentomatoes = link.href
      } else if (link.href.startsWith('http://www.filmweb.pl') || link.href.startsWith('https://www.filmweb.pl')) {
        movie.links.filmweb = link.href
      }
    })
    return movie
  })
}
async function load() {
  const confluenceData = await loadConfluenceData()
  const metadata = await loadMetadata()
  const model = await setupModel( metadata, _.map({
      'http://couchdb:5984/movies': 'movies.classes.movie',
  }, (path, url) => new SimpleTypedDataAccess(_.get(metadata.models, path) as unknown as Class,
    new PouchDBDataAccess(new PouchDB(url)))))
  await Promise.all(_.map(confluenceData, (movie) =>
    model.raw(metadata.models.movies.classes.movie, _.kebabCase(movie.title), movie)))
}
load().catch(log)