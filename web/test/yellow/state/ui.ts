import 'mocha'
import uiState from '../../../src/yellow/state/ui'
import {expect}  from 'chai'
import { UIModel } from '../../../src/yellow/ui-model'

describe('uiState', function() {

    it('Should expose provided ui model',async function() {
        const model = {

        } as UIModel
        const uiModule = uiState(model)
        expect(uiModule).to.have.property('state',model)
        expect(uiModule).to.have.property('namespaced',true)
        expect(uiModule).to.have.nested.property('actions.fetch')
    })

    it('Should have working fetch method',async function() {
        const model = {

        } as UIModel
        const uiModule = uiState(model)
        await (uiModule.actions.fetch as any).call(null,null)
    })
})