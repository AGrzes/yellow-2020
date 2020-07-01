import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import chai from 'chai'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {BooksCRUD} from '../src/data'
const {expect} = chai.use(sinonChai)

class TestClass {
  public field: string
  public static typeTag = 'test'
  public static key(instance: TestClass) {
    return 'key'
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
  })
})
