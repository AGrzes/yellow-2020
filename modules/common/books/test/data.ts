import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {BookModel, Index} from '../src/data'
import { Author, Book, Genre, Library } from '../src/model'
import { Entity, BooksCRUD } from '../src/crud'
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
        } as unknown as BooksCRUD

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
        } as unknown as BooksCRUD

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
      /*it('should resolve cross references', async function() {
        const crud = {
          list: sinon.spy((type: Entity<any>) => {
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
          })
        } as unknown as BooksCRUD

        const model = new BookModel(crud)
        await model.init()
        expect(model).to.have.nested.property('books.book-a.author[0].name', 'author A')
        expect(model).to.have.nested.property('books.book-a.genre[0].name', 'genre A')
        expect(model).to.have.nested.property('books.book-a.libraries[0].library.name', 'library A')
        expect(model).to.have.nested.property('books.book-b.author[0].name', 'author A')
        expect(model).to.have.nested.property('books.book-b.genre[0].name', 'genre A')
        expect(model).to.have.nested.property('books.book-b.libraries[0].library.name', 'library A')

      })*/
    })
  })
})
