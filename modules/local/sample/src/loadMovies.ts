import confluenceClient from '@agrzes/yellow-2020-common-confluence'
import debug from 'debug'
import {JSDOM} from 'jsdom'
import _ from 'lodash'
import { loadMetadata, loadModel } from './modelLoader'

const log = debug('agrzes:yellow-2020-local-sample')

async function loadConfluenceData(): Promise<any> {
  const confluence = confluenceClient({
      username: process.env.CONFLUENCE_USER,
      password: process.env.CONFLUENCE_PASSWORD,
      endpoint: process.env.CONFLUENCE_URL
  })
  const results = (await confluence.search(
    'label = "movie" and space.key = "REF"',
    ['body.storage', 'metadata.labels']
  ))
  return _.map(results, ({title, body: {storage: {value: storage}}, metadata: {labels: {results: labels}}}) => {
    const movie: any = {
      title,
      links: {},
      labels: _(labels).map('name').filter((label) => label !== 'movie').value()
    }
    const dom = new JSDOM(storage)
    dom.window.document.querySelectorAll('a').forEach((link) => {
      if (link.href.startsWith('http://www.rottentomatoes.com')
        || link.href.startsWith('https://www.rottentomatoes.com')  ) {
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
  const model = await loadModel(metadata, 'movies')
  await Promise.all(_.map(confluenceData, (movie) =>
    model.raw(metadata.models.movies.classes.movie, _.kebabCase(movie.title), movie)))
}
load().catch(log)
