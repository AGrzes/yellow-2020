import 'mocha'
import {fixupModel, Model, Class, DataType} from '../../../src/yellow/metadata'
import {expect}  from 'chai'

describe('fixupModel', function() {

    it('Should set model',async function() {
        const model: Model = {
            classes:{
                a: {

                } as Class
            },
            dataTypes:{
                a: {

                } as DataType
            }
        }
        fixupModel(model)
        expect(model).to.have.nested.property('classes.a.model',model)
        expect(model).to.have.nested.property('dataTypes.a.model',model)
    })
})