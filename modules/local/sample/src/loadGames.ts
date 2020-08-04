import confluenceClient from '@agrzes/yellow-2020-common-confluence'
import debug from 'debug'
import {JSDOM} from 'jsdom'
import _ from 'lodash'
import { executeLoader } from '.'

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

executeLoader({
  model: 'games',
  async extract(): Promise<any> {
    return await loadConfluenceData()
  },
  transform(metadata, games: any) {
    return _.map(games, (game) => ({
      type: metadata.models.computerGames.classes.game,
      key: _.kebabCase(game.name),
      value: game
    }))
  }
})
