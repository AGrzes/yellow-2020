import 'mocha'
import {setupModel, TypedDataAccess} from '../../../src/yellow/model'
import {expect}  from 'chai'
import { ModelAccess, Model as Metamodel, Class, Relation, fixupModel} from '../../../src/yellow/metadata'


function createMetamodel() : ModelAccess {
    const B: Class = {
        features: {},
        model: null
    } as Class
    const A: Class = {
        features: {
            b: {
                multiplicity: '1',
                target: B
            } as Relation,
            ba: {
                multiplicity: '*',
                target: B
            } as Relation
        },
        model: null
    } as unknown as Class
    B.features['^b'] = {
        multiplicity: '1',
        target: A,
        reverse: A.features.b
    } as Relation
    B.features['^ba'] = {
        multiplicity: '1',
        target: A,
        reverse: A.features.ba
    } as Relation

    const model: Metamodel = {
        classes: {
            A,
            B
        },
        dataTypes: {

        }
    }

    fixupModel(model)
    const access: ModelAccess = {
        models: {
            model
        }
    }


    return access
}

function createDataAccess(meatmodel: ModelAccess): TypedDataAccess<any,string,string,never> {
    return {
        async list() {
            return [{
                key: 'a',
                type: meatmodel.models.model.classes.A,
                data: {
                    b: 'b',
                    ba: ['b']
                }
            }, {
                key: 'b',
                type: meatmodel.models.model.classes.B,
                data: {
                    x: 'X'
                }
            }]
        }
    } as TypedDataAccess<any,string,string,never>
}

describe('model', function() {
    describe('setupModel', function() {
        it('Should use provided model',async function() {
            const metamodel = createMetamodel()
            const model = await setupModel(metamodel,[])
            expect(model).to.have.property('metaModel',metamodel)
        })
        it('Should expose class instances',async function() {
            const metamodel = createMetamodel()
            const model = await setupModel(metamodel,[createDataAccess(metamodel)])
            expect(model.list(metamodel.models.model.classes.A)).to.have.length(1)
            expect(model.list(metamodel.models.model.classes.B)).to.have.length(1)
        })
        it('Should expose instances by key',async function() {
            const metamodel = createMetamodel()
            const model = await setupModel(metamodel,[createDataAccess(metamodel)])
            expect(model.get(metamodel.models.model.classes.A,'a')).to.exist
            expect(model.get(metamodel.models.model.classes.B,'b')).to.exist
        })

        it('Should resolve relations',async function() {
            const metamodel = createMetamodel()
            const model = await setupModel(metamodel,[createDataAccess(metamodel)])
            expect(model.get(metamodel.models.model.classes.A,'a')).to.have.property('b',model.get(metamodel.models.model.classes.B,'b'))
        })
        it('Should resolve collection relations',async function() {
            const metamodel = createMetamodel()
            const model = await setupModel(metamodel,[createDataAccess(metamodel)])
            expect(model.get(metamodel.models.model.classes.A,'a')).to.have.deep.property('ba',[model.get(metamodel.models.model.classes.B,'b')])
        })
        it('Should resolve reverse relations',async function() {
            const metamodel = createMetamodel()
            const model = await setupModel(metamodel,[createDataAccess(metamodel)])
            expect(model.get(metamodel.models.model.classes.B,'b')).to.have.property('^b',model.get(metamodel.models.model.classes.A,'a'))
        })
        it('Should resolve reverse relations of collection',async function() {
            const metamodel = createMetamodel()
            const model = await setupModel(metamodel,[createDataAccess(metamodel)])
            expect(model.get(metamodel.models.model.classes.B,'b')).to.have.property('^ba',model.get(metamodel.models.model.classes.A,'a'))
        })
    })
})