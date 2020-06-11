import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import { Class, SimpleModelAccess } from '@agrzes/yellow-2020-common-metadata'
import { setupModel, SimpleTypedDataAccess } from '@agrzes/yellow-2020-common-model'
import confluenceClient from 'confluence-client'
import debug from 'debug'
import {JSDOM} from 'jsdom'
import _ from 'lodash'

const log = debug('agrzes:yellow-2020-local-sample')

async function loadConfluenceData(): Promise<any> {
    const confluence = confluenceClient({
        username: process.env.CONFLUENCE_USER,
        password: process.env.CONFLUENCE_PASSWORD,
        endpoint: process.env.CONFLUENCE_URL
    })
    const dom = new JSDOM((await confluence.get(
        'EN',
        'Computer Games Plan',
        ['body.storage']
    )).body.storage.value)

    const tables = dom.window.document.querySelectorAll('ac\\:layout-cell').item(1).querySelectorAll('table')
    const result = []
    tables.forEach((table) => {
      table.querySelectorAll('tr').forEach((tr) => {
        const cells = tr.querySelectorAll('td')
        if (cells.length) {
          result.push({
            name: cells.item(0).textContent,
            platform: cells.item(1).textContent,
            description: cells.item(2).textContent
          })
        }
      })
    })
    return result
}

async function load() {
  const games = await loadConfluenceData()

  const metadata = await SimpleModelAccess
    .loadFromAdapter(new PouchDBDataAccess(new PouchDB('http://couchdb:5984/model')))
  const model = await setupModel( metadata, _.map({
      'http://admin:admin@couchdb:5984/games': 'computerGames.classes.game'

  }, (path, url) => new SimpleTypedDataAccess(_.get(metadata.models, path) as unknown as Class,
    new PouchDBDataAccess(new PouchDB(url)))))

  await Promise.all(_.map(games, (game) =>
    model.raw(metadata.models.computerGames.classes.game, _.kebabCase(game.name), game)))
}

load().catch(log)