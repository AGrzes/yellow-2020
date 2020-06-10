
export interface ItemsUI {
  kind: string
}

export interface ListUI extends ItemsUI {
  kind: 'list'
  itemTemplate: string
}

export function isListUI(itemsUI: ItemsUI): itemsUI is ListUI {
  return itemsUI.kind === 'list'
}

export interface CardsUI extends ItemsUI {
  kind: 'cards'
  cardTemplate: string
}

export function isCardsUI(itemsUI: ItemsUI): itemsUI is CardsUI {
  return itemsUI.kind === 'cards'
}

export interface ColumnDefinition {
  headerTemplate: string
  itemTemplate: string
}

export interface TableUI extends ItemsUI {
  kind: 'table'
  columns: ColumnDefinition[]
}

export function isTableUI(itemsUI: ItemsUI): itemsUI is TableUI {
  return itemsUI.kind === 'table'
}

export interface ItemUI {
  kind: string
}

export interface CardUI extends ItemUI {
  kind: 'card'
  cardTemplate: string
}

export function isCardUI(itemUI: ItemUI): itemUI is CardUI {
  return itemUI.kind === 'card'
}

export interface EntityView {
    pathName: string
    dataModel: string
    itemsUI: ItemsUI
    itemUI: ItemUI
}

export interface MenuItem {
  label: string
  route: string | Record<string,unknown>
  children?: MenuItem[]
}

export interface UIModel {
    views: EntityView[]
    navigation: MenuItem[]
}
