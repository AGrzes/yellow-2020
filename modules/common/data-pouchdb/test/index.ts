import { ConflictMode } from '@agrzes/yellow-2020-common-data'
import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { randomBytes } from 'crypto'
import 'mocha'
import pouchdbAdapterMemory from 'pouchdb-adapter-memory'
import pouchdbCore from 'pouchdb-core'
import pouchdbMapReduce from 'pouchdb-mapreduce'
import { PouchDBDataAccess} from '../src'

const expect = chai.use(chaiAsPromised).expect

const PouchDB = pouchdbCore.plugin(pouchdbAdapterMemory).plugin(pouchdbMapReduce)

function createDb(): PouchDB.Database<any> {
    return new PouchDB(randomBytes(16).toString('base64'), {adapter: 'memory'})
}

describe('PouchDBDataAccess', function() {
    describe('get', function() {
        it('should get document from pouchdb and return it', async function() {
            const db = createDb()
            const doc = await db.put({_id: 'abc', key: 'value'})
            const access = new PouchDBDataAccess(db)
            const result = await access.get('abc')
            expect(result.data).to.have.property('key', 'value')
            expect(result.key).to.be.equals('abc')
            expect(result.optCounter).to.be.equals(doc.rev)
        })

        it('should return null when document is missing', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            const result = await access.get('abc')
            expect(result).to.be.null
        })

        it('should buble errors', async function() {
            const db = createDb()
            db.close()
            const access = new PouchDBDataAccess(db)
            expect(access.get('abc')).to.be.rejected
        })

        it('should pass optCounter to pouchdb', async function() {
            const db = createDb()
            const doc = await db.put({_id: 'abc', key: 'value'})
            await db.put({_id: 'abc', key: '!value', _rev: doc.rev})
            const access = new PouchDBDataAccess(db)
            const result = await access.get('abc', doc.rev)
            expect(result.data).to.have.property('key', 'value')
            expect(result.key).to.be.equals('abc')
            expect(result.optCounter).to.be.equals(doc.rev)
        })
    })
    describe('set', function() {
        it('should put document', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            await access.set('abc', {key: 'value'})
            const result = await db.get( 'abc')

            expect(result).to.have.property('key', 'value')
            expect(result._id).to.be.equals('abc')
        })

        it('should buble errors', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            expect(access.set('abc', {key: 'value'}, 'aaa')).to.be.rejected
        })

        it('should pass opt counter to put', async function() {
            const db = createDb()
            const doc = await db.put({_id: 'abc', key: '!value'})
            const access = new PouchDBDataAccess(db)
            await access.set('abc', {key: 'value'}, doc.rev)
            const result = await db.get( 'abc')

            expect(result).to.have.property('key', 'value')
            expect(result._id).to.be.equals('abc')
        })
    })

    describe('update', function() {
        it('should put document', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            await access.update('abc', {key: 'value'})
            const result = await db.get( 'abc')

            expect(result).to.have.property('key', 'value')
            expect(result._id).to.be.equals('abc')
        })

        it('should buble errors in default mode', async function() {
            const db = createDb()
            await db.put({_id: 'abc', key: '!value'})
            const access = new PouchDBDataAccess(db)
            expect(access.update('abc', {key: 'value'})).to.be.rejected
        })

        it('should buble errors in explicit error mode', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            db.close()
            expect(access.update('abc', {key: 'value'}, ConflictMode.error)).to.be.rejected
        })

        it('should skip in skip mode', async function() {
            const db = createDb()
            await db.put({_id: 'abc', key: '!value'})
            const access = new PouchDBDataAccess(db)
            await access.update('abc', {key: 'value'}, ConflictMode.skip)
            const doc = await db.get('abc')
            expect(doc).to.have.property('key', '!value')
        })

        it('should override in override mode', async function() {
            const db = createDb()
            await db.put({_id: 'abc', key: '!value'})
            const access = new PouchDBDataAccess(db)
            await access.update('abc', {key: 'value'}, ConflictMode.override)
            const doc = await db.get('abc')
            expect(doc).to.have.property('key', 'value')
        })
    })

    describe('merge', function() {
        it('should put document', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            await access.merge('abc', {key: 'value'}, null )
            const result = await db.get( 'abc')

            expect(result).to.have.property('key', 'value')
            expect(result._id).to.be.equals('abc')
        })

        it('should buble errors', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            db.close()
            expect(access.merge('abc', {key: 'value'}, null)).to.be.rejected
        })

        it('should merge', async function() {
            const db = createDb()
            await db.put({_id: 'abc', key: '!value'})
            const access = new PouchDBDataAccess(db)
            await access.merge('abc', {key: 'value'}, (a, b) => ({...a, ...b, key: a.key + b.key}))
            const doc = await db.get('abc')
            expect(doc).to.have.property('key', 'value!value')
        })
    })

    describe('delete', function() {
        it('should delete document', async function() {
            const db = createDb()
            const doc = await db.put({_id: 'abc', key: 'value'})
            const access = new PouchDBDataAccess(db)
            await access.delete('abc', doc.rev)
            expect(db.get( 'abc')).to.be.rejected
        })

        it('should buble errors', async function() {
            const db = createDb()
            const access = new PouchDBDataAccess(db)
            db.close()
            expect(access.delete('abc')).to.be.rejected
        })

        it('should force delete if optCounter is not provided', async function() {
            const db = createDb()
            await db.put({_id: 'abc', key: 'value'})
            const access = new PouchDBDataAccess(db)
            await access.delete('abc')
            expect(db.get( 'abc')).to.be.rejected
        })
    })
    describe('list', function() {
        it('should list documents form pouchdb', async function() {
            const db = createDb()
            const doc = await db.put({_id: 'abc', key: 'value'})
            const access = new PouchDBDataAccess(db)
            const result = await access.list()
            expect(result).to.have.length(1)
            expect(result[0].data).to.have.property('key', 'value')
            expect(result[0].key).to.be.equals('abc')
            expect(result[0].optCounter).to.be.equals(doc.rev)
        })

        it('should buble errors', async function() {
            const db = createDb()
            db.close()
            const access = new PouchDBDataAccess(db)
            expect(access.list()).to.be.rejected
        })
    })
})
