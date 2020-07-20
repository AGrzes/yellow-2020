import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {BookModel, Index} from '../src/data'
import { Author, Book, Genre, Library } from '../src/model'
import { Entity, PouchCRUD } from '../src/crud'
const {expect} = chai.use(sinonChai).use(chaiAsPromised)

describe('data', function() {
  describe('BookModel', function() {
    describe('init', function() {
      function list(type: Entity<any>) {
        if (type === Book) {
          return [{
            title: 'book A',
            author: ['author-a'],
            genre: ['genre-a'],
            libraries: [{
              library: 'library-a'
            }]
          }, {
            title: 'book B'
          }]
        }
        if (type === Author) {
          return [{
            name: 'author A',
            books: ['book-b']
          }]
        }
        if (type === Genre) {
          return [{
            name: 'genre A',
            books: ['book-b']
          }]
        }
        if (type === Library) {
          return [{
            name: 'library A',
            entries: [{
              book: 'book-b'
            }]
          }]
        }
      }
      it('should resolve forward reference', async function() {
        const crud = {
          list: sinon.spy(list)
        } as unknown as PouchCRUD

        const model = new BookModel(crud, {books: Book, authors: Author, genres: Genre, libraries: Library})
        await model.init()

        expect(Book.resolveAuthor(model.index, model.books['book-a']))
          .to.have.nested.property('[0].name', 'author A')
        expect(Book.resolveGenre(model.index, model.books['book-a']))
          .to.have.nested.property('[0].name', 'genre A')
        expect(Book.resolveLibraries(model.index, model.books['book-a']))
          .to.have.nested.property('[0].library.name', 'library A')
        expect(Author.resolveBooks(model.index, model.authors['author-a']))
          .to.have.nested.property('[0].title', 'book B')
        expect(Genre.resolveBooks(model.index, model.genres['genre-a']))
          .to.have.nested.property('[0].title', 'book B')
        expect(Library.resolveEntries(model.index, model.libraries['library-a']))
          .to.have.nested.property('[0].book.title', 'book B')

      })
      it('should resolve reverse reference', async function() {
        const crud = {
          list: sinon.spy(list)
        } as unknown as PouchCRUD

        const model = new BookModel(crud, {books: Book, authors: Author, genres: Genre, libraries: Library})
        await model.init()

        expect(Book.resolveAuthor(model.index, model.books['book-b']))
          .to.have.nested.property('[0].name', 'author A')
        expect(Book.resolveGenre(model.index, model.books['book-b']))
          .to.have.nested.property('[0].name', 'genre A')
        expect(Book.resolveLibraries(model.index, model.books['book-b']))
          .to.have.nested.property('[0].library.name', 'library A')
        expect(Author.resolveBooks(model.index, model.authors['author-a']))
          .to.have.nested.property('[1].title', 'book A')
        expect(Genre.resolveBooks(model.index, model.genres['genre-a']))
          .to.have.nested.property('[1].title', 'book A')
        expect(Library.resolveEntries(model.index, model.libraries['library-a']))
          .to.have.nested.property('[1].book.title', 'book A')
      })
    })
  })
  describe('Index', function() {
    class TestClass {
      public relation?: string[]
      public reverseRelation?: string[]
      public relationEntity?: {target:string, source?:string}[]
      public reverseRelationEntity?: {}[]
      public static typeTag = 'test'
      public static key(instance: TestClass) {
        return 'key'
      }
      public static index<T>(index: Index, instance: TestClass) {
        index.indexRelation(TestClass,instance,'relation',TestClass,'reverseRelation')
        index.indexRelationEntity(TestClass,instance,'relationEntity','target',TestClass,'reverseRelationEntity','source')
      }
      public static resolve<T>(index: Index, genre: TestClass) {
        //
      }
    }
    describe('index', function() {
      it('should record changes', async function() {

        const index = new Index()
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
        const index = new Index()
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
    })
  })
})
