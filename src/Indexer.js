export class Indexer
{
   constructor(hostItems, hostUpdate)
   {
      this.hostItems = hostItems;
      this.hostUpdate = hostUpdate;

      this.indexAdapter = { index: null, update: this.#update.bind(this) };

      return [this, this.indexAdapter];
   }

   _initAdapters(filtersAdapter, sortAdapter)
   {
      this.filtersAdapter = filtersAdapter;
      this.sortAdapter = sortAdapter;

      this.reduceFn = function(newIndex, current, currentIndex)
      {
         let include = true;

         for (const filter of filtersAdapter.filters) { include = include && filter.filter(current); }

         if (include) { newIndex.push(currentIndex); }

         return newIndex;
      };

      this.sortFn = (a, b) =>
      {
         const actualA = this.hostItems[a];
         const actualB = this.hostItems[b];

         return this.sortAdapter.sort(actualA, actualB);
      };
   }

   hasOperations()
   {
      return this.filtersAdapter.filters || this.sortAdapter.sort ;
   }

   #update()
   {
      // Clear index if there are no filters or the index length doesn't match the items length.
      if ((this.filtersAdapter.filters.length === 0 && !this.sortAdapter.sort) ||
       (this.indexAdapter.index && this.hostItems.length !== this.indexAdapter.index.length))
      {
         this.indexAdapter.index = null;
      }

      // If there are filters build new index.
      if (this.filtersAdapter.filters)
      {
// console.log(`! AI - update (filter) - 0`);
         this.indexAdapter.index = this.hostItems.reduce(this.reduceFn, []);
      }

      if (this.sortAdapter.sort)
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexAdapter.index) { this.indexAdapter.index = [...Array(this.hostItems.length).keys()]; }

// console.log(`! AI - update (sort) - 1`);

         this.indexAdapter.index.sort(this.sortFn);
      }

      this.hostUpdate();
   }
}
