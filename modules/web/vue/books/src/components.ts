import { Author, Book, Genre, Library, Series } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton } from '@agrzes/yellow-2020-web-vue-components'
import { resolveListRoute } from '@agrzes/yellow-2020-web-vue-router'
import _ from 'lodash'
import Vue from 'vue'
import { mapState } from 'vuex'

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
        <small v-for="author in authors[key]" class="ml-1">{{author.name}}</small>
        <small v-for="serie in series[key]">
          <details-link type="series" :id="seriesKey(serie)" :item="series">{{serie.name}}</details-link>
        </small>
      </span>
      <span class="badge badge-pill badge-primary mr-1" v-for="genre in genres[key]">
        {{genre.name}}
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center ml-auto">
        <edit-button :item="item"></edit-button>
        <details-button type="book" :id="key"></details-button>
        <delete-button :type="bookType" :id="key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="bookType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  methods: {
    seriesKey(series: Series) {
      return Series.key(series)
    }
  },
  computed: {
    bookType() {
      return Book
    },
    ...mapState('model', {
      authors(state: any) {
        return _.mapValues(state.relations[Book.typeTag], (r) => r.author)
      },
      genres(state: any) {
        return _.mapValues(state.relations[Book.typeTag], (r) => r.genre)
      },
      series(state: any) {
        return _.mapValues(state.relations[Book.typeTag], (r) => r.series)
      }
    })
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
        <details-button type="book" :id="key"></details-button>
        <delete-button type="book" :id="key"></delete-button>
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
        <details-button type="book" :id="key"></details-button>
        <delete-button type="book" :id="key"></delete-button>
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
        <details-link type="author" :id="authorKey(author)" :item="author">{{author.name}}</details-link>
      </li>
    </ul>
    <template v-if="series">
      <h2>Series</h2>
      <ul>
        <li v-for="serie in series">
          <details-link type="series" :id="seriesKey(serie)" :item="serie">{{serie.name}}</details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="book">Back</list-button>
    <delete-button :type="bookType" :id="item._id">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('book'))
    },
    authorKey(author: Author) {
      return Author.key(author)
    },
    seriesKey(series: Series) {
      return Series.key(series)
    }
  },
  computed: {
    bookType() {
      return Book
    },
    ...mapState('model', {
      authors(state: any) {
        return state.relations[Book.typeTag][Book.key(this.item)].author
      },
      genres(state: any) {
        return state.relations[Book.typeTag][Book.key(this.item)].genre
      },
      series(state: any) {
        return state.relations[Book.typeTag][Book.key(this.item)].series
      }
    })
  }
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
          <details-link type="series" :id="seriesKey(serie)" :item="series">{{serie.name}}</details-link>
        </small>
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button type="author" :id="key"></details-button>
        <delete-button :type="authorType" :id="key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="authorType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  methods: {
    seriesKey(series: Series) {
      return Series.key(series)
    }
  },
  computed: {
    authorType() {
      return Author
    },
    ...mapState('model', {
      books(state: any) {
        return _.mapValues(state.relations[Author.typeTag], (r) => r.books)
      },
      series(state: any) {
        return _.mapValues(state.relations[Author.typeTag], (r) => r.series)
      }
    })
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
        <details-link type="book" :id="bookKey(book)" :item="book">{{book.title}}</details-link>
      </li>
    </ul>
    <template v-if="series">
      <h2>Series</h2>
      <ul>
        <li v-for="serie in series">
          <details-link type="series" :id="seriesKey(serie)" :item="serie">{{serie.name}}</details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="author">Back</list-button>
    <delete-button :type="authorType" :id="item._id">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('author'))
    },
    bookKey(book: Book) {
      return Book.key(book)
    },
    seriesKey(series: Series) {
      return Series.key(series)
    }
  },
  computed: {
    authorType() {
      return Author
    },
    ...mapState('model', {
      books(state: any) {
        return state.relations[Author.typeTag][Author.key(this.item)].books
      },
      series(state: any) {
        return state.relations[Author.typeTag][Author.key(this.item)].series
      }
    })
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
        <details-button type="library" :id="key"></details-button>
        <delete-button :type="libraryType" :id="key"></delete-button>
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
    ...mapState('model', {
      entries(state: any) {
        return _.mapValues(state.relations[Library.typeTag], (r) => r.entries)
      }
    })
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
        <details-link type="book" :id="bookKey(entry.book)" :item="entry.book" class="mr-auto">
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
    <delete-button :type="libraryType" :id="item._id">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('library'))
    },
    bookKey(book: Book) {
      return Book.key(book)
    }
  },
  computed: {
    libraryType() {
      return Library
    },
    ...mapState('model', {
      entries(state: any) {
        return state.relations[Library.typeTag][Library.key(this.item)].entries
      }
    })
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
        <details-button type="genre" :id="key"></details-button>
        <delete-button :type="genreType" :id="key"></delete-button>
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
    ...mapState('model', {
      books(state: any) {
        return _.mapValues(state.relations[Genre.typeTag], (r) => r.books)
      }
    })
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
        <details-link type="book" :id="bookKey(book)" :item="book" class="mr-auto">
          {{book.title}}
        </details-link>
      </li>
    </ul>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="genre">Back</list-button>
    <delete-button :type="genreType" :id="item._id">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('genre'))
    },
    bookKey(book: Book) {
      return Book.key(book)
    }
  },
  computed: {
    genreType() {
      return Genre
    },
    ...mapState('model', {
      books(state: any) {
        return state.relations[Genre.typeTag][Genre.key(this.item)].books
      }
    })
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
        <details-link type="author" :id="authorKey(author)" :item="author" class="mr-auto">
          {{author.name}}
        </details-link>
      </small>
      <span class="badge badge-pill badge-primary mr-auto">
        {{books[key].length}} books
      </span>
      <span class="flex-grow-0 flex-shrink-0 align-self-center">
        <edit-button :item="item"></edit-button>
        <details-button type="series" :id="key"></details-button>
        <delete-button :type="seriesType" :id="key"></delete-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="seriesType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink
  },
  methods: {
    authorKey(author: Author) {
      return Author.key(author)
    }
  },
  computed: {
    seriesType() {
      return Series
    },
    ...mapState('model', {
      books(state: any) {
        return _.mapValues(state.relations[Series.typeTag], (r) => r.books)
      },
      authors(state: any) {
        return _.mapValues(state.relations[Series.typeTag], (r) => r.author)
      }
    })
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
        <details-link type="book" :id="bookKey(book)" :item="book" class="mr-auto">
          {{book.title}}
        </details-link>
      </li>
    </ul>
    <template v-if="authors">
      <h2>Authors</h2>
      <ul>
        <li v-for="author in authors">
          <details-link type="author" :id="authorKey(author)" :item="author">{{author.name}}</details-link>
        </li>
      </ul>
    </template>
  </div>
  <div class="card-footer text-right">
    <edit-button :item="item">Edit</edit-button>
    <list-button type="series">Back</list-button>
    <delete-button :type="seriesType" :id="item._id">Delete</delete-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton
  },
  methods: {
    deleted() {
      this.$router.push(resolveListRoute('series'))
    },
    bookKey(book: Book) {
      return Book.key(book)
    },
    authorKey(author: Author) {
      return Author.key(author)
    }
  },
  computed: {
    seriesType() {
      return Series
    },
    ...mapState('model', {
      books(state: any) {
        return state.relations[Series.typeTag][Series.key(this.item)].books
      },
      authors(state: any) {
        return state.relations[Series.typeTag][Series.key(this.item)].author
      }
    })
  }
})
