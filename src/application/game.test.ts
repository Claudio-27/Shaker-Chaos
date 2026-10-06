import test from 'node:test';
import assert from 'node:assert/strict';
import { gameDependencies } from './bootstrap.ts';
import { newGame, transitionGame } from './game.ts';
import type { GameDependencies } from './game.ts';
import type { CompatibilityInput, MixEventData } from '../domain/session.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import { emptyMix } from '../domain/mix.ts';
import { volumeUnits } from '../domain/quantity.ts';

function apply(data: readonly MixEventData[], deps: GameDependencies = gameDependencies) {
  return data.reduce((state, event, atMs) => transitionGame(state, { ...event, atMs }, deps), newGame(deps.mixingRules));
}
const pourEvents: readonly MixEventData[] = [
  { type: 'PourStarted', operationId: 0, ingredientId: 'orchard' },
  { type: 'PourTick', ingredientId: 'orchard', operationId: 0, requestedUnits: volumeUnits(60) },
  { type: 'PourEnded', operationId: 0, reason: 'completed' },
];

test('empty serving and unknown public content are ignored by the demo application', () => {
  const initial = newGame(gameDependencies.mixingRules);
  assert.equal(transitionGame(initial, { type: 'Served', atMs: 0 }, gameDependencies), initial);
  assert.equal(transitionGame(initial, { type: 'PourStarted', operationId: 0, ingredientId: 'missing', atMs: 0 }, gameDependencies), initial);
  assert.equal(transitionGame(initial, { type: 'GarnishChanged', garnishId: 'private/missing', atMs: 0 }, gameDependencies), initial);
});

test('complete demo still scores 100, locks after service and resets its current mix', () => {
  const served = apply([
    ...pourEvents,
    { type: 'PourStarted', operationId: 1, ingredientId: 'citrus' },
    { type: 'PourTick', ingredientId: 'citrus', operationId: 1, requestedUnits: volumeUnits(30) },
    { type: 'PourEnded', operationId: 1, reason: 'completed' },
    { type: 'PourStarted', operationId: 2, ingredientId: 'soda' },
    { type: 'PourTick', ingredientId: 'soda', operationId: 2, requestedUnits: volumeUnits(30) },
    { type: 'PourEnded', operationId: 2, reason: 'completed' },
    { type: 'IceAdded', requestedUnits: 4 },
    { type: 'ShakeStarted', operationId: 3 },
    { type: 'ShakeTick', operationId: 3, durationMs: 6000 },
    { type: 'ShakeEnded', operationId: 3, reason: 'completed' },
    { type: 'GarnishChanged', garnishId: 'citrus-wheel' },
    { type: 'Served' },
  ]);
  assert.equal(served.view.phase, 'served');
  assert.equal(served.result?.score, 100);
  assert.equal(served.result?.verificationStatus, 'UNVERIFIED');
  assert.equal(transitionGame(served, { type: 'Served', atMs: 999 }, gameDependencies), served);
  const reset = transitionGame(served, { type: 'Reset', atMs: 1000 }, gameDependencies);
  assert.deepEqual(reset.view.mix, emptyMix());
  assert.equal(reset.result, null);
  assert.deepEqual(createCompatibilityInput(reset.session).currentAttemptHistory, []);
  assert.deepEqual(reset.session.history.slice(0, -1), served.session.history);
});

test('a substitute scorer can distinguish equal totals by the supplied canonical history', () => {
  const received: CompatibilityInput[] = [];
  const deps: GameDependencies = { ...gameDependencies, scoringEngine: {
    configurationId: 'history-test', verificationStatus: 'UNVERIFIED',
    evaluate: (input) => {
      received.push(input);
      return { score: input.currentAttemptHistory[0]?.type === 'IceAdded' ? 7 : 3,
        maximum: 7, reactionTier: 'excellent', breakdown: [], configurationId: 'history-test', verificationStatus: 'UNVERIFIED' };
    },
  } };
  const first = apply([{ type: 'IceAdded', requestedUnits: 1 }, ...pourEvents, { type: 'Served' }], deps);
  const second = apply([...pourEvents, { type: 'IceAdded', requestedUnits: 1 }, { type: 'Served' }], deps);
  assert.deepEqual(first.view.mix, second.view.mix);
  assert.equal(first.result?.score, 7);
  assert.equal(second.result?.score, 3);
  assert.notDeepEqual(received[0]?.history, received[1]?.history);
  assert.equal(received[0]?.history.at(-1)?.type, 'Served');
});

test('serve closes every active operation in chronological start order', () => {
  const served = apply([
    { type: 'PourStarted', operationId: 30, ingredientId: 'orchard' },
    { type: 'PourTick', ingredientId: 'orchard', operationId: 30, requestedUnits: volumeUnits(15) },
    { type: 'ShakeStarted', operationId: 10 }, { type: 'ShakeTick', operationId: 10, durationMs: 100 },
    { type: 'Served' },
  ]);
  assert.deepEqual(served.session.history.slice(-3).map((event) => event.type), ['PourEnded', 'ShakeEnded', 'Served']);
  assert.equal(served.view.pours[0]?.endReason, 'served');
  assert.equal(served.view.shakes[0]?.endReason, 'served');
  assert.equal(served.view.pours[0]?.elapsedMs, 4);
});

test('reset records active-operation endings and rejects stale ticks from previous holds', () => {
  const reset = apply([
    { type: 'PourStarted', operationId: 0, ingredientId: 'orchard' },
    { type: 'PourTick', ingredientId: 'orchard', operationId: 0, requestedUnits: volumeUnits(15) }, { type: 'Reset' },
  ]);
  assert.deepEqual(reset.view.mix, emptyMix());
  assert.deepEqual(reset.session.history.map((event) => event.type), ['PourStarted', 'PourTick', 'PourEnded', 'Reset']);
  const ending = reset.session.history[2];
  assert.equal(ending?.type === 'PourEnded' ? ending.reason : null, 'reset');
  assert.equal(transitionGame(reset, { type: 'PourTick', ingredientId: 'orchard', operationId: 0, requestedUnits: volumeUnits(15), atMs: 3 }, gameDependencies), reset);
  const next = transitionGame(reset, { type: 'PourStarted', operationId: 1, ingredientId: 'soda', atMs: 3 }, gameDependencies);
  const ticked = transitionGame(next, { type: 'PourTick', ingredientId: 'soda', operationId: 1, requestedUnits: volumeUnits(15), atMs: 3 }, gameDependencies);
  assert.deepEqual(ticked.view.mix.quantities, { soda: 15 });
});

test('the application cached view always equals an independent history replay', () => {
  const state = apply([...pourEvents, { type: 'IceAdded', requestedUnits: 2 }]);
  assert.deepEqual(state.view, createCompatibilityInput(state.session).projection.state);
});

