export class AdapterFilters
{
   #filtersAdapter;
   #indexUpdate;

   constructor(indexUpdate)
   {
      this.#indexUpdate = indexUpdate;

      this.#filtersAdapter = {filters: null};

      Object.seal(this);

      return [this, this.#filtersAdapter];
   }

   add(filter)
   {
      if (!this.#filtersAdapter.filters)
      { this.#filtersAdapter.filters = []; }

      this.#filtersAdapter.filters.push(filter);

      this.#indexUpdate();
   }

   clear()
   {
      this.#filtersAdapter.filters = null;
      this.#indexUpdate();
   }

   pop()
   {
      if (this.#filtersAdapter.filters)
      {
         this.#filtersAdapter.filters.pop();

         if (this.#filtersAdapter.filters.length === 0)
         { this.#filtersAdapter.filters = null; }

         this.#indexUpdate();
      }
   }
}
