export interface StateConfig {
    metadata: string;
    data: {
        [url: string]: string;
    };
    stores: {
        [name: string]: string;
    };
}
export declare function store(config: StateConfig): Promise<import("vuex").Store<unknown>>;
