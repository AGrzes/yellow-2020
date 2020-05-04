import { PouchDBDataAccess , PouchDB} from '@agrzes/yellow-2020-common-data-pouchdb'
import { setupModel, simpleTypedDataAccess } from '@agrzes/yellow-2020-common-model'
import { SimpleModelAccess, Class } from '@agrzes/yellow-2020-common-metadata'
import _ from 'lodash'
import YAML from 'js-yaml'
import fs from 'fs'
const readFile = fs.promises.readFile

async function load() {
    const metadata = await SimpleModelAccess.loadFromAdapter(new PouchDBDataAccess(new PouchDB('http://localhost:5984/model')))
    const model = await setupModel( metadata, _.map({
        'http://localhost:5984/books': 'books.classes.book',
        'http://localhost:5984/authors': 'books.classes.author'
    },(path, url) => simpleTypedDataAccess(_.get(metadata.models,path) as unknown as Class,new PouchDBDataAccess(new PouchDB(url)))))
    const data = YAML.safeLoadAll(await readFile(process.argv[2],'utf-8'))
    const books = _(data).filter(({kind})=> kind === 'book')
        .map(({title, author}: {title: string,author: string})=>({title,author:[author]}))
        .keyBy(({title})=>_.kebabCase(title))
        .value() 
    const authors = _(data).filter(({kind})=> kind === 'author')
        .map(({name, books}: {name: string,books: string[]})=>({name,books}))
        .keyBy(({name})=>_.kebabCase(name) )
        .value() 
    _.forEach(books,(book) => _.forEach(book.author, a => {
        const ka = _.kebabCase(a)
        if (!authors[ka]) {
            authors[ka] = {
                name: a,
                books: [book.title]
            } 
        } else {
            if (!_.includes(authors[ka].books,book.title)) {
                authors[ka].books.push(book.title)
            }
        }
    }))
    _.forEach(authors,(author)=> _.forEach(author.books, b => {
        const kb = _.kebabCase(b)
        if (!books[kb]) {
            books[kb] = {
                title: b,
                author: [author.name]
            } 
        } else {
            if (!_.includes(books[kb].author,author.name)) {
                books[kb].author.push(author.name)
            }
        }
    }))
    await Promise.all(_.map(books,({author,...book},key) => model.raw(metadata.models.books.classes.book,key,{...book,author:_.map(author,_.kebabCase)})))
    await Promise.all(_.map(authors,({books,...author},key) => model.raw(metadata.models.books.classes.author,key,{...author,books:_.map(books,_.kebabCase)})))
}

load()