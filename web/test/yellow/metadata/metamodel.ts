import 'mocha'
import {metamodel} from '../../../src/yellow/metadata/metamodel'
import {expect}  from 'chai'

describe('meatamodel', function() {

    it('Should resolve correctly',async function() {
        expect(metamodel).to.not.be.null
    })
})