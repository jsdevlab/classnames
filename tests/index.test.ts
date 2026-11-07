import { expect, test } from '@rstest/core';
import { classNames, createClassNames, cx } from '../src/index';

// ── Basics (classnames-compatible) ────────────────────────────────

test('joins strings and numbers', () => {
  expect(classNames('a', 'b', 'c')).toBe('a b c');
  expect(classNames('a', 0, 1, 2)).toBe('a 0 1 2'); // 0 is kept
});

test('filters falsy values', () => {
  expect(classNames('a', null, undefined, false, '', 'b')).toBe('a b');
});

test('object: truthy keys only (0 is falsy in object values)', () => {
  expect(classNames({ a: true, b: false, c: 1, d: 0 })).toBe('a c');
});

test('nested arrays recursive', () => {
  expect(classNames('a', ['b', { c: true }, ['d', null]], 'e')).toBe(
    'a b c d e',
  );
});

test('Set values', () => {
  expect(classNames(new Set(['a', 'b']))).toBe('a b');
});

// ── Enhancement: lazily evaluated function values ─────────────────

test('function values evaluated lazily', () => {
  let calls = 0;
  const result = classNames({
    active: () => {
      calls++;
      return true;
    },
    hidden: () => false,
  });
  expect(result).toBe('active');
  expect(calls).toBe(1);
});

test('function values in arrays', () => {
  expect(classNames(['a', { b: () => true }, { c: () => false }])).toBe('a b');
});

// ── Enhancement: deduplication ────────────────────────────────────

test('duplicate class names deduplicated (order preserved)', () => {
  expect(classNames('a', 'b', 'a', 'c', 'b')).toBe('a b c');
});

test('dedup across nested structures', () => {
  expect(classNames('a', ['a', { b: true }], { a: true })).toBe('a b');
});

// ── Enhancement: factory (dedup toggle) ───────────────────────────

test('createClassNames: unique off keeps duplicates', () => {
  const join = createClassNames({ unique: false });
  expect(join('a', 'a')).toBe('a a');
});

test('cx alias equals classNames', () => {
  expect(cx('a', { b: true }, ['c'])).toBe(classNames('a', { b: true }, ['c']));
});

// ── Edge cases ────────────────────────────────────────────────────

test('empty input returns empty string', () => {
  expect(classNames()).toBe('');
  expect(classNames(null, undefined, false)).toBe('');
});

test('object key non-string values with truthy numbers', () => {
  expect(classNames({ a: 2, b: -1, c: 0.5 })).toBe('a b c');
});
