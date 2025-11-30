const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['tests/load-test.ts'],
  bundle: true,
  outfile: 'dist/k6/stress-test.js',
  format: 'esm',
  platform: 'neutral',
  target: 'es2015',
  external: ['k6', 'k6/*'],
}).catch(() => process.exit(1));