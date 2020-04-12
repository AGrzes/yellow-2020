import { UIModel } from './yellow/ui-model'

export const uiModel: UIModel = {
    views: [{
      dataModel: 'book',
      pathName: 'books',
      listItemTemplate: `<h1>{{item.title}}<small><a @click="edit(key)">edit</a></small></h1>`,
      detailsTemplate: `
      <h1>{{item.title}}</h1>
      <h2>Authors</h2>
      <ul><li v-for="author in item.author"><router-link :to="{name:'authors-item', params:{key: author._id}}">{{author.name}}</router-link></li></ul>
      <a @click="edit()">edit</a>
      `
    },{
      dataModel: 'author',
      pathName: 'authors',
      listItemTemplate: `<h1>{{item.name}}<small><a @click="edit(key)">edit</a></small></h1>`,
      detailsTemplate: `
      <h1>{{item.name}}</h1>
      <h2>Books</h2>
      <ul><li v-for="book in item.books"><router-link :to="{name:'books-item', params:{key: book._id}}"> {{book.title}}</router-link></li></ul>
      <a @click="edit()">edit</a>
      `
    }]
  }