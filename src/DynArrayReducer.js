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
   #indexPublic;

   #filters;
   #filtersAdapter;

   #sort;
   #sortAdapter;

   #subscriptions = [];

   /**
    * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
    * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
    *
    * @param {Iterable<*>}   data - Data iterable to store or copy.
    */
   constructor(data = void 0)
   {
      if (data === null || data === void 0 || typeof data !== 'object' || typeof data[Symbol.iterator] !== 'function')
      {
         throw new TypeError(`DynArrayReducer error: 'data' is not iterable.`);
      }

      this.#items = Array.isArray(data) ? data : [...data];

      [this.#index, this.#indexAdapter] = new Indexer(this.#items, this.#updated.bind(this));

      this.#indexPublic = { update: this.#indexAdapter.update };
      Object.freeze(this.#indexPublic);

      [this.#filters, this.#filtersAdapter] = new AdapterFilters(this.#indexAdapter.update);
      [this.#sort, this.#sortAdapter] = new AdapterSort(this.#indexAdapter.update);

      this.#index._initAdapters(this.#filtersAdapter, this.#sortAdapter);
   }

   get filters() { return this.#filters; }

   get index() { return this.#indexPublic; }

   get length() { return this.#items.length; }

   get sort() { return this.#sort; }

   clear()
   {
      if (this.#items.length > 0)
      {
         this.#items.length = 0;
         this.#updated();
      }
   }

   #dispatchUpdate()
   {
      if (this.#index.hasOperations())
      {
         this.#indexAdapter.update();
      }
      else
      {
         this.#updated();
      }
   }

   push(item)
   {
      this.#items.push(item);
      this.#dispatchUpdate();
   }

   pop()
   {
      this.#items.pop();
      this.#dispatchUpdate();
   }

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

   #updated()
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

      const indexAdapter = this.#indexAdapter;

      if (indexAdapter.index)
      {
          for (const entry of indexAdapter.index) { yield items[entry]; }
      }
      else
      {
          for (const entry of items) { yield entry; }
      }
   }
}
