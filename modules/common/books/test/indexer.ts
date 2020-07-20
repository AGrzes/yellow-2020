import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import 'mocha'
import { Indexer} from '../src/indexer'
const {expect} = chai.use(chaiAsPromised)

describe('indexer', function() {
  describe('Indexer', function() {
    class TestClass {
      public relation?: string[]
      public reverseRelation?: string[]
      public relationEntity?: {target:string, source?:string}[]
      public reverseRelationEntity?: {}[]
      public static typeTag = 'test'
      public static key(instance: TestClass) {
        return 'key'
      }
      public static index<T>(index: Indexer, instance: TestClass) {
        index.indexRelation(TestClass,instance,'relation',TestClass,'reverseRelation')
        index.indexRelationEntity(TestClass,instance,'relationEntity','target',TestClass,'reverseRelationEntity','source')
      }
      public static resolve<T>(index: Indexer, genre: TestClass) {
        //
      }
    }
    describe('index', function() {
      it('should record changes', async function() {

        const index = new Indexer()
        const changes = index.index(TestClass,{relation:['a'],relationEntity:[{target: 'a'}]})

        expect(changes)
          .to.have.property('length',3)
        expect(changes[0]).to.be.deep.equal({entity: TestClass, key: 'key', change: 'change' })
        expect(changes[1]).to.be.deep.equal({
          source: TestClass, sourceKey: 'key', sourcePath: 'relation', target: TestClass, targetKey: 'a', targetPath: 'reverseRelation', change: 'addRelation'
        })
        expect(changes[2]).to.be.deep.equal({
          source: TestClass, sourceKey: 'key', sourcePath: 'relationEntity.target', target: TestClass, targetKey: 'a', targetPath: 'reverseRelationEntity.source', change: 'addRelation'
        })
      })
      it('should record relation removal', async function() {
        const index = new Indexer()
        index.index(TestClass,{relation:['a'],relationEntity:[{target: 'a'}]})
        const changes = index.index(TestClass,{relation:[],relationEntity:[]})

        expect(changes)
          .to.have.property('length',3)
        expect(changes[0]).to.be.deep.equal({entity: TestClass, key: 'key', change: 'change' })
        expect(changes[1]).to.be.deep.equal({
          source: TestClass, sourceKey: 'key', sourcePath: 'relation', target: TestClass, targetKey: 'a', targetPath: 'reverseRelation', change: 'removeRelation'
        })
        expect(changes[2]).to.be.deep.equal({
          source: TestClass, sourceKey: 'key', sourcePath: 'relationEntity.target', target: TestClass, targetKey: 'a', targetPath: 'reverseRelationEntity.source', change: 'removeRelation'
        })
      })
      it('should record removal', async function() {
        const index = new Indexer()
        index.index(TestClass,{relation:['a'],relationEntity:[{target: 'a'}]})
        const changes = index.remove(TestClass,'key')

        expect(changes)
          .to.have.property('length',3)
        expect(changes[0]).to.be.deep.equal({entity: TestClass, key: 'key', change: 'delete' })
        expect(changes[1]).to.be.deep.equal({
          source: TestClass, sourceKey: 'key', sourcePath: 'relation', target: TestClass, targetKey: 'a', targetPath: 'reverseRelation', change: 'removeRelation'
        })
        expect(changes[2]).to.be.deep.equal({
          source: TestClass, sourceKey: 'key', sourcePath: 'relationEntity.target', target: TestClass, targetKey: 'a', targetPath: 'reverseRelationEntity.source', change: 'removeRelation'
        })
      })
    })
  })
})
