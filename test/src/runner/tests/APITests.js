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

         it(`add - multiple w/ weight`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: [],
               filters: [{ id: 'c', filter: () => null }, { id: 'a', filter: () => null, weight: 0.1 }, { id: 'b', filter: () => null, weight: 0.5 }]
            });

            assert.deepEqual([...dynArray.filters].map((f) => ({ id: f.id, weight: f.weight })),
             [{ id: 'a', weight: 0.1 }, { id: 'b', weight: 0.5 }, { id: 'c', weight: 1 }], 'add multiple w/ weight');
         });

         it(`clear w/ unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add(filter);
            dar.filters.clear();

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });

         it(`remove - no filters added`, () =>
         {
            const dar = new DynArrayReducer([]);

            assert.equal(dar.filters.length, 0);
            dar.filters.remove(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove - exact filter added`, () =>
         {
            const dar = new DynArrayReducer([]);

            const filter = () => null;

            dar.filters.add(filter);
            assert.equal(dar.filters.length, 1);
            dar.filters.remove(filter);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove filter w/ unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add(filter);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(filter);

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });

         it(`remove filterData`, () =>
         {
            const dar = new DynArrayReducer([]);

            const filterData = { filter: () => null };

            dar.filters.add(filterData);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(filterData);

            assert.equal(dar.filters.length, 0);
         });

         it(`remove w/ incorrect filterData (no removal)`, () =>
         {
            const dar = new DynArrayReducer([]);

            dar.filters.add(() => null);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(void 0, 'bogus');

            assert.equal(dar.filters.length, 1);
         });

         it(`removeBy - no filters added`, () =>
         {
            const dar = new DynArrayReducer([]);

            assert.equal(dar.filters.length, 0);
            dar.filters.removeBy(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeBy - filter w/ unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add(filter);

            assert.equal(dar.filters.length, 1);

            dar.filters.removeBy(({ id }) => id === void 0);

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });

         it(`removeBy - callback receives correct data`, () =>
         {
            const dar = new DynArrayReducer([]);

            dar.filters.add(() => null);

            assert.equal(dar.filters.length, 1);

            dar.filters.removeBy((data) =>
            {
               assert.isObject(data);
               assert.equal(Object.keys(data).length, 3);
               assert.isTrue('id' in data);
               assert.isTrue('filter' in data);
               assert.isTrue('weight' in data);

               return data.id === void 0;
            });

            assert.equal(dar.filters.length, 0);
         });

         it(`removeById - no filters added`, () =>
         {
            const dar = new DynArrayReducer([]);

            assert.equal(dar.filters.length, 0);
            dar.filters.removeById(void 0);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeById - filter w/ unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add({ id: 123, filter });

            assert.equal(dar.filters.length, 1);

            dar.filters.removeById({}, 123);

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });
      });
   });
}
