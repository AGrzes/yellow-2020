
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

export interface EntityView {
    pathName: string
    dataModel: string
    itemsUI: ItemsUI
    detailsTemplate: string
}

export interface UIModel {
    views: EntityView[]
}
