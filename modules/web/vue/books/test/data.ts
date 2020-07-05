import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {BookModel, BooksCRUD, Entity, Index} from '../src/data'
import { Author, Book, Genre, Library } from '../src/model'
const {expect} = chai.use(sinonChai).use(chaiAsPromised)

class TestClass {
  public field: string
  public field2?: string
  public static typeTag = 'test'
  public static key(instance: TestClass) {
    return 'key'
  }
  public static index<T>(index: Index, genre: TestClass) {
    //
  }
  public static resolve<T>(index: Index, genre: TestClass) {
    //
  }
}

describe('data', function() {
  describe('BooksCRUD', function() {
    describe('list', function() {
      it('should fetch data from database', async function() {
        const database = {
          allDocs: sinon.mock().returns({rows: []})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        await booksCRUD.list(TestClass)
        expect(database.allDocs).to.be.calledOnceWith({
          include_docs: true,
          startkey: `test:`,
          endkey: `test:\uffff`
        })
      })
      it('should create class instances', async function() {
        const database = {
          allDocs: sinon.mock().returns({rows: [{doc: {field: 'value1'}}]})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        const results = await booksCRUD.list(TestClass)
        expect(results).to.have.lengthOf(1)
        expect(results[0]).to.be.instanceOf(TestClass)
        expect(results[0]).to.have.property('field', 'value1')
      })
    })
    describe('get', function() {
      it('should fetch data from database', async function() {
        const database = {
          get: sinon.mock().returns({field: 'value1'})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        const result = await booksCRUD.get(TestClass, 'key')
        expect(database.get).to.be.calledOnceWith('test:key')
        expect(result).to.be.instanceOf(TestClass)
        expect(result).to.have.property('field', 'value1')
      })
    })
    describe('save', function() {
      it('should save data to database', async function() {
        const database = {
          put: sinon.mock().returns({field: 'value1'})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        const result = await booksCRUD.save(TestClass, {field: 'value1'})
        expect(database.put).to.be.calledOnceWith({_id: 'test:key', _rev: undefined, field: 'value1'})
        expect(result).to.be.instanceOf(TestClass)
        expect(result).to.have.property('field', 'value1')
      })
      it('should merge in case of conflict', async function() {
        const database = {
          put: sinon.stub().onFirstCall().throws({name: 'conflict'}).onSecondCall().returns({field: 'value1'}),
          get: sinon.stub().returns({field: 'value2', field2: 'value2', _rev: 'rev'})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        const result = await booksCRUD.save(TestClass, {field: 'value1'})
        expect(database.get).to.be.calledOnceWith('test:key')
        expect(database.put).to.be.calledWith({_id: 'test:key', _rev: undefined, field: 'value1'})
        expect(database.put).to.be.calledWith({_id: 'test:key', _rev: 'rev', field: 'value1', field2: 'value2'})
        expect(result).to.be.instanceOf(TestClass)
        expect(result).to.have.property('field', 'value1')
        expect(result).to.have.property('field2', 'value2')
      })
      it('should fail on other errors', async function() {
        const error = new Error()
        const database = {
          put: sinon.stub().throws(error)
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        try {
          await booksCRUD.save(TestClass, {field: 'value1'})
          expect.fail('Exception expected')
        } catch (e) {
          expect(e).to.be.equals(error)
        }
        expect(database.put).to.be.calledWith({_id: 'test:key', _rev: undefined, field: 'value1'})
      })
      it('should fail after limited number of retries', async function() {
        const database = {
          put: sinon.stub().throws({name: 'conflict'}),
          get: sinon.stub().returns({field: 'value2', field2: 'value2', _rev: 'rev'})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        try {
          await booksCRUD.save(TestClass, {field: 'value1'})
          expect.fail('Exception expected')
        } catch (e) {
          expect(e).to.have.property('message', 'Save failed')
        }
        expect(database.put).to.be.calledWith({_id: 'test:key', _rev: undefined, field: 'value1'})
      })
    })
    describe('delete', function() {
      it('should delete data from database', async function() {
        const database = {
          remove: sinon.mock()
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        const result = await booksCRUD.delete(TestClass, 'key')
        expect(database.remove).to.be.calledOnceWith('test:key', undefined)
        expect(result).to.be.true
      })
      it('should retrieve rev in case of conflict', async function() {
        const database = {
          remove: sinon.stub().onFirstCall().throws({name: 'conflict'}),
          get: sinon.stub().returns({_rev: 'rev'})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        const result = await booksCRUD.delete(TestClass, 'key')
        expect(database.get).to.be.calledOnceWith('test:key')
        expect(database.remove).to.be.calledWith('test:key', undefined)
        expect(database.remove).to.be.calledWith('test:key', 'rev')
        expect(result).to.be.true
      })
      it('should fail on other errors', async function() {
        const error = new Error()
        const database = {
          remove: sinon.stub().throws(error)
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        try {
          await booksCRUD.delete(TestClass, 'key')
          expect.fail('Exception expected')
        } catch (e) {
          expect(e).to.be.equals(error)
        }
        expect(database.remove).to.be.calledWith('test:key', undefined)
      })
      it('should fail after limited number of retries', async function() {
        const database = {
          remove: sinon.stub().throws({name: 'conflict'}),
          get: sinon.stub().returns({ _rev: 'rev'})
        } as unknown as PouchDB.Database
        const booksCRUD = new BooksCRUD(database, [])
        try {
          await booksCRUD.delete(TestClass, 'key')
          expect.fail('Exception expected')
        } catch (e) {
          expect(e).to.have.property('message', 'Delete failed')
        }
        expect(database.remove).to.be.calledWith('test:key', undefined)
        expect(database.remove).to.be.calledWith('test:key', 'rev')
      })
    })
  })
  describe('BookModel', function() {
    describe('init', function() {
      function list(type: Entity<any>){
        if (type === Book) {
          return [{
            title: 'book A',
            author: ['author-a'],
            genre: ['genre-a'],
            libraries: [{
              library: 'library-a'
            }]
          }, {
            title: 'book B'
          }]
        }
        if (type === Author) {
          return [{
            name: 'author A',
            books: ['book-b']
          }]
        }
        if (type === Genre) {
          return [{
            name: 'genre A',
            books: ['book-b']
          }]
        }
        if (type === Library) {
          return [{
            name: 'library A',
            entries: [{
              book: 'book-b'
            }]
          }]
        }
      }
      it('should resolve forward reference', async function() {
        const crud = {
          list: sinon.spy(list)
        } as unknown as BooksCRUD

        const model = new BookModel(crud)
        await model.init()
        expect(model).to.have.nested.property('books.book-a.author[0].name', 'author A')
        expect(model).to.have.nested.property('books.book-a.genre[0].name', 'genre A')
        expect(model).to.have.nested.property('books.book-a.libraries[0].library.name', 'library A')
        expect(model).to.have.nested.property('authors.author-a.books[0].title', 'book B')
        expect(model).to.have.nested.property('genres.genre-a.books[0].title', 'book B')
        expect(model).to.have.nested.property('libraries.library-a.entries[0].book.title', 'book B')

      })
      it('should resolve reverse reference', async function() {
        const crud = {
          list: sinon.spy(list)
        } as unknown as BooksCRUD

        const model = new BookModel(crud)
        await model.init()
        expect(model).to.have.nested.property('books.book-b.author[0].name', 'author A')
        expect(model).to.have.nested.property('books.book-b.genre[0].name', 'genre A')
        expect(model).to.have.nested.property('books.book-b.libraries[0].library.name', 'library A')
        expect(model).to.have.nested.property('authors.author-a.books[1].title', 'book A')
        expect(model).to.have.nested.property('genres.genre-a.books[1].title', 'book A')
        expect(model).to.have.nested.property('libraries.library-a.entries[1].book.title', 'book A')

      })
      /*it('should resolve cross references', async function() {
        const crud = {
          list: sinon.spy((type: Entity<any>) => {
            if (type === Book) {
              return [{
                title: 'book A',
                author: ['author-a'],
                genre: ['genre-a'],
                libraries: [{
                  library: 'library-a'
                }]
              }, {
                title: 'book B'
              }]
            }
            if (type === Author) {
              return [{
                name: 'author A',
                books: ['book-b']
              }]
            }
            if (type === Genre) {
              return [{
                name: 'genre A',
                books: ['book-b']
              }]
            }
            if (type === Library) {
              return [{
                name: 'library A',
                entries: [{
                  book: 'book-b'
                }]
              }]
            }
          })
        } as unknown as BooksCRUD

        const model = new BookModel(crud)
        await model.init()
        expect(model).to.have.nested.property('books.book-a.author[0].name', 'author A')
        expect(model).to.have.nested.property('books.book-a.genre[0].name', 'genre A')
        expect(model).to.have.nested.property('books.book-a.libraries[0].library.name', 'library A')
        expect(model).to.have.nested.property('books.book-b.author[0].name', 'author A')
        expect(model).to.have.nested.property('books.book-b.genre[0].name', 'genre A')
        expect(model).to.have.nested.property('books.book-b.libraries[0].library.name', 'library A')

      })*/
    })
  })
})
