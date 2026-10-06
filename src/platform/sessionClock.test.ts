import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionClock } from './sessionClock.ts';

test('clock adapter emits monotonic integer times despite fractional readings or backwards jitter', () => {
  const readings = [100.5, 100.7, 101.8, 99, 103.4];
  const clock = createSessionClock(() => readings.shift() ?? NaN);
  assert.deepEqual([clock(), clock(), clock(), clock()], [0, 1, 1, 2]);
});

test('invalid clock readings cannot introduce NaN event timestamps', () => {
  assert.throws(() => createSessionClock(() => NaN), RangeError);
  let reading = 0;
  const clock = createSessionClock(() => reading);
  reading = Infinity;
  assert.throws(() => clock(), RangeError);
});
