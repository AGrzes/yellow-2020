import 'mocha'
import dataState from '../src/data'
import chai,{expect}  from 'chai'
import { DataAccess } from '@agrzes/yellow-2020-common-data'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)

describe('uiState', function() {

    it('Should setup module',async function() {
        const dataModule = dataState({} as unknown as DataAccess<any,string,string,any>)
        expect(dataModule).to.have.property('namespaced',true)
        expect(dataModule).to.have.nested.property('actions.fetch')
        expect(dataModule).to.have.nested.property('mutations.update')
        expect(dataModule).to.have.property('state')
    })


    it('Should fetch all entities',async function() {
        const dataModule = dataState({
            async list() {
                return [{
                    key: 'a',
                    data: 'b'
                }]
            }
        } as unknown as DataAccess<any,string,string,any>)
        const context = {
            commit(actions: string, data: {[key:string]:any}) {
                expect(actions).to.be.equals('update')
                expect(data).to.have.property('a','b')
            }
        }
        await (dataModule.actions.fetch as any).call(null,context)
    })

    it('Should fetch selected entity',async function() {
        const dataModule = dataState({
            async get(key: string) {
                expect(key).to.be.equals('a')
                return {
                    key: 'a',
                    data: 'b'
                }
            }
        } as unknown as DataAccess<any,string,string,any>)
        const context = {
            commit(actions: string, data: {[key:string]:any}) {
                expect(actions).to.be.equals('update')
                expect(data).to.have.property('a','b')
            }
        }
        await (dataModule.actions.fetch as any).call(null,context,'a')
    })

    it('Should ty to fetch not existing entity',async function() {
        const dataModule = dataState({
            async get(key: string) {
                expect(key).to.be.equals('a')
                return null
            }
        } as unknown as DataAccess<any,string,string,any>)
        const context = {
            commit: sinon.spy()
        }
        await (dataModule.actions.fetch as any).call(null,context,'a')
        expect(context.commit).not.to.be.called
    })

    it('Should update state',async function() {
        const dataModule = dataState({} as unknown as DataAccess<any,string,string,any>)
        const state = {}
        await (dataModule.mutations.update as any).call(null,state,{a:'b'})
        expect(state).to.have.property('a','b')
    })
})