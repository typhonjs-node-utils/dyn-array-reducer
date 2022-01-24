type DynData = {
    /**
     * -
     */
    data: Iterable<any>;
    /**
     * -
     */
    filters?: Iterable<Function | FilterData>;
    /**
     * -
     */
    sort?: Function;
};
type FilterData = {
    /**
     * - An ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * - Filter function that takes a value argument and returns a truthy value to keep it.
     */
    filter: Function;
    /**
     * - A number between 0 and 1 inclusive to position this filter against others.
     */
    weight?: number;
};
type IndexerAPI = {
    /**
     * - Current hash value of the index.
     */
    hash: number | null;
    /**
     * - Returns whether the indexer is active (IE filter or sort function active).
     */
    isActive: boolean;
    /**
     * - Getter returning length of reduced / indexed elements.
     */
    length: number;
    /**
     * - Manually invoke an update of the index.
     */
    update: Function;
};

declare class AdapterFilters {
    /**
     * @param {Function} indexUpdate - update function for the indexer.
     *
     * @returns {[AdapterFilters, {filters: Function[]}]} Returns this and internal storage for filter adapters.
     */
    constructor(indexUpdate: Function);
    get length(): number;
    /**
     * @param {...(Function|FilterData)}   filters -
     */
    add(...filters: (Function | FilterData)[]): void;
    clear(): void;
    /**
     * @param {...(Function|FilterData)}   filters -
     */
    remove(...filters: (Function | FilterData)[]): void;
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param {Function} callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback: Function): void;
    removeById(...ids: any[]): void;
    /**
     * Provides an iterator for filters.
     *
     * @returns {Generator<number|undefined, FilterData, *>} Generator / iterator of filters.
     * @yields {FilterData}
     */
    [Symbol.iterator](): Generator<number | undefined, FilterData, any>;
    #private;
}

declare class AdapterSort {
    constructor(indexUpdate: any);
    /**
     * @param {Function}  compareFn - A callback function that compares two values. Return > 0 to sort b before a;
     * < 0 to sort a before b; or 0 to keep original order of a & b.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
     */
    set(compareFn: Function): void;
    reset(): void;
    #private;
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
declare class DynArrayReducer {
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param {Iterable<*>|DynData}   data - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<any> | DynData);
    /**
     * @returns {AdapterFilters} The filters adapter.
     */
    get filters(): AdapterFilters;
    /**
     * Returns the Indexer public API.
     *
     * @returns {IndexerAPI & Iterable<number>} Indexer API - is also iterable.
     */
    get index(): IndexerAPI & Iterable<number>;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * @returns {AdapterSort} The sort adapter.
     */
    get sort(): AdapterSort;
    /**
     *
     * @param {Function} handler - callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: Function): (() => void);
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @returns {Generator<*, void, *>} Generator / iterator of all data.
     * @yields {*}
     */
    [Symbol.iterator](): Generator<any, void, any>;
    #private;
}

export { DynArrayReducer };
