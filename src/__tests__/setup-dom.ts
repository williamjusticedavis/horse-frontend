/**
 * Preload 1/2 — must run before any @testing-library import.
 *
 * ES module imports are hoisted, so if setup.ts imported @testing-library/react
 * at the top, screen.js would evaluate before the Object.defineProperty calls
 * here could run. Running this in a separate preload that Bun executes first
 * guarantees the globals exist before screen.js is ever evaluated.
 */
import { Window } from 'happy-dom'

const happyWindow = new Window({ url: 'http://localhost:3000/' })

const BROWSER_GLOBALS: Array<keyof typeof happyWindow> = [
  'window',
  'document',
  'navigator',
  'location',
  'history',
  'screen',
  'Node',
  'Element',
  'DocumentFragment',
  'Document',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLButtonElement',
  'HTMLFormElement',
  'HTMLSelectElement',
  'HTMLTextAreaElement',
  'HTMLAnchorElement',
  'HTMLDivElement',
  'HTMLSpanElement',
  'HTMLLabelElement',
  'SVGElement',
  'Text',
  'Comment',
  'Range',
  'NodeList',
  'Event',
  'CustomEvent',
  'MouseEvent',
  'KeyboardEvent',
  'FocusEvent',
  'InputEvent',
  'PointerEvent',
  'UIEvent',
  'MutationObserver',
  'ResizeObserver',
  'IntersectionObserver',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'matchMedia',
  'DOMParser',
  'XMLSerializer',
]

for (const key of BROWSER_GLOBALS) {
  const value = happyWindow[key]
  if (value !== undefined) {
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true })
  }
}

// happy-dom v20 doesn't put JS error constructors on the Window object, but its
// own internal code (e.g. SelectorParser) accesses them via `this.window.SyntaxError`.
// Patch them back so querySelectorAll and similar APIs work correctly.
const win = happyWindow as unknown as Record<string, unknown>
for (const name of [
  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
]) {
  if (win[name] === undefined) {
    win[name] = globalThis[name as keyof typeof globalThis]
  }
}

;(globalThis as Record<string, unknown>).window = globalThis
