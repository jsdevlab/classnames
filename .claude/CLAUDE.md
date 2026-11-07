# @jsdevlab/classnames

Classnames-compatible, framework-agnostic type-safe conditional class names.
Adds lazy function values, dedup by default (order preserved), and a dedup-toggle
factory (`createClassNames`).

## Commands

- `pnpm test` — type-check (`tsc --noEmit`) + run rstest
- `pnpm test:watch` — rstest watch mode
- `pnpm build` — rslib build → ESM (`dist/index.js`) + CJS (`dist/index.cjs`) + d.ts
- `pnpm dev` — rslib watch build
- `pnpm check` — biome lint + fix (also runs on pre-commit)
- `pnpm format` — biome format + fix (also runs on pre-push)
- `pnpm changeset` / `pnpm version` / `pnpm release` — changeset release flow

## Structure

- `src/index.ts` — the whole library (exports: `classNames`, `cx`, `createClassNames`)
- `tests/index.test.ts` — rstest tests, import from `../src/index` directly (no build needed)
- `rslib.config.ts` / `rstest.config.ts` — build / test config
- `.changeset/` — changesets for releases

## Gotchas

- `pnpm test`'s `tsc --noEmit` only covers `src/` (`tsconfig.json` include) — tests are NOT type-checked
- Lint/format is Biome, not ESLint/Prettier: single quotes, 80 columns, semicolons, `useEditorconfig: true`
- Requires Node ≥24.19 (`devEngines`, auto-downloads on mismatch) and pnpm 11.21
- Git hooks via simple-git-hooks: pre-commit = `pnpm check`, pre-push = `pnpm format`
- Number `0` is kept as a top-level value (`classNames('a', 0)` → `'a 0'`) but dropped as an object value (`{ a: 0 }` → `''`)
