export class AdapterFilters
{
   #filtersAdapter;
   #indexUpdate;

   constructor(indexUpdate)
   {
      this.#indexUpdate = indexUpdate;

      this.#filtersAdapter = { filters: [] };

      Object.seal(this);

      return [this, this.#filtersAdapter];
   }

   get length() { return this.#filtersAdapter.filters ? this.#filtersAdapter.filters.length : 0; }

   add(...filters)
   {
      for (const filter of filters)
      {
         if (typeof filter !== 'function' && typeof filter !== 'object')
         {
            throw new TypeError(`DynamicReducer error: 'filter' is not a function or object.`);
         }

         if (!this.#filtersAdapter.filters) { this.#filtersAdapter.filters = []; }

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
               if (filter.id !== void 0 && typeof filter.id !== 'string')
               {
                  throw new TypeError(`DynamicReducer error: 'id' attribute is not undefined or a string.`);
               }

               if (typeof filter.filter !== 'function')
               {
                  throw new TypeError(`DynamicReducer error: 'filter' attribute is not a function.`);
               }

               if (filter.weight !== void 0 && typeof filter.weight !== 'number' &&
                (filter.weight < 0 || filter.weight > 1))
               {
                  throw new TypeError(
                   `DynamicReducer error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
               }

               data = {
                  id: filter.id || void 0,
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
      }

      this.#indexUpdate();
   }

   clear()
   {
      this.#filtersAdapter.filters.length = 0;
      this.#indexUpdate();
   }

   *iterator()
   {
      if (!this.#filtersAdapter.filters) { return; }

      for (const entry of this.#filtersAdapter.filters)
      {
         yield { ...entry };
      }
   }

   remove(...filters)
   {
      if (!this.#filtersAdapter.filters) { return; }

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
      if (!this.#filtersAdapter.filters) { return; }

      const length = this.#filtersAdapter.filters.length;

      this.#filtersAdapter.filters = this.#filtersAdapter.filters.filter((value) =>
      {
         return !callback.call(callback, value.id, value.filter, value.weight);
      });

      if (length !== this.#filtersAdapter.filters.length) { this.#indexUpdate(); }
   }

   removeById(...ids)
   {
      if (!this.#filtersAdapter.filters) { return; }

      const length = this.#filtersAdapter.filters.length;

      this.#filtersAdapter.filters = this.#filtersAdapter.filters.filter((value) =>
      {
         let keep = false;

         for (const id of ids) { keep |= value.id === id; }

         return !keep;
      });

      if (length !== this.#filtersAdapter.filters.length) { this.#indexUpdate(); }
   }
}
