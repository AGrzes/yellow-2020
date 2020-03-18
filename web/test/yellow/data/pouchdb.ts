import 'mocha'
import * as pouchdbCore from 'pouchdb-core'
import * as pouchdbAdapterMemory from 'pouchdb-adapter-memory'
import * as pouchdbMapReduce from 'pouchdb-mapreduce'
import { PouchDBDataAccess} from '../../../src/yellow/data/pouchdb'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

const expect = chai.use(chaiAsPromised).expect

const PouchDB = pouchdbCore.plugin(pouchdbAdapterMemory).plugin(pouchdbMapReduce)

describe('PouchDBDataAccess', function() {
    describe('get', function() {
        it('should get document from pouchdb and return it',async function() {
            const db = new PouchDB('should get document from pouchdb and return it')
            const doc = await db.put({_id: 'abc', key: 'value'})
            const access = new PouchDBDataAccess(db)
            const result = await access.get('abc')
            expect(result.data).to.have.property('key','value')
            expect(result.key).to.be.equals('abc')
            expect(result.optCounter).to.be.equals(doc.rev)
        })

        it('should return null when document is missing',async function() {
            const db = new PouchDB('should return null when document is missing')
            const access = new PouchDBDataAccess(db)
            const result = await access.get('abc')
            expect(result).to.be.null
        })

        it('should buble errors',async function() {
            const db = new PouchDB('should buble error')
            db.close()
            const access = new PouchDBDataAccess(db)
            expect(access.get('abc')).to.be.rejected
        })

        it('should pass optCounter to pouchdb',async function() {
            const db = new PouchDB('should pass optCounter to pouchdb')
            const doc = await db.put({_id: 'abc', key: 'value'})
            await db.put({_id: 'abc', key: '!value', _rev: doc.rev})
            const access = new PouchDBDataAccess(db)
            const result = await access.get('abc',doc.rev)
            expect(result.data).to.have.property('key','value')
            expect(result.key).to.be.equals('abc')
            expect(result.optCounter).to.be.equals(doc.rev)
        })
    })
})