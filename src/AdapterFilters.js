/**
 * @template T
 */
export class AdapterFilters
{
   #filtersAdapter;
   #indexUpdate;
   #mapUnsubscribe = new Map();

   /**
    * @param {Function} indexUpdate - update function for the indexer.
    *
    * @returns {[AdapterFilters<T>, {filters: FilterData<T>[]}]} Returns this and internal storage for filter adapters.
    */
   constructor(indexUpdate)
   {
      this.#indexUpdate = indexUpdate;

      this.#filtersAdapter = { filters: [] };

      Object.seal(this);

      return [this, this.#filtersAdapter];
   }

   /**
    * @returns {number} Returns the length of the
    */
   get length() { return this.#filtersAdapter.filters.length; }

   /**
    * Provides an iterator for filters.
    *
    * @returns {Generator<number|undefined, FilterData<T>, *>} Generator / iterator of filters.
    * @yields {FilterData<T>}
    */
   *[Symbol.iterator]()
   {
      if (this.#filtersAdapter.filters.length === 0) { return; }

      for (const entry of this.#filtersAdapter.filters)
      {
         yield { ...entry };
      }
   }

   /**
    * @param {...(FilterFn<T>|FilterData<T>)}   filters -
    */
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
            if (this.#mapUnsubscribe.has(data.filter))
            {
               throw new Error(
                'DynArrayReducer error: Filter added already has an unsubscribe function registered.');
            }

            this.#mapUnsubscribe.set(data.filter, unsubscribe);
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

   /**
    * @param {...(FilterFn<T>|FilterData<T>)}   filters -
    */
   remove(...filters)
   {
      const length = this.#filtersAdapter.filters.length;

      if (length === 0) { return; }

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

      // Update the index a filter was removed.
      if (length !== this.#filtersAdapter.filters.length) { this.#indexUpdate(); }
   }

   /**
    * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
    * Any truthy value returned will remove that filter.
    *
    * @param {function(*, FilterFn<T>, number): boolean} callback - Callback function to evaluate each filter entry.
    */
   removeBy(callback)
   {
      const length = this.#filtersAdapter.filters.length;

      if (length === 0) { return; }

      if (typeof callback !== 'function')
      {
         throw new TypeError(`DynArrayReducer error: 'callback' is not a function.`);
      }

      this.#filtersAdapter.filters = this.#filtersAdapter.filters.filter((data) =>
      {
         const remove = callback.call(callback, { ...data });

         if (remove)
         {
            let unsubscribe;
            if (typeof (unsubscribe = this.#mapUnsubscribe.get(data.filter)) === 'function')
            {
               unsubscribe();
               this.#mapUnsubscribe.delete(data.filter);
            }
         }

         // Reverse remove boolean to properly filter / remove this filter.
         return !remove;
      });

      if (length !== this.#filtersAdapter.filters.length) { this.#indexUpdate(); }
   }

   removeById(...ids)
   {
      const length = this.#filtersAdapter.filters.length;

      if (length === 0) { return; }

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
