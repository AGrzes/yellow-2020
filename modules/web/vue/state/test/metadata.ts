import { DataAccess } from '@agrzes/yellow-2020-common-data'
import { ModelAccess, ModelDescriptor } from '@agrzes/yellow-2020-common-metadata'
import {expect} from 'chai'
import 'mocha'
import metadataState from '../src/metadata'

describe('metadataState', function() {

    it('Should setup module', async function() {
        const metadataModule = metadataState({} as unknown as DataAccess<ModelDescriptor, string, string, any>)
        expect(metadataModule).to.have.property('namespaced', true)
        expect(metadataModule).to.have.nested.property('actions.fetch')
        expect(metadataModule).to.have.nested.property('mutations.update')
        expect(metadataModule).to.have.nested.property('state.models')
    })

    it('Should load models', async function() {
        const metadataModule = metadataState({
            async list() {
                return [{
                    key: 'a',
                    data: {
                        classes: {
                            a: {
                                name: 'a'
                            }
                        }
                    }
                }]
            }
        } as unknown as DataAccess<ModelDescriptor, string, string, any>)
        const context = {
            commit(actions: string, modelAccess: ModelAccess) {
                expect(actions).to.be.equals('update')
                expect(modelAccess).to.have.nested.property('models.a.classes.a')
            }
        }
        await (metadataModule.actions.fetch as any).call(null, context)
    })

    it('Should update state', async function() {
        const metadataModule = metadataState({} as unknown as DataAccess<ModelDescriptor, string, string, any>)
        const state = {}
        await (metadataModule.mutations.update as any).call(null, state, {models: 'models'})
        expect(state).to.have.property('models', 'models')
    })
})
