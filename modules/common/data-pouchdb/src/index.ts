import { ConflictMode, DataAccess, DataWrapper } from '@agrzes/yellow-2020-common-data'
import * as _ from 'lodash'
import pouchdbAdapterHttp from 'pouchdb-adapter-http'
import pouchdbCore from 'pouchdb-core'
import pouchdbMapReduce from 'pouchdb-mapreduce'

export * from './crud'

export const PouchDB = pouchdbCore.plugin(pouchdbAdapterHttp).plugin(pouchdbMapReduce)

export class PouchDBDataAccess<DataType extends object> implements DataAccess<DataType, string, string, void> {
    public async get(key: string, optCounter?: string): Promise<DataWrapper<DataType, string, string>> {
        try {
            const result = await this.db.get(key, {rev: optCounter})
            return {
                key: result._id,
                data: result,
                optCounter: result._rev
            }
        } catch (e) {
            if (e.name === 'not_found') {
                return null
            } else {
                throw e
            }
        }
    }
    public async set(key: string, value: DataType, optCounter?: string): Promise<string> {
        return (await this.db.put({_id: key, ...value, _rev: optCounter})).rev
    }
    public async update(key: string, value: DataType, conflict?: ConflictMode) {
        let optCounter: string
        while (true) {
            try {
                await this.db.put({_id: key, ...value, _rev: optCounter})
                break
            } catch (e) {
                if (e.name === 'conflict') {
                    if (conflict === ConflictMode.skip) {
                        break
                    } else if (conflict === ConflictMode.override) {
                        optCounter = (await this.db.get(key))._rev
                    } else {
                        throw e
                    }
                } else {
                    throw e
                }
            }
        }
    }
    public async merge(key: string, value: DataType, merge: (a: DataType, b: DataType) => DataType) {
        let optCounter: string
        while (true) {
            try {
                await this.db.put({_id: key, ...value, _rev: optCounter})
                break
            } catch (e) {
                if (e.name === 'conflict') {
                    const existing = await this.db.get(key)
                    optCounter = existing._rev
                    value = merge(value, existing)
                } else {
                    throw e
                }
            }
        }
    }
    public async delete(key: string, optCounter?: string) {
        if (!optCounter) {
            optCounter = (await this.db.get(key))._rev
        }
        await this.db.remove(key, optCounter)
    }
    public async list(query?: void): Promise<Array<DataWrapper<DataType, string, string>>> {
        return (await this.db.allDocs({include_docs: true})).rows.map(({id, value: { rev}, doc}) => ({
            data: doc,
            key: id,
            optCounter: rev
        }))
    }
    constructor(private db: PouchDB.Database<DataType>) {}
}
