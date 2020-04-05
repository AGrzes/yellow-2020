import { UIModel } from './yellow/ui-model'

export const uiModel: UIModel = {
    views: [{
      dataModel: 'book',
      pathName: 'books',
      listItemTemplate: `<h1>{{item.title}}</h1>`,
      detailsTemplate: `
      <h1>{{item.title}}</h1>
      <h2><small v-for="author in item.author"> {{author.name}}</small></h2>
      `
    },{
      dataModel: 'author',
      pathName: 'authors',
      listItemTemplate: `<h1>{{item.name}}</h1>`,
      detailsTemplate: `
      <h1>{{item.name}}</h1>
      <h2>Books</h2>
      <ul><li v-for="book in item.books"> {{book.title}}</li></ul>
      `
    }]
  }