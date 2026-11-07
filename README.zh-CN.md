# @jsdevlab/classnames

[![npm version](https://img.shields.io/npm/v/@jsdevlab/classnames.svg)](https://www.npmjs.com/package/@jsdevlab/classnames)
[![CI](https://github.com/jsdevlab/classnames/actions/workflows/ci.yml/badge.svg)](https://github.com/jsdevlab/classnames/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.txt)

[English](./README.md) | **简体中文**

面向 JavaScript 与 TypeScript 的类型安全条件类名工具 —— 框架无关、兼容 classnames，
默认去重，并支持惰性求值。

## 特性

- **熟悉的 API** —— 与 `classnames` 相同的 `classNames(...)` 调用方式。
- **默认去重** —— `'a b a'` 会变成 `'a b'`，并保留首次出现的顺序。
- **惰性函数值** —— `{ active: () => condition }` 在构建类名字符串时才求值。
- **输入类型丰富** —— 字符串、数字、布尔值、对象、嵌套数组与 `Set`。
- **可关闭去重的工厂** —— 需要保留重复项时使用 `createClassNames({ unique: false })`。
- **`cx` 别名** —— 行为完全一致的简短别名。
- **TypeScript 优先** —— 完整的类型声明与导出的类型。
- **零运行时依赖** —— 同时提供 ESM 与 CJS 构建，可在任何现代 JS 运行时中使用。

## 安装

```bash
pnpm add @jsdevlab/classnames
# 或
npm install @jsdevlab/classnames
# 或
yarn add @jsdevlab/classnames
```

## 快速开始

```ts
import { classNames, cx, createClassNames } from '@jsdevlab/classnames';

classNames('btn', 'btn-primary'); // 'btn btn-primary'
classNames('btn', { 'btn-primary': true, 'is-loading': false }); // 'btn btn-primary'
classNames('btn', ['btn-lg', ['rounded']]); // 'btn btn-lg rounded'
classNames('btn', new Set(['btn-lg', 'rounded'])); // 'btn btn-lg rounded'
classNames('btn', 'btn'); // 'btn'

cx('btn', { disabled: true }); // 'btn disabled'
```

本包**没有默认导出**，请使用具名导入：

```ts
import { classNames } from '@jsdevlab/classnames'; // ✅
// import classNames from '@jsdevlab/classnames'; // ❌ 不支持
```

## 用法

### 条件类名

只有当对象的值为真值时，对应的键才会被输出：

```ts
const isActive = true;

classNames('tab', {
  'is-active': isActive,
  'is-disabled': !isActive,
});
// 'tab is-active'
```

### 字符串与数字

数字会被转换为字符串；顶层的 `0` 会被保留：

```ts
classNames('z', 0, 1, 2); // 'z 0 1 2'
```

注意，对象值按真值判断，因此其中的 `0` 会被丢弃：

```ts
classNames({ zero: 0, one: 1 }); // 'one'
```

### 嵌套数组与 Set

数组会被递归展平，同时也直接支持 `Set`：

```ts
classNames(['a', ['b', ['c']]]); // 'a b c'
classNames(new Set(['a', 'b'])); // 'a b'
classNames([new Set(['a']), { b: true }]); // 'a b'
```

### 惰性函数值

作为**对象值**传入的函数会在调用时执行一次。它的返回值只用于判断是否输出对应
的键 —— 返回值本身不会作为类名：

```ts
const flags = {
  'is-active': () => user.active,
  'is-admin': () => user.roles.includes('admin'),
};

classNames('user', flags);
// 两个函数会在此时求值，只有结果为真值的键会被输出。
```

这样可以让调用处保持简洁，并把开销较大的判断推迟到真正构建类名字符串时。每个
函数在每次 `classNames` 调用中执行一次；在多次调用间复用同一个对象会重新求值。

### 去重

默认会移除重复类名，并保留首次出现的顺序：

```ts
classNames('a', 'b', 'a', ['b', { a: true }]); // 'a b'
```

### 保留重复项

创建一个关闭去重的工厂函数：

```ts
import { createClassNames } from '@jsdevlab/classnames';

const join = createClassNames({ unique: false });

join('a', 'a'); // 'a a'
classNames('a', 'a'); // 'a'
```

选项在创建工厂时解析，返回的函数会绑定这些选项：

```ts
const cls = createClassNames(); // unique 默认为 true
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

由于本库与框架无关，同样的函数也可用于 Svelte、Solid、Angular、原生 DOM 代码，
或任何其他 JavaScript 运行环境。

## API

### `classNames(...values: ClassValue[]): string`

接收任意组合的受支持值，返回以单个空格连接的类名字符串。没有有效类名时返回
`''`：

```ts
classNames(); // ''
classNames(null, false, undefined); // ''
```

### `cx`

`classNames` 的别名，签名与行为完全一致：

```ts
cx('a', { b: true }); // 'a b'
```

### `createClassNames(options?: ClassNamesOptions): typeof classNames`

返回一个绑定指定选项的 `classNames` 风格函数。

#### `ClassNamesOptions`

| 选项     | 类型      | 默认值 | 说明                             |
| -------- | --------- | ------ | -------------------------------- |
| `unique` | `boolean` | `true` | 对类名去重，保留首次出现的顺序。 |

```ts
const defaultJoin = createClassNames(); // unique: true
const keepAll = createClassNames({ unique: false }); // 保留重复项
```

## 类型

所有类型均已导出：

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

## 行为参考

| 输入                                                      | 输出       |
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

## 注意事项与边界情况

- 类名始终使用**单个空格**连接，不提供自定义分隔符选项。
- 去重按完全相同的字符串比较，区分大小写，且**不会**拆分字符串：
  `classNames('a b', 'b')` 返回 `'a b b'`。
- 顶层 `0` 会被保留（`classNames(0)` → `'0'`），但对象值中的 `0` 为假值，会被
  丢弃（`{ a: 0 }` → `''`）。
- `true` 和 `false` 作为值会被忽略；只有对象的键会产生输出。
- 函数**只能作为对象值**使用；直接作为顶层参数传入的函数会被忽略。
- 函数的返回值只用于判断真值，不会成为类名（`{ a: () => 'foo' }` → `'a'`）。
- 输出顺序与输入顺序一致；对象的键遵循 `Object.entries` 的顺序。去重保留首次
  出现的位置。
- `null`、`undefined` 和空字符串会被忽略。

## 与 classnames 的兼容性

在大多数场景下，`@jsdevlab/classnames` 可以直接替代 `classnames`：

```diff
-import classNames from 'classnames';
+import { classNames } from '@jsdevlab/classnames';
```

| 能力                                       | `classnames`             | `@jsdevlab/classnames`                |
| ------------------------------------------ | ------------------------ | ------------------------------------- |
| 字符串 / 数字                              | ✅                       | ✅                                    |
| 值为真值的对象                             | ✅                       | ✅                                    |
| 嵌套数组                                   | ✅                       | ✅                                    |
| 跳过 `null` / `undefined` / `false` / `''` | ✅                       | ✅                                    |
| `Set` 输入                                 | —                        | ✅                                    |
| 对象中的函数值                             | 不求值（函数本身为真值） | 在调用时求值                          |
| 移除重复项                                 | 通过 `classnames/dedupe` | 默认行为                              |
| 保留重复项                                 | 默认行为                 | `createClassNames({ unique: false })` |
| 自定义分隔符                               | —                        | —                                     |
| 默认导出                                   | ✅                       | —（仅具名导出）                       |

如果你的代码依赖 `classnames` 默认保留重复项的行为，可以绑定自己的实例：

```ts
import { createClassNames } from '@jsdevlab/classnames';

const classNames = createClassNames({ unique: false });
```

## 模块格式

| 格式       | 文件              |
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

本包没有运行时依赖，可在现代浏览器、Node.js、Bun 与 Deno 中使用。

## 开发

需要 Node.js ≥ 24.19 与 pnpm 12.18。

```bash
pnpm install
pnpm test        # tsc --noEmit + rstest
pnpm build       # rslib 构建 → dist/
pnpm check       # Biome 检查并修复
pnpm format      # Biome 格式化并修复
```

发布流程使用 [changesets](https://github.com/changesets/changesets)：

```bash
pnpm changeset   # 描述本次变更
pnpm version     # 更新版本号与 CHANGELOG
pnpm release     # 发布到 npm
```

## 许可证

[MIT](./LICENSE.txt) © 2026 jsdevlab
