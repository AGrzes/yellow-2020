export interface Icon {
  symbol: string
  text?: string
}


export interface Item {
  title?: string
  subtitle?: string
  icons: Icon[]
  optionalIcons: Icon[]
}

export interface Group {
  header: Item
  items: Array<Item | Group>
}
