import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {Subject} from 'rxjs'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {IndexModel} from '../src/data'
import { Author, Book, Genre, Library } from '../src/model'
import { Entity, PouchCRUD } from '../src/crud'
const {expect} = chai.use(sinonChai).use(chaiAsPromised)

describe('data', function() {
  describe('IndexModel', function() {
    describe('load', function() {
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
          list: sinon.spy(list),
          changes: sinon.stub().returns(new Subject())
        } as unknown as PouchCRUD

        const model = new IndexModel(crud, [Book, Author,  Genre, Library])
        await model.load()

        expect(Book.resolveAuthor(model.index, await model.get<Book<string>>(Book,'book-a')))
          .to.have.nested.property('[0].name', 'author A')
        expect(Book.resolveGenre(model.index, await model.get<Book<string>>(Book,'book-a')))
          .to.have.nested.property('[0].name', 'genre A')
        expect(Book.resolveLibraries(model.index, await model.get<Book<string>>(Book,'book-a')))
          .to.have.nested.property('[0].library.name', 'library A')
        expect(Author.resolveBooks(model.index, await model.get<Author<string>>(Author,'author-a')))
          .to.have.nested.property('[0].title', 'book B')
        expect(Genre.resolveBooks(model.index, await model.get<Genre<string>>(Genre,'genre-a')))
          .to.have.nested.property('[0].title', 'book B')
        expect(Library.resolveEntries(model.index, await model.get<Library<string>>(Library,'library-a')))
          .to.have.nested.property('[0].book.title', 'book B')

      })
      it('should resolve reverse reference', async function() {
        const crud = {
          list: sinon.spy(list),
          changes: sinon.stub().returns(new Subject())
        } as unknown as PouchCRUD

        const model = new IndexModel(crud, [Book, Author,  Genre, Library])
        await model.load()

        expect(Book.resolveAuthor(model.index, await model.get<Book<string>>(Book,'book-b')))
          .to.have.nested.property('[0].name', 'author A')
        expect(Book.resolveGenre(model.index, await model.get<Book<string>>(Book,'book-b')))
          .to.have.nested.property('[0].name', 'genre A')
        expect(Book.resolveLibraries(model.index, await model.get<Book<string>>(Book,'book-b')))
          .to.have.nested.property('[0].library.name', 'library A')
        expect(Author.resolveBooks(model.index, await model.get<Author<string>>(Author,'author-a')))
          .to.have.nested.property('[1].title', 'book A')
        expect(Genre.resolveBooks(model.index, await model.get<Genre<string>>(Genre,'genre-a')))
          .to.have.nested.property('[1].title', 'book A')
        expect(Library.resolveEntries(model.index, await model.get<Library<string>>(Library,'library-a')))
          .to.have.nested.property('[1].book.title', 'book A')
      })
    })
  })
})
