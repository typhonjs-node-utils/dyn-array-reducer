/**
 * @typedef DynData
 *
 * @property {Iterable<*>}          data -
 *
 * @property {Iterable<Function|FilterData>}   [filters] -
 *
 * @property {Function}             [sort] -
 */

/**
 * @typedef FilterData
 *
 * @property {*}        [id=undefined] - An ID associated with this filter. Can be used to remove the filter.
 *
 * @property {Function} filter - Filter function that takes a value argument and returns a truthy value to keep it.
 *
 * @property {number}   [weight=1] - A number between 0 and 1 inclusive to position this filter against others.
 */

/**
 * @typedef {Iterable<number>} IndexerAPI
 *
 * @property {number} length - Getter returning length of reduced / indexed elements.
 *
 * @property {Function} update - Manually invoke an update of the index.
 */
