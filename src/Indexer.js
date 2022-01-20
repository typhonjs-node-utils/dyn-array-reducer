export class Indexer
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

   initAdapters(filtersAdapter, sortAdapter)
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

   isActive()
   {
      return this.filtersAdapter.filters.length > 0 || this.sortAdapter.sort ;
   }

   update()
   {
      const oldIndex = this.indexAdapter.index;
      const oldHash = this.indexAdapter.hash;

      // Clear index if there are no filters and no sort function or the index length doesn't match the items length.
      if ((this.filtersAdapter.filters.length === 0 && !this.sortAdapter.sort) ||
       (this.indexAdapter.index && this.hostItems.length !== this.indexAdapter.index.length))
      {
         this.indexAdapter.index = null;
      }

      // If there are filters build new index.
      if (this.filtersAdapter.filters.length > 0)
      {
         this.indexAdapter.index = this.hostItems.reduce(this.reduceFn, []);
      }

      if (this.sortAdapter.sort)
      {
         // If there is no index then create one with keys matching host item length.
         if (!this.indexAdapter.index) { this.indexAdapter.index = [...Array(this.hostItems.length).keys()]; }

         this.indexAdapter.index.sort(this.sortFn);
      }

      // Calculate hash
      let newHash = 0;
      const newIndex = this.indexAdapter.index;

      if (newIndex)
      {
         for (let cntr = newIndex.length; --cntr >= 0;)
         {
            newHash ^= newIndex[cntr] + 0x9e3779b9 + (newHash << 6) + (newHash >> 2);
         }
      }
      else
      {
         newHash = null;
      }

      // Post an update to subscribers if old & new hash doesn't match. If they do match check array equality.
      const postUpdate = oldHash === newHash ? !s_ARRAY_EQUALS(oldIndex, newIndex) : true;

      this.indexAdapter.hash = newHash;

      if (postUpdate) { this.hostUpdate(); }
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
