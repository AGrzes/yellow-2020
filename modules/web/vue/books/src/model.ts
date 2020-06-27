
export interface Book<Ref = never> {
  title: string
  description?: string
  author: Array<Ref | Author<Ref>>
  genre: Array<Ref | Genre<Ref>>
  libraries: Array<LibraryEntry<Ref>>
}

export interface Author<Ref = never> {
  name: string
  books: Array<Ref | Book<Ref>>
}

export interface Genre<Ref = never> {
  name: string
  books: Array<Ref | Book<Ref>>
}

export interface Library<Ref = never> {
  name: string
  description?: string
  kind: 'physical' | 'digital'
  entries: Array<Ref | LibraryEntry<Ref>>
}

export interface LibraryEntry<Ref = never> {
  owned: boolean
  price?: number
  url?: string
  library: Ref | Library<Ref>
  book?: Ref | Book<Ref>
}
