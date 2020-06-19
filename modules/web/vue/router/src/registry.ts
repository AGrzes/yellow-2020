import { Location } from 'vue-router'

export function resolveItemRoute(type: string,id: string, selector?: string): Location {
  return {
    name: ({book: 'bookDetails', author: 'authorDetails'})[type], 
    params: {key:id}
  }
}

export function resolveListRoute(type: string, selector?: string): Location {
  return {
    name: ({book: 'bookList', author: 'authorList'})[type]
  }
}
