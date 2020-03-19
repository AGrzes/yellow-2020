import * as pouchdbCore from 'pouchdb-core'
import * as pouchdbAdapterHttp from 'pouchdb-adapter-http'
import * as pouchdbMapReduce from 'pouchdb-mapreduce'
import { DataAccess, ConflictMode, DataWrapper } from '.'
import * as _ from 'lodash'

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
        let optCounter = null
        while (true) {
            try {
                await this.db.put({_id: key, ...value, _rev: optCounter})
                break
            } catch (e) {
                if (e.name === 'conflict'){
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
    async merge(key: string, value: DataType, merge: (a: DataType, b: DataType) => DataType) {
        let optCounter = null
        while (true) {
            try {
                await this.db.put({_id: key, ...value, _rev: optCounter})
                break
            } catch (e) {
                if (e.name === 'conflict'){
                    const existing = await this.db.get(key)
                    optCounter = existing._rev
                    value = merge(value,existing)
                } else {
                    throw e
                }
            }
        }
    }
    async delete(key: string, optCounter?: string) {
        if (!optCounter) {
            optCounter = (await this.db.get(key))._rev
        }
        await this.db.remove(key,optCounter)
    }
    async list(query?: void): Promise<DataWrapper<DataType,string,string>[]> {
        throw new Error('Method not implemented.')
    }
    constructor(private db: PouchDB.Database<DataType>) {}
}