/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../types')}   opts.Module - Module to test
 *
 * @param {object}                        opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { assert } = chai;
   const { DynArrayReducer } = Module;

   describe(`API Test`, () =>
   {
      describe(`Main API`, () =>
      {
         it(`length (getter)`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);
            assert.equal(dynArray.length, 2, 'length (getter) returns 2');
         });

         // it(`non-iterable argument`, () =>
         // {
         //    expect(() => new DynArrayReducer(false)).to.throw(TypeError,
         //     `DynArrayReducer error: 'data' is not iterable.`);
         // });
      });

      describe(`AdapterFilter (filters)`, () =>
      {
         it(`length (getter)`, () =>
         {
            const dynArray = new DynArrayReducer({ data: [1, 2], filters: [() => null, () => null] });
            assert.equal(dynArray.filters.length, 2, 'length (getter) returns 2');
         });

         it(`iterator (no filters)`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.deepEqual([...dynArray.filters], [], 'iterator returns no values');
         });

         it(`iterator (2 values)`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: [1, 2],
               filters: [{ id: 'a', filter: () => null }, { id: 'b', filter: () => null }]
            });

            assert.deepEqual([...dynArray.filters].map((f) => f.id), ['a', 'b'], 'iterator returns values');
         });

         it(`iterator - add with no id (default void 0 assigned)`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: [1, 2],
               filters: [{ filter: () => null }, { filter: () => null }]
            });

            assert.deepEqual([...dynArray.filters].map((f) => f.id), [void 0, void 0], 'iterator returns values');
         });
      });
   });
}
