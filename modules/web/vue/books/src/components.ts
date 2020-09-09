import { Author, Book, Genre, Library, Series, Reading } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, RelationEditor, RelationEntityEditor, 
  TextEditor, LongTextEditor, CurrencyEditor, BooleanEditor, DateEditor, SingleRelationEditor} from '@agrzes/yellow-2020-web-vue-components'
import { resolveListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue from 'vue'
import { listRelations, itemRelations, listSingleRelations, itemSingleRelations } from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const EditBook = Vue.extend({
  props: ['content'],
  template: `
<form>
  <text-editor label="Title" property="title" :item="current"></text-editor>
  <long-text-editor label="Description" property="description" :item="current"></long-text-editor>
  <relation-editor label="Author" property="author" :entity="authorType" :item="current"></relation-editor>
  <relation-editor label="Genre" property="genre" :entity="genreType" :item="current"></relation-editor>
  <relation-editor label="Series" property="series" :entity="seriesType" :item="current"></relation-editor>
  <relation-entity-editor label="Libraries" property="libraries" :entity="libraryType" :item="current" nestedProperty="library" v-slot="x">
    <text-editor label="Url" property="url" :item="x.entity"></text-editor>
    <currency-editor label="Price" property="price" :item="x.entity"></currency-editor>
    <boolean-editor label="Owned" property="owned" :item="x.entity"></boolean-editor>
  </relation-entity-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  computed: {
    authorType() {
      return Author
    },
    genreType() {
      return Genre
    },    
    seriesType() {
      return Series
    },    
    libraryType() {
      return Library
    }
  },
  components: {RelationEditor,RelationEntityEditor, TextEditor, LongTextEditor, CurrencyEditor, BooleanEditor}
})

export const BooksList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="mr-1">
        {{item.title}}
        <small v-for="author in authors[key]" class="ml-1">
          <details-link :item="author">{{author.name}}</details-link>
        </small>
        <small v-for="serie in series[key]" class="ml-1">
          <details-link :item="serie">{{serie.name}}</details-link>
        </small>
      </span>
      <span class="badge badge-pill badge-primary mr-1" v-for="genre in genres[key]">
        {{genre.name}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center ml-auto">
        <edit-button :item="item" :component="editBook"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="bookType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  computed: {
    bookType() {
      return Book
    },
    editBook() {
      return EditBook
    },
    ...listRelations(Book,{authors: 'author',genres:'genre',series:'series'})
  }
})

export const BooksTable = Vue.extend({
  props: {
    list: Object
  },
  template: `
<table class="table-sm table-striped">
  <thead>
    <tr>
      <th>Title</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item,key) in list" >
      <td>{{item.title}}</td>
      <td>
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </td>
    </tr>
  </tbody>
</table>`,
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BooksCards = Vue.extend({
  props: {
    list: Object
  },
  template: `
<div class="row">
  <div v-for="(item,key) in list" class="col-3 mt-4">
    <div class="card h-100" >
      <div class="card-body">
        {{item.title}}
      </div>
      <div class="card-footer text-right">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </div>
    </div>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsButton
  }
})

export const BookDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      {{item.title}}
      <span class="badge badge-pill badge-primary mr-1" v-for="genre in genres">
        {{genre.name}}
      </span>
    </h1>
    <h2>Authors</h2>
    <ul>
      <li v-for="author in authors">
        <details-link :item="author">{{author.name}}</details-link>
      </li>
    </ul>
    <template v-if="series">
      <h2>Series</h2>
      <ul>
        <li v-for="serie in series">
          <details-link :item="serie">{{serie.name}}</details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item" :component="editBook">Edit</edit-button>
    <list-button type="book">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('book'))
    }
  },
  computed: {
    editBook() {
      return EditBook
    },
    ...itemRelations(Book,{authors:'author',genres:'genre',series: 'series'})
  }
})

export const EditAuthor = Vue.extend({
  props: ['content'],
  template: `
<form>
  <text-editor label="Name" property="name" :item="current"></text-editor>
  <long-text-editor label="Description" property="description" :item="current"></long-text-editor>
  <relation-editor label="Books" property="books" :entity="bookType" :item="current"></relation-editor>
  <relation-editor label="Series" property="series" :entity="seriesType" :item="current"></relation-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  computed: {
    bookType() {
      return Book
    },  
    seriesType() {
      return Series
    }
  },
  components: {RelationEditor, TextEditor, LongTextEditor}
})

export const AuthorList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex">
      <span class="mr-auto">
        {{item.name}}
        <span class="badge badge-pill badge-primary" v-if="books[key]">{{books[key].length}}</span>
        <small v-for="serie in series[key]">
          <details-link :item="serie">{{serie.name}}</details-link>
        </small>
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item" :component="editAuthor"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="authorType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  computed: {
    authorType() {
      return Author
    },
    editAuthor() {
      return EditAuthor
    },
    ...listRelations(Author,{books: 'books',series:'series'})
  }
})

export const AuthorDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>{{item.name}}</h1>
    <h2>Books</h2>
    <ul>
      <li v-for="book in books">
        <details-link :item="book">{{book.title}}</details-link>
      </li>
    </ul>
    <template v-if="series">
      <h2>Series</h2>
      <ul>
        <li v-for="serie in series">
          <details-link :item="serie">{{serie.name}}</details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item" :component="editAuthor">Edit</edit-button>
    <list-button type="author">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('author'))
    }
  },
  computed: {
    editAuthor() {
      return EditAuthor
    },
    ...itemRelations(Author,{books:'books',series: 'series'})
  }
})

export const LibraryList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="badge badge-info mr-1" v-if="item.kind">
        {{item.kind}}
      </span>
      <span class="mr-1">
        {{item.name}}
      </span>
      <span class="badge badge-pill badge-primary mr-auto">
        {{entries[key].length}} books
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="libraryType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton
  },
  computed: {
    libraryType() {
      return Library
    },
    ...listRelations(Library,{entries: 'entries'})
  }
})

export const LibraryDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      <span class="badge badge-info mr-1" v-if="item.kind">
        {{item.kind}}
      </span>
      {{item.name}}
    </h1>
    <p v-if="item.description">{{item.description}}</p>
    <h2>Books</h2>
    <ul>
      <li v-for="entry in entries">
        <details-link :item="entry.book" class="mr-auto">
          {{entry.book.title}}
        </details-link>
        <span class="badge badge-pill badge-primary mr-1" v-if="entry.owned">
          Owned
        </span>
        <a class="btn btn-success btn-sm mr-1" v-if="entry.url" :href="entry.url" target="_blank">
          Buy
          <span class="badge badge-light" v-if="entry.price">{{entry.price}}</span>
        </a>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="library">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('library'))
    }
  },
  computed: {
    ...itemRelations(Library,{entries:'entries'})
  }
})

export const GenreList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="mr-1">
        {{item.name}}
      </span>
      <span class="badge badge-pill badge-primary mr-auto">
        {{books[key].length}} books
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="genreType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton
  },
  computed: {
    genreType() {
      return Genre
    },
    ...listRelations(Genre,{books: 'books'})
  }
})

export const GenreDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      {{item.name}}
    </h1>
    <h2>Books</h2>
    <ul>
      <li v-for="book in books">
        <details-link :item="book" class="mr-auto">
          {{book.title}}
        </details-link>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="genre">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('genre'))
    }
  },
  computed: {
    ...itemRelations(Genre,{books:'books'})
  }
})

export const SeriesList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="mr-1">
        {{item.name}}
      </span>
      <small v-for="author in authors[key]" class="mr-1">
        <details-link :item="author" class="mr-auto">
          {{author.name}}
        </details-link>
      </small>
      <span class="badge badge-pill badge-primary mr-auto">
        {{books[key].length}} books
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="seriesType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  computed: {
    seriesType() {
      return Series
    },
    ...listRelations(Series,{books: 'books', authors: 'author'})
  }
})

export const SeriesDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      {{item.name}}
    </h1>
    <h2>Books</h2>
    <ul>
      <li v-for="book in books">
        <details-link :item="book" class="mr-auto">
          {{book.title}}
        </details-link>
      </li>
    </ul>
    <template v-if="authors">
      <h2>Authors</h2>
      <ul>
        <li v-for="author in authors">
          <details-link :item="author">{{author.name}}</details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="series">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('series'))
    }
  },
  computed: {
    ...itemRelations(Series,{books:'books',authors:'author'})
  }
})

export const ReadingList = Vue.extend({
  props: {
    list: Object
  },
  template: `
<ul class="list-group">
  <li v-for="(item,key) in list" class="list-group-item">
    <span class="d-flex align-items-center">
      <span class="mr-1">
        <small>{{item.startDate}}</small>
        {{book[key].title}}
      </span>
      <span class="badge badge-pill badge-primary mr-auto">
        {{item.status}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item" :component="editReading"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="readingType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  computed: {
    readingType() {
      return Reading
    },
    editReading() {
      return EditReading
    },
    ...listSingleRelations(Reading,{book: 'book'})
  }
})

export const ReadingDetails = Vue.extend({
  props: {
    item: Object
  },
  template: `
<div class="card h-100" v-if="item">
  <div class="card-body">
    <h1>
      <small>{{item.startDate}}</small>
      {{book.title}}
      <span class="badge badge-pill badge-primary">
        {{item.status}}
      </span>
    </h1>
    <ul class="list-group">
      <li class="list-group-item" v-for="increment in item.progress">
        <small>
          {{increment.date}}
        </small>
        <span class="badge badge-pill badge-success">
        {{increment.progress}}
        </span>
        <span class="badge badge-pill badge-primary" v-if="increment.change">
          +{{increment.change}}
        </span>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item" :component="editReading">Edit</edit-button>
    <list-button type="reading">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('reading'))
    }
  },
  computed: {
    editReading() {
      return EditReading
    },
    ...itemSingleRelations(Reading,{book:'book'})
  }
})

export const EditReading = Vue.extend({
  props: ['content'],
  template: `
<form>
  <text-editor label="Start Date" property="startDate" :item="current"></text-editor>
  <single-relation-editor label="Book" property="book" :entity="bookType" :item="current"></single-relation-editor>
</form>
  `,
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  computed: {
    bookType() {
      return Book
    }
  },
  components: {SingleRelationEditor, TextEditor, DateEditor}
})
