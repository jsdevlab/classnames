---

name: rslib-best-practices
description: Rslib 1.x best practices for config, CLI workflow, output targets, declaration files, dependency handling, browser/Node compatibility, build optimization and toolchain integration. Use when writing, reviewing, or troubleshooting Rslib projects.
---

# Rslib Best Practices

Apply these rules when writing or reviewing Rslib library projects.

> Version scope: Rslib 1.x, built on Rsbuild 2.x. For the latest docs, read
> https://rslib.rs/llms.txt.

## Configuration

- Use `rslib.config.ts` and `defineConfig`
- Check Rslib-specific configurations first (e.g., `lib.*`), and also leverage Rsbuild configurations (e.g., `source.*`, `output.*`, `tools.*`) as needed
- For deep-level or advanced configuration needs, use `tools.rspack` or `tools.bundlerChain` to access Rspack's native configurations
- In TypeScript projects, prefer `tsconfig.json` path aliases
- `lib.syntax` defaults to `'esnext'`. Set it to the oldest syntax your consumers require; `syntax` affects JS/CSS downleveling only, not runtime API polyfills
- `output.target` defaults to `'node'`. Set `'web'` for universal or browser-facing libraries, `'node'` for Node-only libraries, and `'web-worker'` for worker bundles. Rsbuild 2 supports `web | node | web-worker` (no `neutral`)
- Prefer `output.autoExternal` over the deprecated `lib.autoExternal`
- Use `lib.dts.tsgo: true` with `@typescript/native-preview` installed for faster declaration generation
- `lib.experiments.exe` (Node single executable) is experimental, requires Node.js >= 25.7.0, and supports one entry per `lib` item

## CLI

- Use `rslib` to build
- Use `rslib --watch` to build in watch mode for local development
- Use `rslib inspect` to inspect final Rslib/Rsbuild/Rspack configs

## Output

- Prefer to build pure-ESM packages with `"type": "module"` in `package.json`
- Prefer bundleless mode with `output.target: 'web'` for component libraries
- Prefer bundle mode for Node.js utility libraries; bundle mode is also fine for small universal utilities
- Ensure the `exports` field in `package.json` matches the actual JavaScript and declaration outputs for every format (ESM, CJS, etc.)
- For universal libraries, keep the build free of Node.js built-ins and format-specific APIs, and set `output.target: 'web'`; Node.js can consume web-targeted output
- Avoid `import.meta.url`, `__dirname`, `require`, and other format-specific APIs in shared source unless the build provides shims

## Browser compatibility

- Choose `lib.syntax` from the APIs the source actually uses (e.g., `es2017` for `Object.entries`) and verify the emitted syntax
- Do not assume syntax lowering polyfills runtime APIs; document or add polyfills separately when targeting older browsers
- Test the built ESM/CJS entry points in Node.js and run the suite in a real browser via Rstest browser mode when browser support is a requirement
- Keep dependencies browser-safe or externalized; inspect `dist` for unexpected Node built-ins

## Declaration files

- Prefer `lib.dts: true` or a detailed `lib.dts` configuration
- Ensure declaration output paths match the `types` condition in `exports`

## Dependencies

- In bundle mode, put dependencies to be bundled in `devDependencies`; `dependencies` and `peerDependencies` are externalized by default
- Verify the build output and dependency specifiers carefully so consumers do not hit missing-module errors
- Keep the dependency surface small; a zero-runtime-dependency utility is ideal

## Migration notes (0.x → 1.0)

- Rslib 1.0 uses Rsbuild 2; ensure Rsbuild plugins support `@rsbuild/core` v2
- Default ESM `externalsType` changed from `module-import` to `modern-module`; under `target: 'node'`, CJS `require()` of externals now emits `createRequire()`
- `import.meta.env.*`, `process.env.BASE_URL`, and `process.env.ASSET_PREFIX` are no longer inlined at build time; use `source.define` if build-time replacement is required
- `es2023`/`es2024` Browserslist baselines were raised and `es2025` was added; pin explicit syntax targets when byte-for-byte output matters
- Resource modules (`new URL(...)`, Workers, Wasm) have new emission modes; review asset URLs instead of assuming 0.x behavior

## Build optimization

- Keep the syntax target aligned with real compatibility requirements to enable better optimizations
- Avoid format-specific APIs in source for better ESM/CJS compatibility
- Prefer lightweight dependencies to reduce bundle size

## Toolchain integration

- Prefer Rstest with `@rstest/adapter-rslib` for tests; adapter 0.12+ supports Rslib 1.x
- Prefer Rspress for library documentation, with `@rspress/plugin-preview` and `@rspress/plugin-api-docgen` for component previews and API docs

## Debugging

- Run with `DEBUG=rsbuild` when diagnosing config resolution or plugin behavior
- Read generated files in `dist/.rsbuild` to confirm the final Rsbuild/Rspack config, not assumed config

## Documentation

- For the latest Rslib docs, read https://rslib.rs/llms.txt
- Upgrade guide: https://rslib.rs/guide/upgrade/v0-to-v1
