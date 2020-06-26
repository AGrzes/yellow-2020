import 'mocha'
import {ModelBuilder} from '../src/builder'
import {expect}  from 'chai'
import { DataAccess } from '@agrzes/yellow-2020-common-data'

describe('ModelBuilder', function() {
  it('should create class ',async function() {
    const model = new ModelBuilder().type('aType').build()
    expect(model.classes).to.have.property('aType')
  })

  it('should create datatype ',async function() {
    const model = new ModelBuilder().datatype('aType','String').build()
    expect(model.dataTypes).to.have.property('aType')
    expect(model.dataTypes.aType).to.have.property('nativeType','String')
  })

  it('should create datatype from type',async function() {
    const model = new ModelBuilder().datatype(String).build()
    expect(model.dataTypes).to.have.property('String')
    expect(model.dataTypes.String).to.have.property('nativeType','String')
  })

  it('should create types datatype from type',async function() {
    const model = new ModelBuilder().datatype('aType',String).build()
    expect(model.dataTypes).to.have.property('aType')
    expect(model.dataTypes.aType).to.have.property('nativeType','String')
  })

  it('should create attribute ',async function() {
    const model = new ModelBuilder().type('aType').attribute('attribute','aType').build()
    expect(model.classes).to.have.property('aType')
  })
})