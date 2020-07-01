import { PouchDB } from '@agrzes/yellow-2020-common-data-pouchdb'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {BooksCRUD} from '../src/data'
const {expect} = chai.use(sinonChai).use(chaiAsPromised)

class TestClass {
  public field: string
  public field2?: string
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
  })
})
