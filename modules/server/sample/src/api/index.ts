import {json, Router} from 'express'
const router = Router()
router.use(json())

router.get('/config', (req, res) => {
    res.send({
        state: {
            metadata: 'http://couchdb:5984/model',
            data: {
                'http://couchdb:5984/books': 'books.classes.book',
                'http://couchdb:5984/authors': 'books.classes.author'
            },
            stores: {
                book: 'books.classes.book',
                author: 'books.classes.author'
            }
        },
        ui: {
            navigation: [{
              label: 'Books',
              route: { name: 'bookList'}
            }, {
              label: 'Authors',
              route: { name: 'authorList'}
            }, {
              label: 'Library',
              route: { name: 'libraryList'}
            }, {
              label: 'Genre',
              route: { name: 'genreList'}
            }]
          }
    })
})
export default router
