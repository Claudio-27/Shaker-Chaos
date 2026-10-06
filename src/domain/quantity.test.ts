import test from 'node:test';
import assert from 'node:assert/strict';
import { addVolumeUnits, volumeUnits } from './quantity.ts';

test('canonical units accept only non-negative safe integers', () => {
  for (const value of [0, 1, 15, Number.MAX_SAFE_INTEGER]) assert.equal(volumeUnits(value), value);
  for (const value of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => volumeUnits(value), RangeError);
  }
});

test('canonical addition is exact and rejects overflow rather than rounding', () => {
  assert.equal(addVolumeUnits(volumeUnits(Number.MAX_SAFE_INTEGER - 1), volumeUnits(1)), Number.MAX_SAFE_INTEGER);
  assert.throws(() => addVolumeUnits(volumeUnits(Number.MAX_SAFE_INTEGER), volumeUnits(1)), RangeError);
});
