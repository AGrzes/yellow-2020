import { PouchCRUD, PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import { IndexModel } from '@agrzes/yellow-2020-common-indexer'
import _ from 'lodash'
import { Author, Book, Genre, Library, Series } from './model'

const couchDBAddress = process.env.COUCH_DB_ADDRESS || 'http://couchdb.home.agrzes.pl:5984'

export const booksCRUD = new PouchCRUD(new PouchDB(`${couchDBAddress}/books`),
  [Author, Book, Genre, Library, Series])
export const bookModel = new IndexModel(booksCRUD)
