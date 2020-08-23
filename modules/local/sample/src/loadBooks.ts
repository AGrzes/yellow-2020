import { Author, Book, booksCRUD } from '@agrzes/yellow-2020-common-books'
import confluenceClient from 'confluence-client'
import debug from 'debug'
import fs from 'fs'
import YAML from 'js-yaml'
import {JSDOM} from 'jsdom'
import _ from 'lodash'
import { loadMetadata, loadModel } from './modelLoader'

const log = debug('agrzes:yellow-2020-local-sample')

const readFile = fs.promises.readFile

async function loadConfluenceData(): Promise<string[][]> {
    const confluence = confluenceClient({
        username: process.env.CONFLUENCE_USER,
        password: process.env.CONFLUENCE_PASSWORD,
        endpoint: process.env.CONFLUENCE_URL
    })
    const dom = new JSDOM((await confluence.get(
        process.env.CONFLUENCE_SPACE,
        process.env.CONFLUENCE_TITLE,
        ['body.storage']
    )).body.storage.value)

    const rows = dom.window.document.querySelectorAll('tr')
    const result = []
    rows.forEach((row) => {
        const rowArray = []
        row.querySelectorAll('td').forEach((td) => rowArray.push(td.textContent))
        result.push(rowArray)
    })

    return result
}

async function load() {
    const confluenceData = await loadConfluenceData()

    const metadata = await loadMetadata()
    const model = await loadModel(metadata, 'books')
    const data = YAML.safeLoadAll(await readFile(process.argv[2], 'utf-8'))
    const booksMap = _(data).filter(({kind}) => kind === 'book')
        .map(({title, author}: {title: string, author: string}) => ({title, author: [author]}))
        .keyBy(({title}) => _.kebabCase(title))
        .value()
    _.forEach(confluenceData, ([title, author]) => {
        if (title) {
          booksMap[_.kebabCase(title)] = {
            title,
            author: author ? [author] : []
          }
        }
    })
    const authors = _(data).filter(({kind}) => kind === 'author')
        .map(({name, books}: {name: string, books: string[]}) => ({name, books}))
        .keyBy(({name}) => _.kebabCase(name) )
        .value()
    _.forEach(booksMap, (book) => _.forEach(book.author, (a) => {
        const ka = _.kebabCase(a)
        if (!authors[ka]) {
            authors[ka] = {
                name: a,
                books: [book.title]
            }
        } else {
            if (!_.includes(authors[ka].books, book.title)) {
                authors[ka].books.push(book.title)
            }
        }
    }))
    _.forEach(authors, (author) => _.forEach(author.books, (b) => {
        const kb = _.kebabCase(b)
        if (!booksMap[kb]) {
          booksMap[kb] = {
            title: b,
            author: [author.name]
          }
        } else {
            if (!_.includes(booksMap[kb].author, author.name)) {
              booksMap[kb].author.push(author.name)
            }
        }
    }))
    await Promise.all(_.map(booksMap, ({author, ...book}, key) =>
      model.raw(metadata.models.books.classes.book, key, {...book, author: _.map(author, _.kebabCase)})))
    await Promise.all(_.map(authors, ({books, ...author}, key) =>
      model.raw(metadata.models.books.classes.author, key, {...author, books: _.map(books, _.kebabCase)})))
    await Promise.all(_.map(booksMap, ({author, ...book}, key) =>
      booksCRUD.save(Book, {...book, author: _.map(author, _.kebabCase)})))
    await Promise.all(_.map(authors, ({books, ...author}, key) =>
      booksCRUD.save(Author, {...author, books: _.map(books, _.kebabCase)})))

}

load().catch(log)
