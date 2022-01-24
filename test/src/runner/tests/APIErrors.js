/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../types')}   opts.Module - Module to test
 *
 * @param {object}                        opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { expect } = chai;
   const { DynArrayReducer } = Module;

   describe(`API Errors`, () =>
   {
      describe(`ctor errors`, () =>
      {
         it(`no argument`, () =>
         {
            expect(() => new DynArrayReducer()).to.throw(TypeError,
             `DynArrayReducer error: 'data' is not iterable.`);
         });

         it(`non-iterable argument`, () =>
         {
            expect(() => new DynArrayReducer(false)).to.throw(TypeError,
             `DynArrayReducer error: 'data' is not iterable.`);
         });
      });

      describe(`ctor errors (DynData)`, () =>
      {
         it(`no 'data' attribute`, () =>
         {
            expect(() => new DynArrayReducer({})).to.throw(TypeError,
             `DynArrayReducer error (DynData): 'data' attribute is not iterable.`);
         });

         it(`'data' attribute is non-iterable`, () =>
         {
            expect(() => new DynArrayReducer({ data: false })).to.throw(TypeError,
             `DynArrayReducer error (DynData): 'data' attribute is not iterable.`);
         });

         it(`'filters' attribute is non-iterable`, () =>
         {
            expect(() => new DynArrayReducer({ data: [], filters: false })).to.throw(TypeError,
             `DynArrayReducer error (DynData): 'filters' attribute is not iterable.`);
         });

         it(`'sort' attribute is not a function`, () =>
         {
            expect(() => new DynArrayReducer({ data: [], sort: false })).to.throw(TypeError,
             `DynArrayReducer error (DynData): 'sort' attribute is not a function.`);
         });
      });

      describe(`AdapterFilter errors`, () =>
      {
         it(`add - wrong argument`, () =>
         {
            const dar = new DynArrayReducer([]);

            expect(() => dar.filters.add(false)).to.throw(TypeError,
             `DynArrayReducer error: 'filter' is not a function or object.`);
         });

         it(`add - object - no data`, () =>
         {
            const dar = new DynArrayReducer([]);

            expect(() => dar.filters.add({})).to.throw(TypeError,
             `DynArrayReducer error: 'filter' attribute is not a function.`);
         });

         it(`add - object - no data`, () =>
         {
            const dar = new DynArrayReducer([]);

            expect(() => dar.filters.add({ filter: false })).to.throw(TypeError,
             `DynArrayReducer error: 'filter' attribute is not a function.`);
         });

         it(`add - object - weight not a number`, () =>
         {
            const dar = new DynArrayReducer([]);

            expect(() => dar.filters.add({ filter: () => null, weight: false })).to.throw(TypeError,
             `DynArrayReducer error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
         });

         it(`add - object - weight less than 0 (-1)`, () =>
         {
            const dar = new DynArrayReducer([]);

            expect(() => dar.filters.add({ filter: () => null, weight: -1 })).to.throw(TypeError,
             `DynArrayReducer error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
         });

         it(`add - object - weight greater than 1 (2)`, () =>
         {
            const dar = new DynArrayReducer([]);

            expect(() => dar.filters.add({ filter: () => null, weight: 2 })).to.throw(TypeError,
             `DynArrayReducer error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
         });

         it(`add - filter w/ subscribe - no unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            const filter = () => null;
            filter.subscribe = () => null;

            expect(() => dar.filters.add(filter)).to.throw(TypeError,
             `DynArrayReducer error: Filter has subscribe function, but no unsubscribe function is returned.`);
         });

         it(`add - duplicate filter w/ subscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            const filter = () => null;
            filter.subscribe = () => () => null;

            expect(() => dar.filters.add(filter, filter)).to.throw(Error,
             `DynArrayReducer error: Filter added already has an unsubscribe function registered.`);
         });

         // removeBy ----------------------------------------------------------------------------------------------

         it(`removeBy - callback not a function`, () =>
         {
            const dar = new DynArrayReducer([]);
            dar.filters.add(() => null);

            expect(() => dar.filters.removeBy()).to.throw(TypeError,
             `DynArrayReducer error: 'callback' is not a function.`);
         });
      });

      describe(`AdapterSort errors`, () =>
      {
         it(`set - compareFn w/ subscribe - no unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            const compareFn = () => null;
            compareFn.subscribe = () => null;

            expect(() => dar.sort.set(compareFn)).to.throw(Error,
             `DynArrayReducer error: 'compareFn' has subscribe function, but no unsubscribe function is returned.`);
         });
      });
   });
}
