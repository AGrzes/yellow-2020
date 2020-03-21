import 'mocha'
import {ModelDescriptor, SimpleModelAccess, AttributeDescriptor} from '../../../src/yellow/metadata/simple'
import {expect}  from 'chai'
import { DataAccess } from '../../../src/yellow/data'

describe('SimpleModelAccess', function() {

    it('Should resolve model',async function() {
        const modelAccess = await SimpleModelAccess.loadFromAdapter({
            async list() {
                return [{
                    data: {
                        classes: {
                            shape: {
                                name: 'shape',
                                features: {}
                            },
                            square: {
                                parent: {
                                    $ref: '#classes/shape'
                                },
                                name: 'square',
                                features: {
                                    width: {
                                        name: 'width',
                                        multiplicity: '1',
                                        type: {
                                            $ref: '#dataTypes/length'
                                        }
                                    }
                                }
                            },
                            rectangle: {
                                parent: {
                                    $ref: '#classes/square'
                                },
                                name: 'rectangle',
                                features: {
                                    height: {
                                        name: 'height',
                                        multiplicity: '1',
                                        type: {
                                            $ref: '#dataTypes/length'
                                        }
                                    }
                                }
                            },
                            circle: {
                                parent: {
                                    $ref: '#classes/shape'
                                },
                                name: 'circle',
                                features: {
                                    radius: {
                                        name: 'radius',
                                        multiplicity: '1',
                                        type: {
                                            $ref: '#dataTypes/length'
                                        }
                                    }
                                }
                            }
                        },
                        dataTypes: {
                            length: {
                                name: 'length',
                                nativeType: 'number'
                            }
                        }
                    } as ModelDescriptor,
                    key: 'shapes'
                },{
                    data: {
                        classes: {
                            symbol: {
                                name: 'symbol',
                                features: {
                                    label: {
                                        name: 'label',
                                        multiplicity: '1',
                                        type: {
                                            $ref: '#dataTypes/text'
                                        }
                                    },
                                    shape: {
                                        name: 'shape',
                                        multiplicity: '1',
                                        target: {
                                            $ref: 'shapes#classes/shape'
                                        }
                                    }
                                }
                            }
                        },
                        dataTypes: {
                            text: {
                                name: 'text',
                                nativeType: 'string'
                            }
                        }
                    } as ModelDescriptor,
                    key: 'symbols'
                }]
            }
        } as unknown as DataAccess<ModelDescriptor,string,any,any> )
        expect(modelAccess.models).to.have.property('shapes')
        expect(modelAccess.models).to.have.property('symbols')
        expect(modelAccess.models.shapes.classes).to.have.property('square')
        expect(modelAccess.models.shapes.classes).to.have.property('circle')
        expect(modelAccess.models.shapes.classes).to.have.property('rectangle')
        expect(modelAccess.models.shapes.classes).to.have.property('shape')
        expect(modelAccess.models.symbols.classes).to.have.property('symbol')
        expect(modelAccess.models.shapes.classes.square.features).to.have.property('width')
        expect(modelAccess.models.shapes.classes.square.features.width).to.have.property('multiplicity','1')
        expect(modelAccess.models.shapes.classes.square.features.width).to.have.property('name','width')
        expect(modelAccess.models.shapes.classes.square.features.width).to.have.property('type',modelAccess.models.shapes.dataTypes.length)
        expect(modelAccess.models.shapes.classes.square).to.have.property('parent',modelAccess.models.shapes.classes.shape)
        expect(modelAccess.models.shapes.classes.rectangle.features).to.have.property('height')
        expect(modelAccess.models.shapes.classes.rectangle.features.height).to.have.property('multiplicity','1')
        expect(modelAccess.models.shapes.classes.rectangle.features.height).to.have.property('name','height')
        expect(modelAccess.models.shapes.classes.rectangle.features.height).to.have.property('type',modelAccess.models.shapes.dataTypes.length)
        expect(modelAccess.models.shapes.classes.rectangle).to.have.property('parent',modelAccess.models.shapes.classes.square)
        expect(modelAccess.models.shapes.classes.circle.features).to.have.property('radius')
        expect(modelAccess.models.shapes.classes.circle.features.radius).to.have.property('multiplicity','1')
        expect(modelAccess.models.shapes.classes.circle.features.radius).to.have.property('name','radius')
        expect(modelAccess.models.shapes.classes.circle.features.radius).to.have.property('type',modelAccess.models.shapes.dataTypes.length)
        expect(modelAccess.models.shapes.dataTypes.length).to.have.nested.property('name','length')
        expect(modelAccess.models.shapes.dataTypes.length).to.have.nested.property('nativeType','number')
        expect(modelAccess.models.shapes.classes.circle).to.have.property('parent',modelAccess.models.shapes.classes.shape)
        expect(modelAccess.models.shapes.classes.shape.children).to.contain(modelAccess.models.shapes.classes.square)
        expect(modelAccess.models.shapes.classes.shape.children).to.contain(modelAccess.models.shapes.classes.circle)
        expect(modelAccess.models.shapes.classes.square.children).to.contain(modelAccess.models.shapes.classes.rectangle)

        expect(modelAccess.models.symbols.classes.symbol.features).to.have.property('shape')
        expect(modelAccess.models.symbols.classes.symbol.features.shape).to.have.property('multiplicity','1')
        expect(modelAccess.models.symbols.classes.symbol.features.shape).to.have.property('name','shape')
        expect(modelAccess.models.symbols.classes.symbol.features.shape).to.have.property('target',modelAccess.models.shapes.classes.shape)
        expect(modelAccess.models.symbols.classes.symbol.features).to.have.property('label')
        expect(modelAccess.models.symbols.classes.symbol.features.label).to.have.property('multiplicity','1')
        expect(modelAccess.models.symbols.classes.symbol.features.label).to.have.property('name','label')
        expect(modelAccess.models.symbols.classes.symbol.features.label).to.have.property('type',modelAccess.models.symbols.dataTypes.text)

        expect(modelAccess.models.symbols.dataTypes.text).to.have.nested.property('name','text')
        expect(modelAccess.models.symbols.dataTypes.text).to.have.nested.property('nativeType','string')
    })

})