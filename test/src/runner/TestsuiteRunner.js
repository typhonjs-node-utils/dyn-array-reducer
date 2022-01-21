import TestsuiteRunner        from '@typhonjs-build-test/testsuite-runner';

import * as APIErrors         from './tests/APIErrors.js';
import * as DynArrayReducer   from './tests/DynArrayReducer.js';
// import * as PerfTest          from './tests/PerfTest.js';

export default new TestsuiteRunner(
{
   APIErrors,
   DynArrayReducer,
   // PerfTest
});
