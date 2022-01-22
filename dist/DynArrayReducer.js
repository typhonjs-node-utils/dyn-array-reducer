class AdapterFilters
{
   #filtersAdapter;
   #indexUpdate;
   #mapUnsubscribe = new Map();

   /**
    * @param {Function} indexUpdate - update function for the indexer.
    *
    * @returns {[AdapterFilters, {filters: Function[]}]} Returns this and internal storage for filter adapters.
    */
   constructor(indexUpdate)
   {
      this.#indexUpdate = indexUpdate;

      this.#filtersAdapter = { filters: [] };

      Object.seal(this);

      return [this, this.#filtersAdapter];
   }

   get length() { return this.#filtersAdapter.filters ? this.#filtersAdapter.filters.length : 0; }

   *[Symbol.iterator]()
   {
      if (this.#filtersAdapter.filters.length === 0) { return; }

      for (const entry of this.#filtersAdapter.filters)
      {
         yield { ...entry };
      }
   }

   add(...filters)
   {
      /**
       * Tracks the number of filters added that have subscriber functionality.
       *
       * @type {number}
       */
      let subscribeCount = 0;

      for (const filter of filters)
      {
         if (typeof filter !== 'function' && typeof filter !== 'object')
         {
            throw new TypeError(`DynArrayReducer error: 'filter' is not a function or object.`);
         }

         let data = void 0;

         switch (typeof filter)
         {
            case 'function':
               data = {
                  id: void 0,
                  filter,
                  weight: 1
               };
               break;

            case 'object':
               if (typeof filter.filter !== 'function')
               {
                  throw new TypeError(`DynArrayReducer error: 'filter' attribute is not a function.`);
               }

               if (filter.weight !== void 0 && typeof filter.weight !== 'number' ||
                (filter.weight < 0 || filter.weight > 1))
               {
                  throw new TypeError(
                   `DynArrayReducer error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
               }

               data = {
                  id: filter.id !== void 0 ? filter.id : void 0,
                  filter: filter.filter,
                  weight: filter.weight || 1
               };
               break;
         }

         // Find the index to insert where data.weight is less than existing values weight.
         const index = this.#filtersAdapter.filters.findIndex((value) =>
         {
            return data.weight < value.weight;
         });

         // If an index was found insert at that location.
         if (index >= 0)
         {
            this.#filtersAdapter.filters.splice(index, 0, data);
         }
         else // push to end of filters.
         {
            this.#filtersAdapter.filters.push(data);
         }

         if (typeof data.filter.subscribe === 'function')
         {
            const unsubscribe = data.filter.subscribe(this.#indexUpdate);

            // Ensure that unsubscribe is a function.
            if (typeof unsubscribe !== 'function')
            {
               throw new TypeError(
                'DynArrayReducer error: Filter has subscribe function, but no unsubscribe function is returned.');
            }

            // Ensure that the same filter is not subscribed to multiple times.
            if (this.#mapUnsubscribe.has(filter))
            {
               throw new Error(
                'DynArrayReducer error: Filter added already has an unsubscribe function registered.');
            }

            this.#mapUnsubscribe.set(filter, unsubscribe);
            subscribeCount++;
         }
      }

      // Filters with subscriber functionality are assumed to immediately invoke the `subscribe` callback. If the
      // subscriber count is less than the amount of filters added then automatically trigger an index update manually.
      if (subscribeCount < filters.length) { this.#indexUpdate(); }
   }

   clear()
   {
      this.#filtersAdapter.filters.length = 0;

      // Unsubscribe from all filters with subscription support.
      for (const unsubscribe of this.#mapUnsubscribe.values())
      {
         unsubscribe();
      }

      this.#mapUnsubscribe.clear();

      this.#indexUpdate();
   }

   remove(...filters)
   {
      if (this.#filtersAdapter.filters.length === 0) { return; }

      const length = this.#filtersAdapter.filters.length;

      for (const data of filters)
      {
         // Handle the case that the filter may either be a function or a filter entry / object.
         const actualFilter = typeof data === 'function' ? data : data !== null && typeof data === 'object' ?
          data.filter : void 0;

         if (!actualFilter) { continue; }

         for (let cntr = this.#filtersAdapter.filters.length; --cntr >= 0;)
         {
            if (this.#filtersAdapter.filters[cntr].filter === actualFilter)
            {
               this.#filtersAdapter.filters.splice(cntr, 1);

               // Invoke any unsubscribe function for given filter then remove from tracking.
               let unsubscribe = void 0;
               if (typeof (unsubscribe = this.#mapUnsubscribe.get(actualFilter)) === 'function')
               {
                  unsubscribe();
                  this.#mapUnsubscribe.delete(actualFilter);
               }
            }
         }
      }

      if (length !== this.#filtersAdapter.filters.length) { this.#indexUpdate(); }
   }

   /**
    * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
    * Any truthy value returned will remove that filter.
    *
    * @param {Function} callback - Callback function to evaluate each filter entry.
    */
   removeBy(callback)
   {
      if (this.#filtersAdapter.filters.length === 0) { return; }

      if (typeof callback !== 'function')
      {
         throw new TypeError(`DynArrayReducer error: 'callback' is not a function.`);
      }

      const length = this.#filtersAdapter.filters.length;

      this.#filtersAdapter.filters = this.#filtersAdapter.filters.filter((data) =>
      {
         const keep = !callback.call(callback, { ...data });

         // If not keeping invoke any unsubscribe function for given filter then remove from tracking.
         if (!keep)
         {
            let unsubscribe;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.filter);
            }
         }

         return keep;
      });

      if (length !== this.#filtersAdapter.filters.length) { this.#indexUpdate(); }
   }

   removeById(...ids)
   {
      if (this.#filtersAdapter.filters.length === 0) { return; }

      const length = this.#filtersAdapter.filters.length;

      this.#filtersAdapter.filters = this.#filtersAdapter.filters.filter((data) =>
      {
         let remove = false;

         for (const id of ids) { remove |= data.id === id; }

         // If not keeping invoke any unsubscribe function for given filter then remove from tracking.
         if (remove)
         {
            let unsubscribe;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.filter);
            }
         }

         return !remove; // Swap here to actually remove the item via array filter method.
      });

      if (length !== this.#filtersAdapter.filters.length) { this.#indexUpdate(); }
   }
}

class AdapterSort
{
   #sortAdapter;
   #indexUpdate;
   #unsubscribe;

   constructor(indexUpdate)
   {
      this.#indexUpdate = indexUpdate;

      this.#sortAdapter = { sort: null };

      Object.seal(this);

      return [this, this.#sortAdapter];
   }

   set(sort)
   {
      if (typeof this.#unsubscribe === 'function')
      {
         this.#unsubscribe();
         this.#unsubscribe = void 0;
      }

      this.#sortAdapter.sort = sort;

      if (typeof sort.subscribe === 'function')
      {
         this.#unsubscribe = sort.subscribe(this.#indexUpdate);

         // Ensure that unsubscribe is a function.
         if (typeof this.#unsubscribe !== 'function')
         {
            throw new Error(
             'DynArrayReducer error: Sort has subscribe function, but no unsubscribe function is returned.');
         }
      }
      else
      {
         // A sort function with subscriber functionality are assumed to immediately invoke the `subscribe` callback.
         // Only manually update the index if there is no subscriber functionality.
         this.#indexUpdate();
      }
   }

   reset()
   {
      this.#sortAdapter.sort = null;

      if (typeof this.#unsubscribe === 'function')
      {
         this.#unsubscribe();
         this.#unsubscribe = void 0;
      }

      this.#indexUpdate();
   }
}

class Indexer
{
   constructor(hostItems, hostUpdate)
   {
      this.hostItems = hostItems;
      this.hostUpdate = hostUpdate;

      const indexAdapter = { index: null, hash: null };

      const publicAPI = {
         update: this.update.bind(this),

         /**
          * Provides an iterator over the index array.
          *
          * @returns {Generator<any, void, *>} Iterator.
          * @yields
          */
         [Symbol.iterator]: function *()
         {
            if (!indexAdapter.index) { return; }

            for (const index of indexAdapter.index) { yield index; }
         }
      };

      // Define a getter on the public API to get the length / count of index array.
      Object.defineProperties(publicAPI, {
         hash: { get: () => indexAdapter.hash },
         isActive: { get: () => this.isActive() },
         length: { get: () => Array.isArray(indexAdapter.index) ? indexAdapter.index.length : 0 }
      });

      Object.freeze(publicAPI);

      indexAdapter.publicAPI = publicAPI;

      this.indexAdapter = indexAdapter;

      return [this, indexAdapter];
   }

   /**
    * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
    * is set to null. Set calculated new hash value to the index adapter hash value.
    *
    * After hash generation compare old and new hash values and perform an update if they are different. If they are
    * equal check for array equality between the old and new index array and perform an update if they are not equal.
    *
    * @param {number[]}    oldIndex - Old index array.
    *
    * @param {number|null} oldHash - Old index hash value.
    */
   calcHashUpdate(oldIndex, oldHash)
   {
      let newHash = null;
      const newIndex = this.indexAdapter.index;

      if (newIndex)
      {
         for (let cntr = newIndex.length; --cntr >= 0;)
         {
            newHash ^= newIndex[cntr] + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
         }
      }

      this.indexAdapter.hash = newHash;

      if (oldHash === newHash ? !s_ARRAY_EQUALS(oldIndex, newIndex) : true) { this.hostUpdate(); }
   }

   initAdapters(filtersAdapter, sortAdapter)
   {
      this.filtersAdapter = filtersAdapter;
      this.sortAdapter = sortAdapter;

      this.sortFn = (a, b) =>
      {
         // const actualA = this.hostItems[a];
         // const actualB = this.hostItems[b];
         //
         // return this.sortAdapter.sort(actualA, actualB);

         return this.sortAdapter.sort(this.hostItems[a], this.hostItems[b]);
      };
   }

   isActive()
   {
      return this.filtersAdapter.filters.length > 0 || this.sortAdapter.sort ;
   }

   /**
    * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
    *
    * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
    * but the maintenance factor is not worth the extra complication.
    *
    * @returns {number[]} New filtered index array.
    */
   reduceImpl()
   {
      const data = [];

      const filters = this.filtersAdapter.filters;

      let include = true;

      for (let cntr = 0, length = this.hostItems.length; cntr < length; cntr++)
      {
         include = true;

         for (let filCntr = 0, filLength = filters.length; filCntr < filLength; filCntr++)
         {
            if (!filters[filCntr].filter(this.hostItems[cntr]))
            {
               include = false;
               break;
            }
         }

         if (include) { data.push(cntr); }
      }

      return data;
   }

   sortImpl(a, b)
   {
      // const actualA = this.hostItems[a];
      // const actualB = this.hostItems[b];

      return this.sortAdapter.sort(this.hostItems[a], this.hostItems[b]);
   }

   update()
   {
      const oldIndex = this.indexAdapter.index;
      const oldHash = this.indexAdapter.hash;

      // Clear index if there are no filters and no sort function or the index length doesn't match the item length.
      if ((this.filtersAdapter.filters.length === 0 && !this.sortAdapter.sort) ||
       (this.indexAdapter.index && this.hostItems.length !== this.indexAdapter.index.length))
      {
         this.indexAdapter.index = null;
      }

      // If there are filters build new index.
      if (this.filtersAdapter.filters.length > 0) { this.indexAdapter.index = this.reduceImpl(); }

      if (this.sortAdapter.sort)
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexAdapter.index) { this.indexAdapter.index = [...Array(this.hostItems.length).keys()]; }

         this.indexAdapter.index.sort(this.sortFn);
      }

      this.calcHashUpdate(oldIndex, oldHash);
   }
}

/**
 * Checks for array equality between two arrays of numbers.
 *
 * @param {number[]} a - Array A
 *
 * @param {number[]} b - Array B
 *
 * @returns {boolean} Arrays equal
 */
function s_ARRAY_EQUALS(a, b)
{
   if (a === b) { return true; }
   if (a === null || b === null) { return false; }
   if (a.length !== b.length) { return false; }

   for (let cntr = a.length; --cntr >= 0;)
   {
      if (a[cntr] !== b[cntr]) { return false; }
   }

   return true;
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
class DynArrayReducer
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
         for (const entry of this.index) { yield items[entry]; }
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

export { DynArrayReducer };
