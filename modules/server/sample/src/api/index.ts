import {json, Router} from 'express'
const router = Router()
router.use(json())

router.get('/config',(req,res) => {
    res.send({
        state: {
            metadata: 'http://localhost:5984/model',
            data: {
                'http://localhost:5984/books': 'books.classes.book',
                'http://localhost:5984/authors': 'books.classes.author'
            },
            stores: {
                book: 'books.classes.book',
                author: 'books.classes.author'
            }
        },
        ui:{
            views: [{
              dataModel: 'book',
              pathName: 'books',
              listItemTemplate: `{{item.title}}`,
              detailsTemplate: `
              <h1>{{item.title}}</h1>
              <h2>Authors</h2>
              <ul><li v-for="author in item.author"><router-link :to="{name:'authors-item', params:{key: author._id}}">{{author.name}}</router-link></li></ul>
              <a @click="edit()">edit</a>
              `
            },{
              dataModel: 'author',
              pathName: 'authors',
              listItemTemplate: `{{item.name}}`,
              detailsTemplate: `
              <h1>{{item.name}}</h1>
              <h2>Books</h2>
              <ul><li v-for="book in item.books"><router-link :to="{name:'books-item', params:{key: book._id}}"> {{book.title}}</router-link></li></ul>
              <a @click="edit()">edit</a>
              `
            }]
          }
    })
})
export default router
