import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig(),
  // The library is DOM-free; the Rslib adapter infers `happy-dom` for a `web`
  // build target, so pin the Node environment explicitly.
  testEnvironment: 'node',
  // Opt-in with `rstest run --browser` (see `test:browser`). Keeping browser
  // mode disabled by default lets the fast Node test suite run without a
  // Playwright browser installation.
  browser: {
    enabled: false,
    provider: 'playwright',
    browser: 'chromium',
    headless: true,
  },
});
