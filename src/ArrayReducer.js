import { AdapterFilters }  from './AdapterFilters.js';
import { AdapterSort }     from './AdapterSort.js';
import { Indexer }         from './Indexer.js';

/**
 * TODO: handle edge cases when there is a sort function, but no filters and items are added / removed.
 * TODO: organize add / remove methods.
 */
export class ArrayReducer
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

   constructor(data = void 0)
   {
      if (data === null || data === void 0 || typeof data !== 'object' || typeof data[Symbol.iterator] !== 'function')
      {
         throw new TypeError(`ArrayReducer error: 'data' is not iterable.`);
      }

      this.#items = [...data];

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
      if (this.#index.hasIndex())
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
