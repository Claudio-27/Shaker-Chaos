import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyMix, totalVolumeUnits } from './mix.ts';
import { appendMixEvent, createCompatibilityInput, newSession, replayMixEvents } from './session.ts';
import type { CocktailSession, MixEvent, MixEventData } from './session.ts';
import { volumeUnits } from './quantity.ts';
import type { VolumeUnit } from './quantity.ts';
import { sessionFrom, syntheticRules } from './testFixtures.ts';

function recorded(data: readonly MixEventData[], sameTime = false) {
  return sessionFrom(data.map((item, index) => ({ data: item, atMs: sameTime ? 0 : index })));
}
const simplePour: readonly MixEventData[] = [
  { type: 'PourStarted', operationId: 0, ingredientId: 'a' },
  { type: 'PourTick', ingredientId: 'a', operationId: 0, requestedUnits: volumeUnits(10) },
  { type: 'PourEnded', operationId: 0, reason: 'completed' },
];

test('replaying the same frozen history yields exactly the same derived state', () => {
  const session = recorded([...simplePour, { type: 'IceAdded', requestedUnits: 2 }, { type: 'GarnishChanged', garnishId: 'g' }]);
  const expected = createCompatibilityInput(session).projection.state;
  for (let i = 0; i < 20; i++) assert.deepEqual(replayMixEvents(session.history, session.rules), expected);
  assert.deepEqual(expected.mix, { quantities: { a: 10 }, iceUnits: 2, shakeDurationMs: 0, garnishId: 'g' });
  assert.ok(Object.isFrozen(expected.mix.quantities));
});

test('equal timestamps keep exact array order; capacity makes that order observable', () => {
  const a: MixEventData[] = [
    { type: 'PourStarted', operationId: 0, ingredientId: 'a' }, { type: 'PourTick', ingredientId: 'a', operationId: 0, requestedUnits: volumeUnits(80) },
    { type: 'PourStarted', operationId: 1, ingredientId: 'b' }, { type: 'PourTick', ingredientId: 'b', operationId: 1, requestedUnits: volumeUnits(80) },
  ];
  const rules = { ...syntheticRules, capacityUnits: volumeUnits(100) };
  const first = sessionFrom(a.map((data) => ({ data, atMs: 0 })), rules);
  const second = sessionFrom([a[2]!, a[3]!, a[0]!, a[1]!].map((data) => ({ data, atMs: 0 })), rules);
  assert.deepEqual(createCompatibilityInput(first).projection.state.mix.quantities, { a: 80, b: 20 });
  assert.deepEqual(createCompatibilityInput(second).projection.state.mix.quantities, { b: 80, a: 20 });
  assert.deepEqual(first.history.map((event) => event.sequence), [0, 1, 2, 3]);
});

test('two equal final mixes retain distinct ice timing and chronological evidence', () => {
  const ice: MixEventData = { type: 'IceAdded', requestedUnits: 1 };
  const before = createCompatibilityInput(recorded([ice, ...simplePour]));
  const after = createCompatibilityInput(recorded([...simplePour, ice]));
  assert.deepEqual(before.projection.state.mix, after.projection.state.mix);
  assert.notDeepEqual(before.history, after.history);
  assert.equal(before.history[0]?.type, 'IceAdded');
  assert.equal(after.history[0]?.type, 'PourStarted');
});

test('one pour with two ticks and two separate pours are distinguishable at equal totals', () => {
  const one = recorded([simplePour[0]!, simplePour[1]!, simplePour[1]!, simplePour[2]!]);
  const two = recorded([...simplePour,
    { type: 'PourStarted', operationId: 1, ingredientId: 'a' },
    { type: 'PourTick', ingredientId: 'a', operationId: 1, requestedUnits: volumeUnits(10) },
    { type: 'PourEnded', operationId: 1, reason: 'completed' },
  ]);
  const oneInput = createCompatibilityInput(one), twoInput = createCompatibilityInput(two);
  assert.deepEqual(oneInput.projection.state.mix, twoInput.projection.state.mix);
  assert.equal(oneInput.projection.state.pours.length, 1);
  assert.equal(twoInput.projection.state.pours.length, 2);
  assert.equal(oneInput.projection.state.pours[0]?.ticks.length, 2);
  assert.notDeepEqual(oneInput.history, twoInput.history);
});

test('clamped or zero-added ticks preserve their full integer requested quantities', () => {
  const session = sessionFrom([
    { data: simplePour[0]!, atMs: 0 },
    { data: { type: 'PourTick', ingredientId: 'a', operationId: 0, requestedUnits: volumeUnits(150) }, atMs: 2 },
    { data: { type: 'PourTick', ingredientId: 'a', operationId: 0, requestedUnits: volumeUnits(15) }, atMs: 4 },
    { data: simplePour[2]!, atMs: 7 },
  ], { ...syntheticRules, capacityUnits: volumeUnits(100) });
  const state = createCompatibilityInput(session).projection.state;
  assert.equal(totalVolumeUnits(state.mix), 100);
  assert.deepEqual(state.pours[0]?.ticks.map((tick) => [tick.requestedUnits, tick.addedUnits]), [[150, 100], [15, 0]]);
  assert.equal(state.pours[0]?.elapsedMs, 7);
  assert.ok(Object.values(state.mix.quantities).every(Number.isSafeInteger));
});

test('shake count, each elapsed duration, ticks and cumulative credit remain separate', () => {
  const session = sessionFrom([
    { data: simplePour[0]!, atMs: 0 }, { data: simplePour[1]!, atMs: 1 }, { data: simplePour[2]!, atMs: 2 },
    { data: { type: 'ShakeStarted', operationId: 1 }, atMs: 10 },
    { data: { type: 'ShakeTick', operationId: 1, durationMs: 100 }, atMs: 10 },
    { data: { type: 'ShakeTick', operationId: 1, durationMs: 100 }, atMs: 11 },
    { data: { type: 'IceAdded', requestedUnits: 2 }, atMs: 12 },
    { data: { type: 'GarnishChanged', garnishId: 'g' }, atMs: 13 },
    { data: { type: 'ShakeEnded', operationId: 1, reason: 'completed' }, atMs: 20 },
    { data: { type: 'ShakeStarted', operationId: 2 }, atMs: 25 },
    { data: { type: 'ShakeTick', operationId: 2, durationMs: 100 }, atMs: 25 },
    { data: { type: 'ShakeEnded', operationId: 2, reason: 'cancelled' }, atMs: 29 },
    { data: { type: 'Served' }, atMs: 30 },
  ]);
  const state = createCompatibilityInput(session).projection.state;
  assert.equal(state.shakes.length, 2);
  assert.deepEqual(state.shakes.map((item) => [item.elapsedMs, item.requestedDurationMs]), [[10, 200], [4, 100]]);
  assert.equal(state.mix.shakeDurationMs, 300);
  assert.equal(state.shakes[1]?.endReason, 'cancelled');
  assert.equal(state.phase, 'served');
  assert.equal(replayMixEvents(session.history.slice(0, 4), session.rules).phase, 'shaking');
  assert.equal(replayMixEvents(session.history.slice(0, 9), session.rules).phase, 'mixing');
});

test('ignored empty shakes and saturated shake credit remain present in the history', () => {
  const session = sessionFrom([
    { data: { type: 'ShakeStarted', operationId: 9 }, atMs: 0 },
    { data: { type: 'ShakeTick', operationId: 9, durationMs: 900 }, atMs: 1 },
    ...simplePour.map((data, index) => ({ data, atMs: index + 2 })),
    { data: { type: 'ShakeTick', operationId: 9, durationMs: 900 }, atMs: 5 },
    { data: { type: 'ShakeEnded', operationId: 9, reason: 'limit' }, atMs: 6 },
  ], { ...syntheticRules, maximumShakeDurationMs: 500 });
  const state = createCompatibilityInput(session).projection.state;
  assert.equal(state.mix.shakeDurationMs, 500);
  assert.equal(state.shakes[0]?.requestedDurationMs, 1800);
  assert.equal(state.shakes[0]?.appliedDurationMs, 500);
  assert.equal(state.shakes[0]?.ticks.length, 2);
});

test('overlapping operations and post-service facts are not forbidden by the canonical history', () => {
  let session = recorded([simplePour[0]!, { type: 'ShakeStarted', operationId: 1 }], true);
  assert.equal(createCompatibilityInput(session).projection.state.phase, 'pouring-and-shaking');
  session = appendMixEvent(session, { type: 'Served' }, 0);
  session = appendMixEvent(session, simplePour[1]!, 1);
  assert.equal(totalVolumeUnits(createCompatibilityInput(session).projection.state.mix), 10);
  assert.equal(session.history.at(-1)?.type, 'PourTick');
});

test('reset makes a clean current attempt without erasing the previous chronological history', () => {
  const before = recorded([...simplePour, { type: 'Served' }]);
  const reset = appendMixEvent(before, { type: 'Reset' }, 4);
  const input = createCompatibilityInput(reset);
  assert.deepEqual(input.projection.state.mix, emptyMix());
  assert.equal(input.projection.state.phase, 'mixing');
  assert.deepEqual(input.projection.state.pours, []);
  assert.deepEqual(input.currentAttemptHistory, []);
  assert.equal(input.history.length, before.history.length + 1);
  assert.deepEqual(input.history.slice(0, -1), before.history);
  assert.deepEqual(createCompatibilityInput(reset), input);
  const again = appendMixEvent(reset, { type: 'Reset' }, 4);
  assert.deepEqual(createCompatibilityInput(again).projection.state.mix, emptyMix());
});

test('malformed sequences, decreasing times, fractional facts and invalid operation references fail', () => {
  const session = recorded(simplePour);
  assert.throws(() => replayMixEvents([...session.history].reverse(), session.rules), RangeError);
  assert.throws(() => appendMixEvent(session, { type: 'IceAdded', requestedUnits: 1 }, 1), RangeError);
  assert.throws(() => appendMixEvent(session, { type: 'IceAdded', requestedUnits: 0.5 }, 3), RangeError);
  assert.throws(() => appendMixEvent(session, { type: 'Reset' }, 3.5), RangeError);
  assert.throws(() => appendMixEvent(session, { type: 'PourTick', ingredientId: 'a', operationId: 0, requestedUnits: volumeUnits(1) }, 3), RangeError);
  const open = recorded([simplePour[0]!]);
  assert.throws(() => appendMixEvent(open, { type: 'PourTick', ingredientId: 'a', operationId: 0, requestedUnits: 0.5 as VolumeUnit }, 1), RangeError);
  assert.throws(() => appendMixEvent(open, { type: 'ShakeTick', operationId: 0, durationMs: 1 }, 1), RangeError);
  assert.throws(() => appendMixEvent(session, simplePour[0]!, 3), RangeError);
});

test('session snapshots isolate rule and event mutations and freeze chronological records', () => {
  const rules = { ...syntheticRules, capacityUnits: volumeUnits(20) };
  let session = newSession(rules);
  rules.capacityUnits = volumeUnits(100);
  session = appendMixEvent(session, simplePour[0]!, 0);
  const data = { type: 'PourTick' as const, ingredientId: 'a', operationId: 0, requestedUnits: volumeUnits(30) };
  session = appendMixEvent(session, data, 1);
  data.requestedUnits = volumeUnits(99);
  assert.equal(totalVolumeUnits(createCompatibilityInput(session).projection.state.mix), 20);
  assert.equal((session.history[1] as Extract<MixEvent, { type: 'PourTick' }>).requestedUnits, 30);
  assert.throws(() => Object.assign(session.history[0]!, { ingredientId: 'b' }), TypeError);
});

test('canonical numeric history survives a JSON round-trip with exactly the same replay', () => {
  const session = recorded(simplePour);
  const restored = JSON.parse(JSON.stringify(session)) as CocktailSession;
  assert.deepEqual(createCompatibilityInput(restored), createCompatibilityInput(session));
});


test('ingredient identity is retained per tick even if it changes during one pour operation', () => {
  const session = recorded([
    simplePour[0]!, simplePour[1]!,
    { type: 'PourTick', ingredientId: 'b', operationId: 0, requestedUnits: volumeUnits(10) }, simplePour[2]!,
  ]);
  const state = createCompatibilityInput(session).projection.state;
  assert.deepEqual(state.mix.quantities, { a: 10, b: 10 });
  assert.equal(state.pours.length, 1);
  assert.deepEqual(state.pours[0]?.ticks.map((tick) => tick.ingredientId), ['a', 'b']);
});


test('shake credit stays exact at the safe integer boundary without intermediate overflow', () => {
  const maximum = Number.MAX_SAFE_INTEGER;
  const session = recorded([
    ...simplePour,
    { type: 'ShakeStarted', operationId: 1 },
    { type: 'ShakeTick', operationId: 1, durationMs: maximum - 1 },
    { type: 'ShakeTick', operationId: 1, durationMs: 1 },
    { type: 'ShakeEnded', operationId: 1, reason: 'limit' },
  ]);
  const state = replayMixEvents(session.history, { ...session.rules, maximumShakeDurationMs: maximum });
  assert.equal(state.mix.shakeDurationMs, maximum);
  assert.equal(state.shakes[0]?.requestedDurationMs, maximum);
  assert.equal(state.shakes[0]?.appliedDurationMs, maximum);
});