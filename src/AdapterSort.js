export class AdapterSort
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
