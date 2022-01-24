import TestsuiteRunner        from '@typhonjs-build-test/testsuite-runner';

import * as APIErrors         from './tests/APIErrors.js';
import * as APITests           from './tests/APITests.js';
// import * as SequenceTests   from './tests/SequenceTests.js';
// import * as PerfTest          from './tests/PerfTest.js';

export default new TestsuiteRunner(
{
   APIErrors,
   APITests,
   // SequenceTests,
   // PerfTest
});
