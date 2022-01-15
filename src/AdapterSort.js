export class AdapterSort
{
   #sortAdapter;
   #indexUpdate;

   constructor(indexUpdate)
   {
      this.#indexUpdate = indexUpdate;

      this.#sortAdapter = { sort: null };

      Object.seal(this);

      return [this, this.#sortAdapter];
   }

   set(sort)
   {
      this.#sortAdapter.sort = sort;
      this.#indexUpdate();
   }

   reset()
   {
      this.#sortAdapter.sort = null;
      this.#indexUpdate();
   }
}
