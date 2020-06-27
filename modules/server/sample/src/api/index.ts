import {json, Router} from 'express'
const router = Router()
router.use(json())

router.get('/config',(req,res) => {
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
        ui:{
            navigation: [{
              label: 'Books',
              route: { name: 'bookList'},
              children: [{
                label: 'Table',
                route: { name: 'bookTable'}
              },{
                label: 'Cards',
                route: { name: 'bookCards'}
              }]
            },{
              label: 'Authors',
              route: { name: 'authorList'}
            }]
          }
    })
})
export default router
