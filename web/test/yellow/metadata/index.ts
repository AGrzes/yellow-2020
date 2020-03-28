import 'mocha'
import {fixupModel, Model, Class, DataType, StructuralFeature, Relation} from '../../../src/yellow/metadata'
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

    it('Should set class and dataType name',async function() {
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
        expect(model).to.have.nested.property('classes.a.name','a')
        expect(model).to.have.nested.property('dataTypes.a.name','a')
    })

    it('Should set feature name',async function() {
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
        expect(model).to.have.nested.property('classes.a.features.a.name','a')
    })

    it('Should set feature multiplicity',async function() {
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
        expect(model).to.have.nested.property('classes.a.features.a.multiplicity','?')
    })
    it('Should set feature model',async function() {
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
        expect(model).to.have.nested.property('classes.a.features.a.model',model)
    })

    it('Should set reverse of the reverse relation',async function() {
        const b: Relation = {} as Relation
        const model: Model = {
            classes:{
                a: {
                    features: {
                        a: {
                            target: {},
                            reverse: b
                        } as Relation,
                        b
                    }
                } as unknown as Class
            },
            dataTypes:{}
        }
        fixupModel(model)
        expect(model).to.have.nested.property('classes.a.features.b.reverse',model.classes.a.features.a)
    })
})