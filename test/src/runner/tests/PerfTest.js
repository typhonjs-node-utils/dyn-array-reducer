/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../types')}   opts.Module - Module to test
 */
export function run({ Module })
{
   const { DynArrayReducer } = Module;

   describe(`DynArrayReducer - Performance Test`, () =>
   {
      it(`large`, () =>
      {
         const modulo = 2;
         const data = [...Array(10000).keys()];
         const filterDynamicModulo = { id: 'dynamic modulo', filter: (value) => value % modulo === 0, weight: 0.1 };

         const arrayReducer = new DynArrayReducer({ data });

         let startTime;

         // const unsubscribe = arrayReducer.subscribe(
         //  () => console.log(`!!!! arrayReducer update - total time: ${performance.now() - startTime}`));
         //
         // console.log(`!! filters.add`);
         // startTime = performance.now();
         // arrayReducer.filters.add(filterDynamicModulo);

         arrayReducer.filters.add(filterDynamicModulo);

         // arrayReducer.sort.set((a, b) => b - a);

         const repeat = 5000;

         let totalTime = 0;

         for (let cntr = repeat; --cntr >= 0;)
         {
            startTime = performance.now();
            arrayReducer.index.update();
            totalTime += performance.now() - startTime;
         }

         console.log(`! Total time (iterations - ${repeat}): ${totalTime / repeat}`);

         // unsubscribe();
      });
   });
}
