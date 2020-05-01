import 'mocha'
import {ModelStateAdapter} from '../src/model'
import chai,{expect}  from 'chai'
import { Model } from '@agrzes/yellow-2020-common-model'
import { Class } from '@agrzes/yellow-2020-common-metadata'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)

describe('ModelStateAdapter', function() {

    describe('state', function() {
        it('Should setup module',async function() {
            const adapter = new ModelStateAdapter({map(){return {}}} as unknown as Model)
            const modelModule = adapter.state({} as Class)
            expect(modelModule).to.have.property('namespaced',true)
            expect(modelModule).to.have.nested.property('actions.fetch')
            expect(modelModule).to.have.nested.property('mutations.update')
            expect(modelModule).to.have.nested.property('mutations.delete')
            expect(modelModule).to.have.nested.property('actions.raw')
            expect(modelModule).to.have.nested.property('actions.delete')
            expect(modelModule).to.have.property('state')
        })
        describe('actions', function() {
            describe('raw', function() {
                it('Should delegate to raw read',async function() {
                    const model = {
                        map: sinon.spy(()=> {
                            return {}
                        }),
                        raw: sinon.spy(()=> {
                            return 'raw'
                        })
                    } as unknown as Model
                    const adapter = new ModelStateAdapter(model)
                    const state = {}
                    const type = {} as Class
                    const modelModule = adapter.state(type)
                    const result = await (modelModule.actions.raw as any).call(null,state, {key: 'key'})
                    expect(model.raw).to.be.calledWith(type, 'key')
                    expect(result).to.be.equals('raw')
                })
                it('Should delegate to raw write',async function() {
                    const model = {
                        map: sinon.spy(()=> {
                            return {}
                        }),
                        raw: sinon.spy(),
                        get: sinon.spy(()=> {
                            return 'get'
                        })
                    } as unknown as Model
                    const adapter = new ModelStateAdapter(model)
                    const state = {
                        commit: sinon.spy()
                    }
                    const type = {} as Class
                    const modelModule = adapter.state(type)
                    await (modelModule.actions.raw as any).call(null,state, {key: 'key',value:'value'})
                    expect(model.raw).to.be.calledWith(type, 'key','value')
                    expect(state.commit).to.be.calledWith('update', {key:'key',value:'get'})
                })
            })

            describe('delete', function() {
                it('Should delegate to raw delete',async function() {
                    const model = {
                        map: sinon.spy(()=> {
                            return {}
                        }),
                        delete: sinon.spy()
                    } as unknown as Model
                    const adapter = new ModelStateAdapter(model)
                    const state = {
                        commit: sinon.spy()
                    }
                    const type = {} as Class
                    const modelModule = adapter.state(type)
                    await (modelModule.actions.delete as any).call(null,state, 'key')
                    expect(model.delete).to.be.calledWith(type, 'key')
                    expect(state.commit).to.be.calledWith('delete', 'key')
                })
            })
        })

        describe('mutations', function() {
            describe('update', function() {
                it('Should update state',async function() {
                    const model = {
                        map: sinon.spy(()=> {
                            return {}
                        })
                    } as unknown as Model
                    const adapter = new ModelStateAdapter(model)
                    const state = {}
                    const type = {} as Class
                    const modelModule = adapter.state(type)
                    modelModule.mutations.update.call(null,state, {key: 'key',value:'value'})
                    expect(state).to.have.property('key','value')
                })
            })
            describe('delete', function() {
                it('Should update state',async function() {
                    const model = {
                        map: sinon.spy(()=> {
                            return {}
                        })
                    } as unknown as Model
                    const adapter = new ModelStateAdapter(model)
                    const state = {key:'value'}
                    const type = {} as Class
                    const modelModule = adapter.state(type)
                    modelModule.mutations.delete.call(null,state, 'key')
                    expect(state).not.to.have.property('key','value')
                })
            })
        })
        /*it('Should fetch all entities',async function() {
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

        it('Should update state',async function() {
            const dataModule = dataState({} as unknown as DataAccess<any,string,string,any>)
            const state = {}
            await (dataModule.mutations.update as any).call(null,state,{a:'b'})
            expect(state).to.have.property('a','b')
        })*/
    })
})