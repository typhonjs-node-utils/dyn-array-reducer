import fs                  from 'fs-extra';

import * as Module         from '../../../src/DynArrayReducer.js';

import TestsuiteRunner     from '../runner/TestsuiteRunner.js';

console.log('! - run.test.js - debug - 0');
fs.ensureDirSync('./.nyc_output');
console.log('! - run.test.js - debug - 1');
fs.emptyDirSync('./.nyc_output');

fs.ensureDirSync('./coverage');
fs.emptyDirSync('./coverage');

console.log('! - run.test.js - debug - 2');
TestsuiteRunner.run({ Module });
