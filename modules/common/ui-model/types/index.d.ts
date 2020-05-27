export interface ItemsUI {
    kind: string;
}
export interface ListUI extends ItemsUI {
    kind: 'list';
    itemTemplate: string;
}
export declare function isListUI(itemsUI: ItemsUI): itemsUI is ListUI;
export interface CardsUI extends ItemsUI {
    kind: 'cards';
    cardTemplate: string;
}
export declare function isCardsUI(itemsUI: ItemsUI): itemsUI is CardsUI;
export interface ColumnDefinition {
    headerTemplate: string;
    itemTemplate: string;
}
export interface TableUI extends ItemsUI {
    kind: 'table';
    columns: ColumnDefinition[];
}
export declare function isTableUI(itemsUI: ItemsUI): itemsUI is TableUI;
export interface EntityView {
    pathName: string;
    dataModel: string;
    itemsUI: ItemsUI;
    detailsTemplate: string;
}
export interface UIModel {
    views: EntityView[];
}
