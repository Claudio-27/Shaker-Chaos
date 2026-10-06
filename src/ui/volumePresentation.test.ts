import test from 'node:test';
import assert from 'node:assert/strict';
import { formatVolumeUnits } from './volumePresentation.ts';
import { volumeUnits } from '../domain/quantity.ts';
import { gameDependencies, gamePresentation } from '../application/bootstrap.ts';
import { inputForMix } from '../domain/testFixtures.ts';

// Synthetic display scales below test isolation; neither is a physical/reference mapping.
test('production presentation has no invented ml conversion', () => {
  assert.deepEqual(gamePresentation.volumeDisplay, { symbol: 'u' });
  assert.equal(formatVolumeUnits(volumeUnits(15), gamePresentation.volumeDisplay), '15');
});

test('alternate display scales cannot change canonical history, quantities or score', () => {
  const input = inputForMix({ orchard: 60, citrus: 30, soda: 30 }, 4, 6000, 'citrus-wheel');
  const before = JSON.stringify(input);
  const score = gameDependencies.scoringEngine.evaluate(input);
  assert.equal(formatVolumeUnits(volumeUnits(120), { symbol: 'test-A', scale: { numerator: 5, denominator: 4 } }), '150');
  assert.equal(formatVolumeUnits(volumeUnits(120), { symbol: 'test-B', scale: { numerator: 1, denominator: 2 } }), '60');
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(gameDependencies.scoringEngine.evaluate(input), score);
  assert.equal(score.score, 100);
});

test('invalid presentation mappings fail without entering domain state', () => {
  assert.throws(() => formatVolumeUnits(volumeUnits(1), { symbol: 'test', scale: { numerator: 1, denominator: 0 } }), RangeError);
  assert.throws(() => formatVolumeUnits(volumeUnits(1), { symbol: 'test', scale: { numerator: 0.5, denominator: 1 } }), RangeError);
});
