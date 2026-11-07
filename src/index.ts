/**
 * @jsdevlab/classnames — a type-safe conditional class name utility (framework-agnostic).
 *
 * classnames-compatible, plus enhancements:
 * - Basics: strings/numbers/objects (truthy keys)/nested arrays/Sets
 * - Enhancements: lazily evaluated function values (`{ active: () => cond }`),
 *   deduplication by default (order preserved), dedup toggle factory (createClassNames)
 */

/** Object value: a plain value or a lazily evaluated function. */
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

/**
 * Options for the class name factory.
 *
 * Class names always join with a space (the only separator CSS accepts),
 * so only deduplication is configurable.
 *
 * @example
 * createClassNames({ unique: false })
 */
export interface ClassNamesOptions {
  /** Whether to deduplicate (order preserved), defaults to true. */
  unique?: boolean;
}

interface ResolvedOptions {
  unique: boolean;
}

const DEFAULT_OPTIONS: ResolvedOptions = { unique: true };

const resolveOptions = (options?: ClassNamesOptions): ResolvedOptions => ({
  unique: options?.unique ?? DEFAULT_OPTIONS.unique,
});

/** Collects class name fragments (recursive; not deduplicated). */
const collect = (value: ClassValue, parts: string[]): void => {
  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === true
  ) {
    return;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    if (value !== '') parts.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collect(item, parts);
    return;
  }
  if (value instanceof Set) {
    for (const item of value) collect(item, parts);
    return;
  }
  // Object: truthy keys emit class names; function values are evaluated lazily before the check
  for (const [key, raw] of Object.entries(value)) {
    const v = typeof raw === 'function' ? raw() : raw;
    if (v) parts.push(key);
  }
};

/** Core implementation (reused by createClassNames). */
const classNamesImpl = (
  values: ClassValue[],
  options: ResolvedOptions,
): string => {
  const parts: string[] = [];
  for (const value of values) collect(value, parts);
  if (!options.unique) return parts.join(' ');
  // Deduplicate, preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const part of parts) {
    if (!seen.has(part)) {
      seen.add(part);
      unique.push(part);
    }
  }
  return unique.join(' ');
};

/**
 * Conditional class names (classnames-compatible + enhanced); `cx` is an alias.
 *
 * @param values Class values: strings/numbers, objects with truthy keys, nested arrays,
 * Sets, and lazily evaluated function values.
 * @returns The joined class name string.
 * @example
 * classNames('a', 'b', 'c')                          // 'a b c'
 * classNames('a', { b: true, c: false }, ['d'])      // 'a b d'
 * classNames({ active: () => isActive })             // 'active' when isActive is truthy
 * classNames('a', 'b', 'a')                          // 'a b' (deduplicated, order preserved)
 */
export function classNames(...values: ClassValue[]): string;
export function classNames(...values: ClassValue[]): string {
  return classNamesImpl(values, resolveOptions());
}

/**
 * Short alias of `classNames` (identical signature and behavior).
 *
 * @example
 * cx('a', { b: true })   // 'a b'
 */
export const cx: typeof classNames = classNames;

/**
 * Factory with a dedup toggle.
 *
 * @param options Dedup options.
 * @returns A `classNames`-like function bound to the given options.
 * @example
 * const keep = createClassNames({ unique: false })
 * keep('a', 'a')              // 'a a'
 */
export function createClassNames(
  options?: ClassNamesOptions,
): typeof classNames {
  const resolved = resolveOptions(options);
  return (...values: ClassValue[]) => classNamesImpl(values, resolved);
}
