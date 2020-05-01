export interface EntityView {
    pathName: string;
    dataModel: string;
    listItemTemplate: string;
    detailsTemplate: string;
}
export interface UIModel {
    views: EntityView[];
}
