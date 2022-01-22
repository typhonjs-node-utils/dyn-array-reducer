import { generateTSDef }   from '@typhonjs-build-test/esm-d-ts';

// Generate TS Definition.
await generateTSDef({
   main: './src/DynArrayReducer.js',
   output: './types/index.d.ts',
   prependGen: ['./src/typedefs.js']
});

// Produce sourcemaps or not.
const s_SOURCEMAP = false;

export default () =>
{
   return [{   // This bundle is for the Node distribution.
         input: ['src/DynArrayReducer.js'],
         output: [{
            file: `./dist/DynArrayReducer.js`,
            format: 'es',
            preferConst: true,
            sourcemap: s_SOURCEMAP,
         }]
      }
   ];
};
