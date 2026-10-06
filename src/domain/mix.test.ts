import test from 'node:test';
import assert from 'node:assert/strict';
import { addIce, emptyMix, pour, shake, totalVolumeUnits } from './mix.ts';
import { volumeUnits } from './quantity.ts';
import type { VolumeUnit } from './quantity.ts';
import type { MixingRules } from './model.ts';

const rules: MixingRules = { capacityUnits: volumeUnits(100), maximumIceUnits: 3, maximumShakeDurationMs: 500 };

test('pour preserves inputs and clamps precisely at an integer demo capacity', () => {
  const initial = Object.freeze({ ...emptyMix(), quantities: Object.freeze({ a: volumeUnits(90) }) });
  const result = pour(initial, 'b', volumeUnits(25), rules);
  assert.deepEqual(result.quantities, { a: 90, b: 10 });
  assert.equal(totalVolumeUnits(result), 100);
  assert.deepEqual(initial.quantities, { a: 90 });
  assert.equal(pour(result, 'a', volumeUnits(10), rules), result);
});

test('ice and shake obey independent integer demo limits', () => {
  assert.equal(shake(emptyMix(), 100, rules).shakeDurationMs, 0);
  let mix = pour(emptyMix(), 'a', volumeUnits(50), rules);
  mix = addIce(mix, 10, rules);
  mix = shake(mix, 999, rules);
  assert.equal(mix.iceUnits, 3);
  assert.equal(mix.shakeDurationMs, 500);
  assert.equal(totalVolumeUnits(mix), 50);
});

test('malformed runtime values and rules cannot introduce fractional canonical state', () => {
  for (const value of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => pour(emptyMix(), 'a', value as VolumeUnit, rules), RangeError);
    assert.throws(() => addIce(emptyMix(), value, rules), RangeError);
    assert.throws(() => shake(emptyMix(), value, rules), RangeError);
  }
  assert.throws(() => pour(emptyMix(), '', volumeUnits(1), rules), RangeError);
  assert.throws(() => pour(emptyMix(), 'a', volumeUnits(1), { ...rules, capacityUnits: volumeUnits(0) }), RangeError);
  assert.throws(() => totalVolumeUnits({ ...emptyMix(), quantities: { a: Infinity as VolumeUnit } }), RangeError);
});

test('string IDs never read inherited object properties as quantities', () => {
  const mix = pour(emptyMix(), 'constructor', volumeUnits(15), rules);
  assert.equal(mix.quantities.constructor, 15);
  assert.equal(totalVolumeUnits(pour(mix, '__proto__', volumeUnits(15), rules)), 30);
});
