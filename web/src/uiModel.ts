import { UIModel } from './yellow/ui-model'

export const uiModel: UIModel = {
    views: [{
      dataModel: 'book',
      pathName: 'books',
      listItemTemplate: '<h1>{{item.title}}</h1>',
      detailsTemplate: '<h1>{{item.title}}</h1>'
    }]
  }