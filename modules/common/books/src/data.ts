import { PouchCRUD, PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import { IndexModel } from '@agrzes/yellow-2020-common-indexer'
import _ from 'lodash'
import { Author, Book, Genre, Library, Series } from './model'

export const booksCRUD = new PouchCRUD(new PouchDB('http://couchdb.home.agrzes.pl:5984/books'),
  [Author, Book, Genre, Library, Series])
export const bookModel = new IndexModel(
  booksCRUD,
  [Author, Book, Genre, Library, Series])
