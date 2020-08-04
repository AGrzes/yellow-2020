import { AttributeDescriptor, RelationDescriptor, resolveModels } from './simple'

export const {metamodel, typescript} = resolveModels({metamodel: {
    classes: {
        ModelElement: {
            name: 'ModelElement',
            features: {
                model: {
                    name: 'model',
                    multiplicity: '1',
                    target: {
                        $ref: '#classes/Model'
                    }
                } as RelationDescriptor
            }
        },
        Named: {
            name: 'Named',
            parent: {
                $ref: '#classes/ModelElement'
            },
            features: {
                name: {
                    name: 'name',
                    multiplicity: '1',
                    type: {
                        $ref: 'typescript#dataTypes/string'
                    }
                } as AttributeDescriptor
            }
        },
        StructuralFeature: {
            name: 'StructuralFeature',
            parent: {
                $ref: '#classes/Named'
            },
            features: {
                owner: {
                    name: 'owner',
                    multiplicity: '1',
                    target: {
                        $ref: '#classes/Class'
                    },
                    reverse: {
                        $ref: '#classes/Class/features/features'
                    }
                } as RelationDescriptor,
                multiplicity: {
                    name: 'multiplicity',
                    multiplicity: '1',
                    type: {
                        $ref: 'typescript#dataTypes/string'
                    }
                } as AttributeDescriptor
            }
        },
        DataType: {
            name: 'DataType',
            parent: {
                $ref: '#classes/Named'
            },
            features: {
                nativeType: {
                    name: 'nativeType',
                    multiplicity: '1',
                    type: {
                        $ref: 'typescript#dataTypes/string'
                    }
                } as AttributeDescriptor
            }
        },
        Attribute: {
            name: 'Attribute',
            parent: {
                $ref: '#classes/StructuralFeature'
            },
            features: {
                type: {
                    name: 'type',
                    multiplicity: '1',
                    target: {
                        $ref: '#classes/DataType'
                    }
                } as RelationDescriptor
            }
        },
        Relation: {
            name: 'Relation',
            parent: {
                $ref: '#classes/StructuralFeature'
            },
            features: {
                target: {
                    name: 'target',
                    multiplicity: '1',
                    target: {
                        $ref: '#classes/Class'
                    }
                } as RelationDescriptor,
                reverse: {
                    name: 'reverse',
                    multiplicity: '?',
                    target: {
                        $ref: '#classes/Relation'
                    }
                } as RelationDescriptor
            }
        },
        Class: {
            name: 'Class',
            parent: {
                $ref: '#classes/Named'
            },
            features: {
                parent: {
                    name: 'parent',
                    multiplicity: '?',
                    target: {
                        $ref: '#classes/Class'
                    },
                    reverse: {
                        $ref: '#classes/Class/features/children'
                    }
                } as RelationDescriptor,
                children: {
                    name: 'children',
                    multiplicity: '*',
                    target: {
                        $ref: '#classes/Class'
                    },
                    reverse: {
                        $ref: '#classes/Class/features/parent'
                    }
                } as RelationDescriptor,
                features: {
                    name: 'features',
                    multiplicity: '*',
                    target: {
                        $ref: '#classes/StructuralFeature'
                    },
                    reverse: {
                        $ref: '#classes/StructuralFeature/features/owner'
                    }
                } as RelationDescriptor
            }
        },
        Model: {
            name: 'Model',
            features: {
                classes: {
                    name: 'classes',
                    multiplicity: '*',
                    target: {
                        $ref: '#classes/Class'
                    },
                    reverse: {
                        $ref: '#classes/ModelElement/features/owner'
                    }
                } as RelationDescriptor,
                dataTypes: {
                    name: 'dataTypes',
                    multiplicity: '*',
                    target: {
                        $ref: '#classes/DataType'
                    },
                    reverse: {
                        $ref: '#classes/ModelElement/features/owner'
                    }
                } as RelationDescriptor
            }
        }
    },
    dataTypes: {}
}, typescript: {
    classes: {},
    dataTypes: {
        string: {
            name: 'string',
            nativeType: 'string'
        },
        number: {
            name: 'number',
            nativeType: 'number'
        },
        boolean: {
            name: 'boolean',
            nativeType: 'boolean'
        }
    }
}})
