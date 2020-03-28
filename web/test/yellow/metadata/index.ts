import 'mocha'
import {fixupModel, Model, Class, DataType, StructuralFeature} from '../../../src/yellow/metadata'
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

    it('Should set owner',async function() {
        const model: Model = {
            classes:{
                a: {
                    features: {
                        a: {

                        } as StructuralFeature
                    }
                } as unknown as Class
            },
            dataTypes:{}
        }
        fixupModel(model)
        expect(model).to.have.nested.property('classes.a.features.a.owner',model.classes.a)
    })
})