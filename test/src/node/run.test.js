import fs                  from 'fs-extra';

import chai                from 'chai';
import chaiAsPromised      from 'chai-as-promised';

import * as Module         from '../../../src/DynArrayReducer.js';

import TestSuiteRunner     from '../runner/TestSuiteRunner.js';

chai.use(chaiAsPromised);

fs.ensureDirSync('./.nyc_output');
fs.emptyDirSync('./.nyc_output');

fs.ensureDirSync('./coverage');
fs.emptyDirSync('./coverage');

const data = {
   suitePrefix: 'node/DynArrayReducer',

   errors: [
   ],
};

TestSuiteRunner.run(Module, data, chai);
