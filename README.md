# @jsdevlab/classnames

[![npm version](https://img.shields.io/npm/v/@jsdevlab/classnames.svg)](https://www.npmjs.com/package/@jsdevlab/classnames)
[![CI](https://github.com/jsdevlab/classnames/actions/workflows/ci.yml/badge.svg)](https://github.com/jsdevlab/classnames/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.txt)

**English** | [简体中文](./README.zh-CN.md)

Type-safe conditional class names for JavaScript and TypeScript — framework-agnostic,
classnames-compatible, with lazy evaluation and deduplication by default.

## Features

- **Familiar API** — the same `classNames(...)` call shape you already know.
- **Deduplication by default** — `'a b a'` becomes `'a b'`; first-occurrence order is preserved.
- **Lazy function values** — `{ active: () => condition }` is evaluated when the class string is built.
- **Rich inputs** — strings, numbers, booleans, objects, nested arrays, and `Set`s.
- **Dedup opt-out factory** — `createClassNames({ unique: false })` keeps duplicates when you need them.
- **`cx` alias** — a short alias with identical behavior.
- **TypeScript-first** — complete declarations and exported types.
- **Zero runtime dependencies** — ESM + CJS builds, works in any modern JS runtime.

## Installation

```bash
pnpm add @jsdevlab/classnames
# or
npm install @jsdevlab/classnames
# or
yarn add @jsdevlab/classnames
```

## Quick start

```ts
import { classNames, cx, createClassNames } from '@jsdevlab/classnames';

classNames('btn', 'btn-primary'); // 'btn btn-primary'
classNames('btn', { 'btn-primary': true, 'is-loading': false }); // 'btn btn-primary'
classNames('btn', ['btn-lg', ['rounded']]); // 'btn btn-lg rounded'
classNames('btn', new Set(['btn-lg', 'rounded'])); // 'btn btn-lg rounded'
classNames('btn', 'btn'); // 'btn'

cx('btn', { disabled: true }); // 'btn disabled'
```

There is **no default export** — use named imports:

```ts
import { classNames } from '@jsdevlab/classnames'; // ✅
// import classNames from '@jsdevlab/classnames'; // ❌ not supported
```

## Usage

### Conditional class names

Object keys are emitted only when the corresponding value is truthy:

```ts
const isActive = true;

classNames('tab', {
  'is-active': isActive,
  'is-disabled': !isActive,
});
// 'tab is-active'
```

### Strings and numbers

Numbers are stringified; top-level `0` is kept:

```ts
classNames('z', 0, 1, 2); // 'z 0 1 2'
```

Note that object values use truthiness, so `0` is dropped there:

```ts
classNames({ zero: 0, one: 1 }); // 'one'
```

### Nested arrays and Sets

Arrays are flattened recursively, and `Set`s are supported directly:

```ts
classNames(['a', ['b', ['c']]]); // 'a b c'
classNames(new Set(['a', 'b'])); // 'a b'
classNames([new Set(['a']), { b: true }]); // 'a b'
```

### Lazy function values

A function used as an **object value** is invoked once at call time. Its return
value only decides whether the key is included — it is not converted to a class
name:

```ts
const flags = {
  'is-active': () => user.active,
  'is-admin': () => user.roles.includes('admin'),
};

classNames('user', flags);
// Both functions are evaluated now; only truthy keys are emitted.
```

This keeps call sites clean and defers expensive checks until the class string is
actually built. Each function runs once per `classNames` call; reusing the same
object across calls re-evaluates it.

### Deduplication

Duplicates are removed by default, preserving the order of first appearance:

```ts
classNames('a', 'b', 'a', ['b', { a: true }]); // 'a b'
```

### Keeping duplicates

Create a factory with deduplication turned off:

```ts
import { createClassNames } from '@jsdevlab/classnames';

const join = createClassNames({ unique: false });

join('a', 'a'); // 'a a'
classNames('a', 'a'); // 'a'
```

Options are resolved when the factory is created, so the returned function is
bound to them:

```ts
const cls = createClassNames(); // unique defaults to true
cls('a', 'a'); // 'a'
```

### React

```tsx
import { cx } from '@jsdevlab/classnames';
import type { ReactNode } from 'react';

interface ButtonProps {
  primary?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({ primary, loading, className, children }: ButtonProps) {
  return (
    <button
      className={cx(
        'btn',
        { 'btn-primary': primary, 'is-loading': loading },
        className,
      )}
      disabled={loading}
    >
      {children}
    </button>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { classNames } from '@jsdevlab/classnames';

defineProps<{ active?: boolean; disabled?: boolean }>();
</script>

<template>
  <button
    :class="classNames('tab', { 'is-active': active, 'is-disabled': disabled })"
  >
    <slot />
  </button>
</template>
```

Because the library is framework-agnostic, the same functions work in Svelte,
Solid, Angular, plain DOM code, or anywhere else JavaScript runs.

## API

### `classNames(...values: ClassValue[]): string`

Accepts any mix of supported values and returns a single space-separated class
name string. Returns `''` when nothing matches:

```ts
classNames(); // ''
classNames(null, false, undefined); // ''
```

### `cx`

An alias of `classNames` with the identical signature and behavior:

```ts
cx('a', { b: true }); // 'a b'
```

### `createClassNames(options?: ClassNamesOptions): typeof classNames`

Returns a `classNames`-style function bound to the given options.

#### `ClassNamesOptions`

| Option   | Type      | Default | Description                                                 |
| -------- | --------- | ------- | ----------------------------------------------------------- |
| `unique` | `boolean` | `true`  | Deduplicate class names, preserving first-occurrence order. |

```ts
const defaultJoin = createClassNames(); // unique: true
const keepAll = createClassNames({ unique: false }); // keeps duplicates
```

## Types

All types are exported:

```ts
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassObject
  | ClassValue[]
  | Set<ClassValue>;

export interface ClassObject {
  [key: string]: ClassValue | (() => ClassValue);
}

export interface ClassNamesOptions {
  unique?: boolean;
}
```

## Behavior reference

| Input                                                     | Output     |
| --------------------------------------------------------- | ---------- |
| `classNames('a', 'b')`                                    | `'a b'`    |
| `classNames('a', '', null, undefined, false, true)`       | `'a'`      |
| `classNames(0, 1)`                                        | `'0 1'`    |
| `classNames({ a: true, b: false, c: 1, d: 0 })`           | `'a c'`    |
| `classNames(['a', [{ b: true }]])`                        | `'a b'`    |
| `classNames(new Set(['a', 'b']))`                         | `'a b'`    |
| `classNames({ active: () => true, hidden: () => false })` | `'active'` |
| `classNames('a', 'b', 'a')`                               | `'a b'`    |
| `createClassNames({ unique: false })('a', 'a')`           | `'a a'`    |
| `classNames()`                                            | `''`       |

## Notes and edge cases

- Class names are always joined with a **single space**; there is no custom
  separator option.
- Deduplication compares exact, case-sensitive strings and does **not** split
  strings: `classNames('a b', 'b')` returns `'a b b'`.
- Top-level `0` is kept (`classNames(0)` → `'0'`), but `0` as an object value is
  falsy and dropped (`{ a: 0 }` → `''`).
- `true` and `false` are ignored as values; only object keys produce output.
- Functions are supported **only as object values**. A function passed as a
  top-level argument is ignored.
- A function's return value is tested for truthiness; it does not become the
  class name (`{ a: () => 'foo' }` → `'a'`).
- Output order follows input order; object keys follow `Object.entries` order.
  Deduplication keeps the first occurrence.
- `null`, `undefined`, and empty strings are ignored.

## classnames compatibility

`@jsdevlab/classnames` is a drop-in replacement for `classnames` in most cases:

```diff
-import classNames from 'classnames';
+import { classNames } from '@jsdevlab/classnames';
```

| Capability                                  | `classnames`                         | `@jsdevlab/classnames`                |
| ------------------------------------------- | ------------------------------------ | ------------------------------------- |
| Strings / numbers                           | ✅                                   | ✅                                    |
| Objects with truthy keys                    | ✅                                   | ✅                                    |
| Nested arrays                               | ✅                                   | ✅                                    |
| Skips `null` / `undefined` / `false` / `''` | ✅                                   | ✅                                    |
| `Set` input                                 | —                                    | ✅                                    |
| Function values in objects                  | Not evaluated (functions are truthy) | Evaluated at call time                |
| Duplicate removal                           | via `classnames/dedupe`              | Default                               |
| Keep duplicates                             | Default                              | `createClassNames({ unique: false })` |
| Custom separator                            | —                                    | —                                     |
| Default export                              | ✅                                   | — (named exports only)                |

If you relied on the default duplicate-preserving behavior of `classnames`, bind
your own instance:

```ts
import { createClassNames } from '@jsdevlab/classnames';

const classNames = createClassNames({ unique: false });
```

## Module formats

| Format     | File              |
| ---------- | ----------------- |
| ESM        | `dist/index.js`   |
| CommonJS   | `dist/index.cjs`  |
| TypeScript | `dist/index.d.ts` |

```ts
// ESM
import { classNames } from '@jsdevlab/classnames';

// CommonJS
const { classNames } = require('@jsdevlab/classnames');
```

The package has no runtime dependencies and works in modern browsers, Node.js,
Bun, and Deno.

## Development

Requires Node.js ≥ 24.19 and pnpm 12.18.

```bash
pnpm install
pnpm test        # tsc --noEmit + rstest
pnpm build       # rslib build → dist/
pnpm check       # Biome lint + fix
pnpm format      # Biome format + fix
```

Releases are managed with [changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset   # describe the change
pnpm version     # bump versions and changelog
pnpm release     # publish to npm
```

## License

[MIT](./LICENSE.txt) © 2026 jsdevlab
