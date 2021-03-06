import { Indexer } from '@agrzes/yellow-2020-common-model'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { PouchCRUD } from '../src/crud'
const {expect} = chai.use(sinonChai).use(chaiAsPromised)

class TestClass {
  public field: string
  public field2?: string
  public static typeTag = 'test'
  public static key(instance: TestClass) {
    return 'key'
  }
  public static index<T>(index: Indexer, genre: TestClass) {
    //
  }
  public static resolve<T>(index: Indexer, genre: TestClass) {
    //
  }
}

describe('crud', function() {
  describe('PouchCRUD', function() {
    describe('list', function() {
      it('should fetch data from database', async function() {
        const database = {
          allDocs: sinon.mock().returns({rows: []})
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
        const result = await booksCRUD.delete(TestClass, 'key')
        expect(database.remove).to.be.calledOnceWith('test:key', undefined)
        expect(result).to.be.true
      })
      it('should retrieve rev in case of conflict', async function() {
        const database = {
          remove: sinon.stub().onFirstCall().throws({name: 'conflict'}),
          get: sinon.stub().returns({_rev: 'rev'})
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
        const booksCRUD = new PouchCRUD(database, [])
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
    describe('changes', function() {
      it('should subscribe to changes', async function() {
        const subscription = {
          on: sinon.stub(),
          cancel: sinon.stub()
        }
        const observer = {
          next: sinon.stub()
        }
        const database = {
          changes: sinon.stub().returns(subscription)
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [])
        booksCRUD.changes().subscribe().unsubscribe()
        expect(database.changes).to.be.calledOnceWith({
          live: true,
          since: 'now'
        })
      })
      it('should terminate subscription', async function() {
        const subscription = {
          on: sinon.stub(),
          cancel: sinon.stub()
        }
        const observer = {
          next: sinon.stub()
        }
        const database = {
          changes: sinon.stub().returns(subscription)
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [])
        booksCRUD.changes().subscribe().unsubscribe()
        expect(subscription.cancel).to.be.calledOnce
      })
      it('should handle change', async function() {
        const subscription = {
          on: sinon.stub(),
          cancel: sinon.stub()
        }
        const observer = {
          next: sinon.stub()
        }
        const database = {
          changes: sinon.stub().returns(subscription)
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [TestClass])
        const result = booksCRUD.changes().subscribe(observer)
        subscription.on.getCalls()[0].args[1]({id: 'test:id'})
        result.unsubscribe()
        expect(observer.next).to.be.calledOnceWith({
          entity: TestClass,
          key: 'id',
          change: 'change'
        })
      })
      it('should handle deletion', async function() {
        const subscription = {
          on: sinon.stub(),
          cancel: sinon.stub()
        }
        const observer = {
          next: sinon.stub()
        }
        const database = {
          changes: sinon.stub().returns(subscription)
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [TestClass])
        const result = booksCRUD.changes().subscribe(observer)
        subscription.on.getCalls()[0].args[1]({id: 'test:id', deleted: true})
        result.unsubscribe()
        expect(observer.next).to.be.calledOnceWith({
          entity: TestClass,
          key: 'id',
          change: 'delete'
        })
      })
      it('should handle completion', async function() {
        const subscription = {
          on: sinon.stub(),
          cancel: sinon.stub()
        }
        const observer = {
          complete: sinon.stub()
        }
        const database = {
          changes: sinon.stub().returns(subscription)
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [TestClass])
        const result = booksCRUD.changes().subscribe(observer)
        subscription.on.getCalls()[1].args[1]({id: 'test:id'})
        result.unsubscribe()
        expect(observer.complete).to.be.calledOnce
      })
      it('should handle error', async function() {
        const subscription = {
          on: sinon.stub(),
          cancel: sinon.stub()
        }
        const observer = {
          error: sinon.stub()
        }
        const database = {
          changes: sinon.stub().returns(subscription)
        } as unknown as PouchDB.Database
        const booksCRUD = new PouchCRUD(database, [TestClass])
        const result = booksCRUD.changes().subscribe(observer)
        subscription.on.getCalls()[2].args[1]('error')
        result.unsubscribe()
        expect(observer.error).to.be.calledOnceWith('error')
      })
    })
  })
})
