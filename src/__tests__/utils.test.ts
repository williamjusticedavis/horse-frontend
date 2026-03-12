import { describe, expect, test } from 'bun:test'
import { cn } from '../lib/utils'

describe('cn (class name utility)', () => {
  test('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  test('ignores falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  test('resolves conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  test('supports conditional objects', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  test('supports array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  test('handles empty input', () => {
    expect(cn()).toBe('')
  })
})
