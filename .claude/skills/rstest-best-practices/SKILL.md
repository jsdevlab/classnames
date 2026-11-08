---

name: rstest-best-practices
description: Rstest 0.12 best practices for config, CLI workflow, test writing, mocking, snapshot testing, DOM and real-browser testing, coverage, multi-project setup, CI integration, performance and debugging. Use when writing, reviewing, or troubleshooting Rstest test projects.
---

# Rstest Best Practices

Apply these rules when writing or reviewing Rstest test projects.

> Version scope: Rstest 0.12.x. For the latest docs, read
> https://rstest.rs/llms.txt.

## Configuration

- Use `rstest.config.ts` and `defineConfig` from `@rstest/core`
- Prefer explicit imports `import { test, expect, describe } from '@rstest/core'` over `globals: true`
- For Rsbuild projects, use `@rstest/adapter-rsbuild` with `extends: withRsbuildConfig()` to reuse build config
- For Rslib projects, use `@rstest/adapter-rslib` with `extends: withRslibConfig()` to reuse build config; adapter 0.12+ supports Rslib 1.x
- Use `setupFiles` for shared test setup (e.g., custom matchers, cleanup hooks)
- When using Rsbuild plugins (e.g., `@rsbuild/plugin-react`), add them via the `plugins` field
- For deep-level or advanced build configuration needs, use `tools.rspack` or `tools.bundlerChain`

## CLI

- Use `rstest run` in CI (it disables watch mode)
- Use `rstest watch` or `rstest --watch` for local development with file watching
- Use `rstest list` to list all test files and test names
- Use `rstest -u` to update snapshots
- Use `--reporter=verbose` when debugging test failures for detailed output
- Use `--config` (`-c`) to specify a custom config file path
- Use `--project <name>` to run selected projects; wildcards are supported
- Express exact file filters with quotes; 0.12 treats unquoted filters as patterns rather than exact names

## Test writing

- Import test APIs from `@rstest/core`: `test`, `describe`, `expect`, `beforeEach`, `afterEach`, etc.
- Use `test` or `it` for test cases; use `describe` for grouping related tests
- Use `.only` to focus on specific tests during development, but never commit `.only` to the codebase
- Use `.skip` or `.todo` to mark incomplete or temporarily skipped tests
- Prefer small, focused test cases that test a single behavior
- For async error paths, prefer `await expect(fn()).rejects.toThrow(ErrorClass)` (or `.rejects.toMatchObject({ ... })`) over `try/catch` with `expect.fail` or `.catch(e => e)` patterns — the matcher form fails clearly if the promise unexpectedly resolves, keeps the assertion in one chain, and avoids forgetting to assert the throw at all
- For async happy paths, use `await expect(fn()).resolves.toEqual(...)` for the same reason
- Use `includeSource` for in-source testing of small utility functions (Rust-style `import.meta.rstest`)
- For in-source tests, wrap test code in `if (import.meta.rstest) { ... }` and define `import.meta.rstest` as `false` in production build config

## Test environment

- Use `testEnvironment: 'node'` (default) for Node.js / server-side code
- Use `testEnvironment: 'jsdom'` or `testEnvironment: 'happy-dom'` for simulated DOM / browser APIs in Node
- Install `jsdom` or `happy-dom` as a dev dependency when using DOM environments
- Prefer `happy-dom` for faster simulated DOM testing; use `jsdom` when better browser API compatibility is needed
- `happy-dom` and `jsdom` are **not real browsers**: they cannot validate browser-engine behavior, layout, or the actual browser module/runtime environment
- For real browser testing, use `@rstest/browser` with Playwright. Install the adapter (`@rstest/browser`) and `playwright`, then download a browser with `npx playwright install chromium`
- Enable browser mode with `browser: { enabled: true, provider: 'playwright', browser: 'chromium' }` or the `--browser` CLI flag
- Keep browser mode opt-in with a separate `test:browser` script when you want the default Node suite to stay fast and browser-installation-free
- Since 0.12, browser mode reaches parity with Node mode: native V8 coverage, `rs.mock`, `includeSource`, `globalSetup`, Module Federation, and watch shortcuts all work
- All browser projects in one run must share identical provider/browser/headless/port settings
- Use inline project configs (`projects` + `defineProject`) to run Node and browser environments within one config

## React / Vue testing

- For React: use `@rsbuild/plugin-react` plugin and `@testing-library/react` for component testing
- For Vue: use `@rsbuild/plugin-vue` plugin and `@testing-library/vue` for component testing
- Create a `rstest.setup.ts` with `expect.extend(jestDomMatchers)` and `afterEach(() => cleanup())` for Testing Library
- Add the setup file to `setupFiles` in config
- For SSR testing, use `testEnvironment: 'node'` and test with `react-dom/server` or framework-specific SSR APIs

## Mocking

- Use `rs.mock('./module')` to mock modules
- Use `rs.fn()` to create mock functions
- Use `rs.spyOn(object, 'method')` to spy on methods
- Prefer `clearMocks`, `resetMocks`, or `restoreMocks` config options to automatically clean up mocks between tests
- Use factory functions in `rs.mock('./module', () => ({ ... }))` to provide mock implementations

## Snapshot testing

- Use `toMatchSnapshot()` for general snapshot testing
- Use `toMatchInlineSnapshot()` for small, readable inline snapshots
- Use `toMatchFileSnapshot()` for large or structured outputs (e.g., HTML, generated code)
- Keep snapshots concise — only include relevant data, avoid timestamps and session IDs
- Use `expect.addSnapshotSerializer()` to mask paths or sensitive data in snapshots
- Use `path-serializer` to normalize file paths across platforms
- Review snapshot changes carefully in code review

## Coverage

- Enable coverage with `--coverage` CLI flag or `coverage.enabled: true` in config
- Install `@rstest/coverage-v8` for the V8 provider or `@rstest/coverage-istanbul` for the Istanbul provider
- Use `coverage.include` to specify source files for coverage (e.g., `['src/**/*.{js,ts,tsx}']`)
- Use `coverage.thresholds` to enforce minimum coverage requirements
- Use `coverage.reporters` to generate reports in different formats (e.g., `text`, `lcov`, `html`)
- Native V8 coverage is supported in browser mode as well as Node mode

## Multi-project testing

- Use the `projects` field in the root config to define multiple test projects
- For monorepos, use glob patterns like `'packages/*'` to auto-discover sub-projects
- Use `defineProject` in sub-project configs; use `defineInlineProject` for inline projects that require a `name`
- Extract shared config and use `mergeRstestConfig` to compose project configs
- Global options (`reporters`, `pool`, `isolate`, `coverage`, `bail`, `teardownTimeout`, `resolveSnapshotPath`, `onConsoleLog`, `output`) must be set at the root level, not in projects

## CI integration

- Use `rstest run` (not watch mode) in CI
- Install a browser before browser tests: `pnpm exec playwright install --with-deps chromium` (or `npx playwright install chromium`)
- Run Node and browser suites as separate steps so failures are easy to attribute
- Use `--shard` for parallel test execution across CI machines (e.g., `--shard 1/3`)
- Use `--reporter=blob` with `rstest merge-reports` to combine sharded results
- Use `--reporter=junit` with `outputPath` for CI report integration
- The `github-actions` reporter is auto-enabled in GitHub Actions for inline error annotations
- Use `--bail` to stop early on first failure when appropriate

## Performance

- Disable `isolate` (`--no-isolate`) when tests have no side effects for faster execution via module cache reuse
- Use `pool.maxWorkers` to control parallelism based on available resources
- Keep test builds fast by avoiding unnecessary Rspack plugins in test config
- Use test filtering (`rstest <pattern>` or `-t <name>`) to run only relevant tests during development
- Leverage watch mode's incremental re-runs for fast local feedback

## Debugging

- Run with `DEBUG=rstest` to enable debug mode, which writes final configs and build outputs to disk
- Read generated files in `dist/.rstest-temp/.rsbuild/` to confirm the final Rstest/Rsbuild/Rspack config
- Use VS Code's JavaScript Debug Terminal to run `rstest` with breakpoints
- Use `--reporter=verbose` for detailed per-test output
- Use `--printConsoleTrace` to trace console calls to their source
- Add a VS Code launch config for debugging specific test files with `@rstest/core/bin/rstest.js`

## Profiling

- Use Rsdoctor with `RSDOCTOR=true rstest run` to analyze test build performance
- Use `samply` for native profiling of both main and worker processes
- Use Node.js `--heap-prof` for memory profiling

## 0.12 migration notes

- The programmatic JavaScript API was rewritten; review code using `@rstest/core/api` or custom reporters
- Public result types are now unified with reporter types
- Exact file filters must be quoted; unquoted positional arguments are treated as patterns
- `sequence.hooks` and `sequence.setupFiles` were added in 0.12.6; the default hook cleanup order changed in 0.12.6
- Browser-mode config/browser-module errors are now thrown instead of exiting the process

## Toolchain integration

- Use the official VS Code extension (`rstack.rstest`) for in-editor test running and debugging
- For Rslib libraries, use `@rstest/adapter-rslib` for config reuse
- For Rsbuild apps, use `@rstest/adapter-rsbuild` for config reuse
- Use `process.env.RSTEST` to detect test environment and apply test-specific config

## Documentation

- For the latest Rstest docs, read https://rstest.rs/llms.txt
- 0.12 announcement: https://rstest.rs/blog/announcing-0-12
