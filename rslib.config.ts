import { defineConfig } from '@rslib/core';

// Universal library: `web` target keeps the output free of Node.js assumptions,
// while `es2017` matches the oldest syntax the source relies on
// (`Object.entries`). Both Node.js and browsers can consume the result.
export default defineConfig({
  output: {
    target: 'web',
  },
  lib: [
    {
      format: 'esm',
      syntax: ['es2017'],
      dts: true,
    },
    {
      format: 'cjs',
      syntax: ['es2017'],
    },
  ],
});
