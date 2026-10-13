import test from 'node:test';
import assert from 'node:assert/strict';
import { observeReducedMotion } from './reducedMotion.ts';
test('motion preference publishes initial and changed values and detaches on cleanup', () => {
  const page = new EventTarget(); let matches = false;
  const preference = { get matches() { return matches; },
    addEventListener: (_: 'change', listener: () => void) => page.addEventListener('change', listener),
    removeEventListener: (_: 'change', listener: () => void) => page.removeEventListener('change', listener) };
  const values: boolean[] = [], cleanup = observeReducedMotion(preference, value => values.push(value));
  matches = true; page.dispatchEvent(new Event('change')); matches = false; page.dispatchEvent(new Event('change'));
  cleanup(); matches = true; page.dispatchEvent(new Event('change')); assert.deepEqual(values, [false,true,false]);
});
