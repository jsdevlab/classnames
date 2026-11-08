# @jsdevlab/classnames

Classnames-compatible, framework-agnostic, type-safe conditional class names.
Adds lazy function values, dedup by default (order preserved), and a
dedup-toggle factory (`createClassNames`).

## Toolchain

- Node.js ≥ 24.19 and < 27 — enforced by `devEngines` (auto-download on mismatch)
- pnpm 12.18 — pinned via `packageManager`
- Rslib 1.x (Rsbuild 2) for building, Rstest 0.12 for tests, Biome 2 for lint/format
- No runtime dependencies; ships ESM + CJS + TypeScript declarations

## Commands

- `pnpm test` — type-check (`tsc --noEmit`) + Node test suite (`rstest run`)
- `pnpm test:watch` — Rstest watch mode
- `pnpm test:browser` — same suite in real Chromium via `@rstest/browser` + Playwright
- `pnpm test:all` — Node + browser suites
- `pnpm build` — Rslib build → ESM (`dist/index.js`) + CJS (`dist/index.cjs`) + d.ts
- `pnpm dev` — Rslib watch build
- `pnpm check` — Biome lint + fix (also runs on pre-commit)
- `pnpm format` — Biome format + fix (also runs on pre-push)
- `pnpm changeset` / `pnpm version` / `pnpm release` — changeset release flow

Browser tests need a one-time `pnpm exec playwright install chromium`. They are
kept out of `pnpm test` so the default suite stays fast and install-free; CI runs
both suites. If the Chromium download is unavailable, an installed Edge browser
works locally via
`pnpm exec rstest run --browser.enabled --browser.providerOptions.launch.channel msedge`.
Use `--browser.enabled` rather than bare `--browser`: Rstest 0.12.6 rejects the
latter during CLI wildcard validation unless a `--browser.*` sub-option is also
present.

## Structure

- `src/index.ts` — the whole library (exports: `classNames`, `cx`, `createClassNames`)
- `tests/index.test.ts` — Rstest tests, import from `../src/index` directly (no build needed)
- `rslib.config.ts` — universal build: `output.target: 'web'`, `syntax: ['es2017']`
- `rstest.config.ts` — extends the Rslib config via `@rstest/adapter-rslib`; browser mode is opt-in
- `.claude/skills/` — project agent skills for Rslib/Rstest best practices
- `.changeset/` — changesets for releases

## Compatibility requirements

- The package must work in both Node.js and browsers. Keep `src/` free of Node
  built-ins and format-specific APIs (`require`, `__dirname`, `import.meta.url`,
  `process`, etc.).
- Rslib is configured with `output.target: 'web'` (Rslib's default is `node`) and
  `syntax: ['es2017']` — the oldest syntax the source needs because of
  `Object.entries`. Syntax lowering does not polyfill runtime APIs.
- Verify changes with `pnpm test` and `pnpm test:browser` (or `pnpm test:all`).
  CI runs lint, both test suites, and the build.

## Gotchas

- `pnpm test`'s `tsc --noEmit` only covers `src/` (`tsconfig.json` include) — tests are NOT type-checked
- Lint/format is Biome, not ESLint/Prettier: single quotes, 80 columns, semicolons, `useEditorconfig: true`
- No default export — consumers must use named imports (`classNames`, `cx`, `createClassNames`)
- Number `0` is kept as a top-level value (`classNames('a', 0)` → `'a 0'`) but dropped as an object value (`{ a: 0 }` → `''`)
- Dedup is exact-match and does not split multi-class strings: `classNames('a b', 'b')` → `'a b b'`
- Function values are supported only as object values; a top-level function argument is ignored
- Git hooks via simple-git-hooks: pre-commit = `pnpm check`, pre-push = `pnpm format`
- When upgrading Rslib/Rstest, update `.claude/skills/` alongside the dependencies
