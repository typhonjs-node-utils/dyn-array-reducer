export default class ArrayReducer
{
   static run(Module, data, chai)
   {
      const { assert } = chai;
      const { ArrayReducer } = Module;

      describe(`ArrayReducer (${data.suitePrefix})`, () =>
      {
         it(`does it work`, () =>
         {
            const arrayReducer = new ArrayReducer([0, 1, 2, 3, 4, 5, 6]);

            const unsubscribe = arrayReducer.subscribe(() => console.log(`!!!! arrayReducer update: ${JSON.stringify([...arrayReducer])}`))

            let modulo = 2;

            console.log(`!! filters.add`);
            arrayReducer.filters.add((value) => value > 2);

            console.log(`!! sort.set`);
            arrayReducer.sort.set((a, b) => b - a);

            console.log(`!! push(7)`);
            arrayReducer.push(7);

            console.log(`!! pop`);
            arrayReducer.pop();

            console.log(`!! filters.add`);
            arrayReducer.filters.add((value) => value % modulo === 0);

            modulo = 3;

            console.log(`!! index.update`);
            arrayReducer.index.update();

            console.log(`!! filters.pop`);
            arrayReducer.filters.pop();

            console.log(`!! filters.clear`);
            arrayReducer.filters.clear();

            console.log(`!! sort.reset`);
            arrayReducer.sort.reset();

            console.log(`!! clear`);
            arrayReducer.clear();

            unsubscribe();
         });
      });
   }
}
