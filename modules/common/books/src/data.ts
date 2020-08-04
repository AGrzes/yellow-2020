import { PouchCRUD, PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import _ from 'lodash'
import { IndexModel } from './indexModel'
import { Author, Book, Genre, Library, Series } from './model'

export const bookModel = new IndexModel(
  new PouchCRUD(new PouchDB('http://couchdb.home.agrzes.pl:5984/books'), [Author, Book, Genre, Library, Series]),
  [Author, Book, Genre, Library, Series])
