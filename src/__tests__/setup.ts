/**
 * Preload 2/2 — jest-dom matchers + per-test cleanup.
 * DOM globals are already registered by setup-dom.ts (preload 1).
 */
import '@testing-library/jest-dom'
import { afterEach } from 'bun:test'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
