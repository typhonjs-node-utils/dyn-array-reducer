export default class DynamicReducer
{
   static run(Module, data, chai)
   {
      const { assert } = chai;
      const { DynamicReducer } = Module;

      describe(`DynamicReducer (${data.suitePrefix})`, () =>
      {
         it(`does it work`, () =>
         {
            const arrayReducer = new DynamicReducer([0, 1, 2, 3, 4, 5, 6]);

            const unsubscribe = arrayReducer.subscribe(
             () => console.log(`!!!! arrayReducer update: ${JSON.stringify([...arrayReducer])}`));

            let modulo = 2;

            const filterLessTwo = (value) => value > 2;

            console.log(`!! filters.add`);
            arrayReducer.filters.add({ id: '> 2', filter: filterLessTwo });

            console.log(`!! sort.set`);
            arrayReducer.sort.set((a, b) => b - a);

            console.log(`!! push(7)`);
            arrayReducer.push(7);

            console.log(`!! pop`);
            arrayReducer.pop();

            console.log(`!! filters.add`);
            arrayReducer.filters.add({ id: 'dynamic modulo', filter: (value) => value % modulo === 0, weight: 0.1 });

            modulo = 3;

            console.log(`!! index.update`);
            arrayReducer.index.update();

            console.log(`!! filter iterator:\n${JSON.stringify([...arrayReducer.filters.iterator()], null, 3)}`);

            console.log(`!! filters.removeById`);
            // arrayReducer.filters.remove();
            // arrayReducer.filters.removeById('A');
            arrayReducer.filters.removeById('dynamic modulo');

            // arrayReducer.filters.removeBy((id, filter, weight) => {
            //    // return weight > 0.5;
            //    // return id === '> 2';
            //    // return id !== '> 2';
            // });

            console.log(`!! filter iterator:\n${JSON.stringify([...arrayReducer.filters.iterator()], null, 3)}`);

            console.log(`!! filters.clear`);
            arrayReducer.filters.clear();

            console.log(`!! push(10)`);
            arrayReducer.push(10);

            console.log(`!! sort.reset`);
            arrayReducer.sort.reset();

            console.log(`!! clear`);
            arrayReducer.clear();

            unsubscribe();
         });
      });
   }
}
