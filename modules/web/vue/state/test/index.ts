import { DataAccess } from '@agrzes/yellow-2020-common-data'
import { ModelAccess } from '@agrzes/yellow-2020-common-metadata'
import { Model } from '@agrzes/yellow-2020-common-model/types'
import chai, {expect} from 'chai'
import 'mocha'
import sinon, { SinonSandbox } from 'sinon'
import sinonChai from 'sinon-chai'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import {setupSetupDataAccess, setupSetupMetadata, setupSetupModelStateAdapter,
  setupStore, StateConfig} from '../src/index'
import { ModelStateAdapter } from '../src/model'
chai.use(sinonChai)

describe('setupSetupModelStateAdapter', function() {

    it('Should construct ModelStateAdapter', async function() {
        const model: Model = {} as Model
        const modelStateAdapter = setupSetupModelStateAdapter()(model)
        expect(modelStateAdapter).to.be.instanceOf(ModelStateAdapter)
    })

})

describe('setupSetupDataAccess', function() {

    it('Should construct DataAccess', async function() {
        const pouchDB = {}
        const pouchDBDataAccess = {}
        const constructPouchDb = sinon.stub().returns(pouchDB)
        const constructPouchDBDataAccess = sinon.stub().returns(pouchDBDataAccess)
        const url = 'url'
        const dataAccess = setupSetupDataAccess(constructPouchDb as any, constructPouchDBDataAccess as any)(url)
        expect(constructPouchDb).to.be.calledWith(url)
        expect(constructPouchDb).to.be.calledWithNew
        expect(constructPouchDBDataAccess).to.be.calledWith(pouchDB)
        expect(constructPouchDBDataAccess).to.be.calledWithNew
        expect(dataAccess).to.be.equal(pouchDBDataAccess)
    })

})

describe('setupSetupMetadata', function() {

    it('Should construct ModelAccess', async function() {
        const dataAccess = {}
        const modelAccess = {}
        const setupDataAccess = sinon.stub().returns(dataAccess)
        const setupModleAccess = sinon.stub().returns(modelAccess)
        const url = 'url'
        const metadata = setupSetupMetadata(setupDataAccess as any, setupModleAccess as any)(url)
        expect(setupDataAccess).to.be.calledWith(url)
        expect(setupModleAccess).to.be.calledWith(dataAccess)
        expect(metadata).to.be.equal(modelAccess)
    })

})

describe('setupStore', function() {

    it('Should construct Store', async function() {
        Vue.use(Vuex)
        const metadata: ModelAccess = {
            models: {
                dataPath: 'dataModel' as any,
                storePath: 'storeModel' as any
            }
        }
        const dataAccess = {}
        const typedDataAccess = {}
        const model = {}
        const modelStateAdapter = {
            state: sinon.stub().returns('module')
        }
        const setupMetadata = sinon.stub().returns(metadata)
        const setupDataAccess = sinon.stub().returns(dataAccess)
        const setupTypedDataAccess = sinon.stub().returns(typedDataAccess)
        const setupModel = sinon.stub().returns(model)
        const setupModelStateAdapter = sinon.stub().returns(modelStateAdapter)
        const config: StateConfig = {
            metadata: 'metadata',
            data: {
                data: 'dataPath'
            },
            stores: {
                store: 'storePath'
            }
        }
        const store = await setupStore(setupMetadata as any, setupDataAccess as any,
          setupTypedDataAccess as any, setupModel as any, setupModelStateAdapter as any)(config)

        expect(setupMetadata).to.be.calledWith('metadata')
        expect(setupDataAccess).to.be.calledWith('data')
        expect(setupTypedDataAccess).to.be.calledWith('dataModel', dataAccess)
        expect(setupModel).to.be.calledWith(metadata, [typedDataAccess])
        expect(setupModelStateAdapter).to.be.calledWith(model)
        expect(modelStateAdapter.state).to.be.calledWith('storeModel')
        expect(store).to.be.instanceOf(Store)
        expect(store.hasModule('store')).to.be.true
    })

})
