import { Author, Book, Genre, Library, Series, Reading } from '@agrzes/yellow-2020-common-books'
import { CreateButton, DeleteButton, DetailsButton,
  DetailsLink, EditButton, ListButton, RelationEditor, RelationEntityEditor, 
  TextEditor, LongTextEditor, CurrencyEditor, BooleanEditor, DateEditor, SingleRelationEditor, modal} from '@agrzes/yellow-2020-web-vue-components'
import { registry } from '@agrzes/yellow-2020-web-vue-plugin'
import _ from 'lodash'
import { defineComponent } from 'vue'
import { listRelations, itemRelations} from '@agrzes/yellow-2020-web-vue-state'
import { Entity} from '@agrzes/yellow-2020-common-model'

export const EditBook = defineComponent({
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

export const PlanReading = defineComponent({
  props: ['content'],
  template: `
<form>
  <date-editor label="Start Date" property="startDate" :item="current"></date-editor>
  <single-relation-editor label="Book" property="book" :entity="bookType" :item="current"></single-relation-editor>
</form>
  `,
  computed: {
    bookType() {
      return Book
    }
  },
  data() {
    return {
      current: _.cloneDeep(this.$props.content)
    }
  },
  components: {SingleRelationEditor, DateEditor}
})

export const PlanReadingButton = defineComponent({
  props: {
    item: Object
  },
  template: `
<button @click="plan()" class="btn btn-outline-success" type="button" title="Plan Reading">
  <slot>
    <i class="fas fa-calendar-plus"></i>
  </slot>
</button>
  `,
  methods: {
    async plan() {
      const book = this.item
      const bookId = Book.key(book)
      modal({
        component: PlanReading,
        parent: this.$root,
        title: 'Plan Reading',
        props: {content: {book: bookId}},
        buttons: [
          {
            name: 'Save',
            onclick: async (m) => {
              const item = {
                ...m.component.current,
                status: 'planned'
              }
              const id = Reading.key(item)
              await this.$store.dispatch(`model/update`, {item, type: Reading})
              await this.$store.dispatch(`notifications/add`, {title: 'Reading planned', content: `Reading with key ${id} planned` })
              m.close()
            },
            class: 'btn-primary'
          }, {
            name: 'Cancel',
            onclick(m) {
              m.close()
            },
            class: 'btn-secondary'
          }
        ]
      })
    }
  }
})

export const BooksList = defineComponent({
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
        <edit-button :item="item"></edit-button>
        <details-button :item="item"></details-button>
        <delete-button :item="item"></delete-button>
        <plan-reading-button :item="item"></plan-reading-button>
      </span>
    </span>
  </li>
  <li class="list-group-item"><create-button :type="bookType">Add</create-button></li>
</ul>`,
  components: {
    DeleteButton, EditButton, DetailsButton, CreateButton, DetailsLink, PlanReadingButton
  },
  computed: {
    bookType() {
      return Book
    },
    ...listRelations(Book,{authors: 'author',genres:'genre',series:'series'})
  }
})

export const BooksTable = defineComponent({
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

export const BooksCards = defineComponent({
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

export const BookDetails = defineComponent({
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
    <edit-button :item="item">Edit</edit-button>
    <list-button type="book">Back</list-button>
    <delete-button :item="item" @delete="deleted">Delete</delete-button>
    <plan-reading-button :item="item"></plan-reading-button>
  </div>
</div>`,
  components: {
    DeleteButton, EditButton, DetailsLink, ListButton, PlanReadingButton
  },
  methods: {
    deleted() {
      this.$router.push(registry.routerRegistry.resolveListRoute('book'))
    }
  },
  computed: {
    ...itemRelations(Book,{authors:'author',genres:'genre',series: 'series'})
  }
})
