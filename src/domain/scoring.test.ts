import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoScoringEngine, evaluateDemoInput } from './scoring.ts';
import type { ScoringConfiguration } from './model.ts';
import { inputForMix } from './testFixtures.ts';

const config: ScoringConfiguration = {
  id: 'synthetic-test-v2', verificationStatus: 'UNVERIFIED', description: 'Synthetic tests only',
  targetParts: { a: 1, b: 1 }, idealIceUnits: 2, idealShakeDurationMs: 1000,
  preferredGarnishId: 'g', points: { balance: 60, ice: 20, shake: 15, garnish: 5 },
  thresholds: { balanced: 50, excellent: 80 },
};
const perfect = inputForMix({ a: 40, b: 40 });

test('history-based scoring is exact, deterministic and leaves input immutable', () => {
  const first = evaluateDemoInput(perfect, config);
  for (let i = 0; i < 20; i++) assert.deepEqual(evaluateDemoInput(perfect, config), first);
  assert.equal(first.score, 100);
  assert.equal(first.reactionTier, 'excellent');
  assert.equal(first.verificationStatus, 'UNVERIFIED');
  assert.equal(first.breakdown.reduce((sum, item) => sum + item.points, 0), first.score);
  assert.ok(Object.isFrozen(perfect.history));
});

test('empty history projection scores zero even with requested ideal extras', () => {
  const result = evaluateDemoInput(inputForMix({}), config);
  assert.equal(result.score, 0);
  assert.equal(result.reactionTier, 'unrated');
  assert.ok(result.breakdown.every((item) => item.points === 0));
});

test('unknown ingredients count in composition distance; scale is demo-invariant', () => {
  assert.equal(evaluateDemoInput(inputForMix({ unknown: 80 }), config).score, 40);
  assert.equal(evaluateDemoInput(inputForMix({ a: 4, b: 4 }), config).score, 100);
});

test('reaction boundaries are inclusive and exact integer contributions sum', () => {
  const balanceOnly = inputForMix({ a: 40, b: 40 }, 0, 0, null);
  assert.equal(evaluateDemoInput(balanceOnly, config).score, 60);
  assert.equal(evaluateDemoInput(balanceOnly, { ...config, thresholds: { balanced: 60, excellent: 80 } }).reactionTier, 'balanced');
  assert.equal(evaluateDemoInput(balanceOnly, { ...config, thresholds: { balanced: 10, excellent: 60 } }).reactionTier, 'excellent');
  assert.equal(evaluateDemoInput(inputForMix({ a: 80 }, 0, 0, null), config).reactionTier, 'rough');
});

test('invalid configurations and forged invalid history fail explicitly', () => {
  const badEvent = { type: 'IceAdded' as const, sequence: perfect.history.length, atMs: 999, requestedUnits: NaN };
  assert.throws(() => evaluateDemoInput({ ...perfect, history: [...perfect.history, badEvent] }, config), RangeError);
  assert.throws(() => createDemoScoringEngine({ ...config, targetParts: { a: 0 } }), RangeError);
  assert.throws(() => createDemoScoringEngine({ ...config, targetParts: { a: 0.5, b: 0.5 } }), RangeError);
  assert.throws(() => createDemoScoringEngine({ ...config, idealShakeDurationMs: 0 }), RangeError);
  assert.throws(() => createDemoScoringEngine({ ...config, thresholds: { balanced: 90, excellent: 10 } }), RangeError);
});

test('engine snapshots integer configuration and remains replaceable', () => {
  const parts = { a: 1, b: 1 };
  const engine = createDemoScoringEngine({ ...config, targetParts: parts });
  parts.a = 0; parts.b = 2;
  assert.equal(engine.evaluate(perfect).score, 100);
  const replacement = createDemoScoringEngine({ ...config, id: 'other-test', points: { balance: 10, ice: 10, shake: 10, garnish: 10 }, thresholds: { balanced: 10, excellent: 30 } });
  assert.equal(replacement.evaluate(perfect).score, 40);
  assert.equal(replacement.configurationId, 'other-test');
});

test('deterministic input grid stays bounded with consistent breakdowns', () => {
  for (const a of [0, 1, 40, 100]) for (const b of [0, 7, 40]) {
    for (const ice of [0, 1, 2, 8]) for (const duration of [0, 250, 1000, 3000]) {
      const input = inputForMix({ a, b }, ice, duration);
      const result = evaluateDemoInput(input, config);
      assert.ok(Number.isInteger(result.score) && result.score >= 0 && result.score <= result.maximum);
      assert.ok(result.breakdown.every((item) => item.points >= 0 && item.points <= item.maximum));
      assert.equal(result.score, result.breakdown.reduce((sum, item) => sum + item.points, 0));
      assert.deepEqual(result, evaluateDemoInput(input, config));
    }
  }
});

test('invented formula cannot be promoted by a dataset status label', () => {
  for (const verificationStatus of ['VERIFIED', 'STRONGLY_SUPPORTED'] as const) {
    assert.throws(() => createDemoScoringEngine({ ...config, verificationStatus }), RangeError);
  }
});

test('prototype-shaped IDs and unsafe point budgets cannot corrupt scores', () => {
  assert.equal(evaluateDemoInput(inputForMix({ constructor: 80 }), config).score, 40);
  assert.throws(() => createDemoScoringEngine({ ...config, points: { balance: Number.MAX_VALUE, ice: 0, shake: 0, garnish: 0 } }), RangeError);
});

test('large integer ratios use exact BigInt products and half-up rounding', () => {
  const quantities = { a: Number.MAX_SAFE_INTEGER - 1, b: 1 };
  assert.equal(evaluateDemoInput(inputForMix(quantities), { ...config, targetParts: quantities }).score, 100);
  const half = { ...config, points: { balance: 1, ice: 0, shake: 0, garnish: 0 }, thresholds: { balanced: 0, excellent: 1 } };
  assert.equal(evaluateDemoInput(inputForMix({ a: 1 }, 0, 0, null), half).score, 1);
});

test('stale derived view cannot override the authoritative history', () => {
  const forged = { ...perfect, projection: { ...perfect.projection, state: { ...perfect.projection.state,
    mix: { ...perfect.projection.state.mix, quantities: {} } } } };
  assert.equal(evaluateDemoInput(forged, config).score, 100);
});
