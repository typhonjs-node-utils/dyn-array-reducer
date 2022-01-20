import { AdapterFilters }  from './AdapterFilters.js';
import { AdapterSort }     from './AdapterSort.js';
import { Indexer }         from './Indexer.js';

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
export class DynArrayReducer
{
   #items;

   #index;
   #indexAdapter;

   /**
    * @type {AdapterFilters}
    */
   #filters;

   /**
    * @type {{filters: Function[]}}
    */
   #filtersAdapter;

   /**
    * @type {AdapterSort}
    */
   #sort;
   #sortAdapter;

   #subscriptions = [];

   /**
    * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
    * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
    *
    * @param {Iterable<*>|DynData}   data - Data iterable to store if array or copy otherwise.
    */
   constructor(data = void 0)
   {
      let dataIterable = void 0;
      let filters = void 0;
      let sort = void 0;

      // Potentially working with DynData.
      if (!s_IS_ITERABLE(data) && typeof data === 'object')
      {
         if (!s_IS_ITERABLE(data.data))
         {
            throw new TypeError(`DynArrayReducer error (DynData): 'data' attribute is not iterable.`);
         }

         dataIterable = data.data;

         if (data.filters !== void 0)
         {
            if (s_IS_ITERABLE(data.filters))
            {
               filters = data.filters;
            }
            else
            {
               throw new TypeError(`DynArrayReducer error (DynData): 'filters' attribute is not iterable.`);
            }
         }

         if (data.sort !== void 0)
         {
            if (typeof data.sort === 'function')
            {
               sort = data.sort;
            }
            else
            {
               throw new TypeError(`DynArrayReducer error (DynData): 'sort' attribute is not a function.`);
            }
         }
      }
      else
      {
         if (!s_IS_ITERABLE(data)) { throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`); }

         dataIterable = data;
      }

      // In the case of the main data being an array directly use the array otherwise create a copy.
      this.#items = Array.isArray(dataIterable) ? dataIterable : [...dataIterable];

      [this.#index, this.#indexAdapter] = new Indexer(this.#items, this.#notify.bind(this));

      [this.#filters, this.#filtersAdapter] = new AdapterFilters(this.#indexAdapter.publicAPI.update);
      [this.#sort, this.#sortAdapter] = new AdapterSort(this.#indexAdapter.publicAPI.update);

      this.#index.initAdapters(this.#filtersAdapter, this.#sortAdapter);

      // Add any filters and sort function defined by DynData.
      if (filters) { this.filters.add(...filters); }
      if (sort) { this.sort.set(sort); }
   }

   /**
    * @returns {AdapterFilters} The filters adapter.
    */
   get filters() { return this.#filters; }

   /**
    * Returns the Indexer public API.
    *
    * @returns {IndexerAPI} Indexer API.
    */
   get index() { return this.#indexAdapter.publicAPI; }

   /**
    * Gets the main data / items length.
    *
    * @returns {number} Main data / items length.
    */
   get length() { return this.#items.length; }

   /**
    * @returns {AdapterSort} The sort adapter.
    */
   get sort() { return this.#sort; }

   /**
    *
    * @param {Function} handler - callback function that is invoked on update / changes. Receives `this` reference.
    *
    * @returns {(function(): void)} Unsubscribe function.
    */
   subscribe(handler)
   {
      this.#subscriptions.push(handler); // add handler to the array of subscribers

      handler(this);                     // call handler with current value

      // Return unsubscribe function.
      return () =>
      {
         const index = this.#subscriptions.findIndex((sub) => sub === handler);
         if (index >= 0) { this.#subscriptions.splice(index, 1); }
      };
   }

   /**
    *
    */
   #notify()
   {
      // Subscriptions are stored locally as on the browser Babel is still used for private class fields / Babel
      // support until 2023. IE not doing this will require several extra method calls otherwise.
      const subscriptions = this.#subscriptions;
      for (let cntr = 0; cntr < subscriptions.length; cntr++) { subscriptions[cntr](this); }
   }

   *[Symbol.iterator]()
   {
      const items = this.#items;

      if (items.length === 0) { return; }

      if (this.#index.isActive())
      {
          for (const entry of this.#indexAdapter.publicAPI) { yield items[entry]; }
      }
      else
      {
          for (const entry of items) { yield entry; }
      }
   }
}

/**
 * Provides a utility method to determine if the given data is iterable / implements iterator protocol.
 *
 * @param {*}  data - Data to verify as iterable.
 *
 * @returns {boolean} Is data iterable.
 */
function s_IS_ITERABLE(data)
{
   return data !== null && data !== void 0 && typeof data === 'object' && typeof data[Symbol.iterator] === 'function';
}
