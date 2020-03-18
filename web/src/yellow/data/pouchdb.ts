import * as pouchdbCore from 'pouchdb-core'
import * as pouchdbAdapterHttp from 'pouchdb-adapter-http'
import * as pouchdbMapReduce from 'pouchdb-mapreduce'
import { DataAccess, ConflictMode, DataWrapper } from '.'

export const PouchDB = pouchdbCore.plugin(pouchdbAdapterHttp).plugin(pouchdbMapReduce)


export class PouchDBDataAccess<DataType extends object> implements DataAccess<DataType, string,string, void> {
    async get(key: string, optCounter?: string): Promise<DataWrapper<DataType,string,string>> {
        try {
            const result = await this.db.get(key,{rev: optCounter})
            return {
                key:result._id,
                data: result,
                optCounter: result._rev
            }
        } catch (e) {
            if (e.name === 'not_found'){
                return null
            } else {
                throw e
            }
        }
    }
    async set(key: string, value: DataType, optCounter?: string) {
        await this.db.put({_id: key, ...value, _rev: optCounter})
    }
    async update(key: string, value: DataType, conflict?: ConflictMode) {
        throw new Error('Method not implemented.')
    }
    async merge(key: string, value: DataType, merge: (a: DataType, b: DataType) => DataType) {
        throw new Error('Method not implemented.')
    }
    async delete(key: string, optCounter?: string) {
        throw new Error('Method not implemented.')
    }
    async list(query?: void): Promise<DataWrapper<DataType,string,string>[]> {
        throw new Error('Method not implemented.')
    }
    constructor(private db: PouchDB.Database<DataType>) {}
}