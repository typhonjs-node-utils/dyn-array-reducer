import APIErrors              from './tests/APIErrors.js';
import DynArrayReducer        from './tests/DynArrayReducer.js';

const s_API_ERRORS            = true;
const s_ARRAY_REDUCER         = true;

const s_TESTS = [];

if (s_API_ERRORS) { s_TESTS.push(APIErrors); }
if (s_ARRAY_REDUCER) { s_TESTS.push(DynArrayReducer); }

export default class TestSuiteRunner
{
   static run(Module, data, chai)
   {
      for (const Test of s_TESTS)
      {
         Test.run(Module, data, chai);
      }
   }
}
