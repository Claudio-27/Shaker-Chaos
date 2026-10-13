import test from 'node:test';
import assert from 'node:assert/strict';
import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import type { ClassicGameAction } from '../application/classicGame.ts';
import { gameDependencies } from '../application/productionBootstrap.ts';
import { createResetGuard, gameplayPresentation, shakeRisk } from './gameplayPresentation.ts';
const profile = gameDependencies.profile;
function round() {
  let state = newClassicGame(gameDependencies);
  return { get state() { return state; }, get ui() { return gameplayPresentation(state, profile, true); },
    send(action: ClassicGameAction) { state = transitionClassicGame(state, action, gameDependencies); } };
}
function liquid(g: ReturnType<typeof round>) {
  g.send({ type: 'PourStarted', ingredientId: 'orchard', operationId: 0, atMs: 0 });
  g.send({ type: 'PourEnded', operationId: 0, reason: 'completed', atMs: 1050 });
}
test('control availability follows accepted mixing, holding, serving and terminal phases', () => {
  const g = round();
  assert.deepEqual(g.ui.controls, { ingredient: true, pour: true, shake: false, ice: true, garnish: false, serve: false, reset: false });
  assert.equal(gameplayPresentation(g.state, profile, false).controls.pour, false);
  g.send({ type: 'PourStarted', ingredientId: 'orchard', operationId: 0, atMs: 0 });
  assert.equal(g.ui.controls.ingredient, false); assert.equal(g.ui.controls.shake, false);
  g.send({ type: 'PourEnded', operationId: 0, reason: 'completed', atMs: 1050 });
  assert.equal(g.ui.controls.shake, true); assert.equal(g.ui.controls.serve, false);
  g.send({ type: 'ShakeStarted', operationId: 1, atMs: 1050 });
  assert.equal(g.ui.phase, 'shake'); assert.equal(g.ui.controls.pour, false); assert.equal(g.ui.controls.ice, false);
  assert.equal(g.ui.controls.garnish, false); assert.equal(g.ui.controls.serve, false);
  g.send({ type: 'ShakeEnded', operationId: 1, reason: 'completed', atMs: 1150 });
  assert.equal(g.ui.phase, 'serve'); assert.equal(g.ui.controls.garnish, true); assert.equal(g.ui.controls.serve, true);
  g.send({ type: 'GarnishChanged', garnishId: profile.garnish.id, atMs: 1150 });
  assert.equal(g.ui.controls.garnish, false);
  g.send({ type: 'Served', atMs: 1150 });
  assert.equal(g.ui.phase, 'result');
  for (const [control, enabled] of Object.entries(g.ui.controls)) assert.equal(enabled, control === 'reset');
});
test('Ice maximum is unavailable and a further request preserves canonical count/history', () => {
  const g = round(); liquid(g);
  for (let n = 0; n < 2; n++) { assert.equal(g.ui.controls.ice, true); g.send({ type: 'IceAdded', requestedUnits: 1, atMs: 1050 }); }
  assert.equal(g.ui.controls.ice, false); const before = g.state;
  g.send({ type: 'IceAdded', requestedUnits: 1, atMs: 1050 });
  assert.equal(g.state.session.history, before.session.history); assert.equal(g.state.view.derived.mix.iceUnits, 2);
});
test('Pour preparation persists until a canonical productive tick, and full capacity locks Pour', () => {
  const g = round(); g.send({ type: 'PourStarted', ingredientId: 'orchard', operationId: 0, atMs: 0 });
  for (const atMs of [0, 799, 800, 924]) {
    g.send({ type: 'HoldAdvanced', operationId: 0, atMs }); assert.equal(g.ui.pourFeedback, 'preparing');
    assert.deepEqual(g.state.view.derived.mix.quantities, {});
  }
  g.send({ type: 'HoldAdvanced', operationId: 0, atMs: 925 }); assert.equal(g.ui.pourFeedback, 'pouring');
  assert.equal(g.state.view.derived.mix.quantities.orchard, 3);
  g.send({ type: 'HoldAdvanced', operationId: 0, atMs: 10800 });
  assert.equal(g.ui.pourFeedback, 'idle'); assert.equal(g.ui.controls.pour, false);
});
test('risk escalates from canonical count or cumulative duration using profile thresholds', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(count => shakeRisk(count, 0, profile)), ['safe','safe','safe','warming','risky','danger']);
  assert.deepEqual([2999, 3000, 3999, 4000, 5999, 6000].map(ms => shakeRisk(1, ms, profile)), ['safe','warming','warming','risky','risky','danger']);
  const different = { ...profile, shake: { ...profile.shake, failureCount: 8, warningDurationMs: 9000 } };
  assert.equal(shakeRisk(5, 0, different), 'warming'); assert.equal(shakeRisk(1, 9000, different), 'danger');
});
test('both failure paths lock every preparation control immediately', () => {
  for (const cause of ['count', 'duration']) {
    const g = round(); liquid(g);
    if (cause === 'count') for (let n = 0; n < 5; n++) {
      g.send({ type: 'ShakeStarted', operationId: n + 1, atMs: 1050 + n });
      g.send({ type: 'ShakeEnded', operationId: n + 1, reason: 'completed', atMs: 1051 + n });
    }
    g.send({ type: 'ShakeStarted', operationId: 6, atMs: 1060 });
    if (cause === 'duration') g.send({ type: 'HoldAdvanced', operationId: 6, atMs: 9060 });
    assert.equal(g.state.result?.totalScore, 0); assert.equal(g.ui.terminal, true);
    for (const [control, enabled] of Object.entries(g.ui.controls)) assert.equal(enabled, control === 'reset');
  }
});
test('reset guard rejects a click burst and the clean next attempt remains unavailable', () => {
  const guard = createResetGuard(), g = round(); liquid(g);
  assert.equal(guard.request(g.ui.controls.reset), true); assert.equal(guard.request(true), false);
  g.send({ type: 'Reset', atMs: 1050 }); guard.settled();
  assert.equal(guard.request(g.ui.controls.reset), false); assert.equal(g.ui.phase, 'mix');
  assert.equal(g.ui.risk, 'safe'); assert.equal(g.ui.pourFeedback, 'idle'); assert.equal(g.state.result, null);
});
