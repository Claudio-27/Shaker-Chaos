import test from 'node:test';
import assert from 'node:assert/strict';
import { gameDependencies } from './productionBootstrap.ts';
import { newClassicGame, transitionClassicGame } from './classicGame.ts';
import type { ClassicGameAction, ClassicGameDependencies } from './classicGame.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import { replayClassicHistory } from '../domain/classicSession.ts';
import { createClassicInspiredScoringEngine } from '../domain/classicScoring.ts';
import { productivePourSteps, validateClassicProfile } from '../domain/classicProfile.ts';
import { emptyMix, totalVolumeUnits } from '../domain/mix.ts';
import { formatVolumeUnits } from '../ui/volumePresentation.ts';
import { volumeUnits } from '../domain/quantity.ts';

function game(deps: ClassicGameDependencies = gameDependencies) {
  let state = newClassicGame(deps), time = 0, id = 0;
  const dispatch = (action: Omit<ClassicGameAction, 'atMs'>) => {
    state = transitionClassicGame(state, { ...action, atMs: time } as ClassicGameAction, deps);
  };
  return {
    get state() { return state; }, get time() { return time; },
    advance(ms: number) { time += ms; },
    send(action: ClassicGameAction) { time = action.atMs; state = transitionClassicGame(state, action, deps); },
    pour(duration: number, ingredientId = 'orchard') {
      const operationId = id++; dispatch({ type: 'PourStarted', operationId, ingredientId } as ClassicGameAction);
      time += duration; dispatch({ type: 'PourEnded', operationId, reason: 'completed' } as ClassicGameAction);
    },
    shake(duration: number) {
      const operationId = id++; dispatch({ type: 'ShakeStarted', operationId } as ClassicGameAction);
      time += duration; dispatch({ type: 'ShakeEnded', operationId, reason: 'completed' } as ClassicGameAction);
    },
    ice() { dispatch({ type: 'IceAdded', requestedUnits: 1 } as ClassicGameAction); },
    garnish() { dispatch({ type: 'GarnishChanged', garnishId: deps.profile.garnish.id } as ClassicGameAction); },
    serve() { dispatch({ type: 'Served' }); },
    reset() { dispatch({ type: 'Reset' }); },
    score() { return deps.scoringEngine.evaluate(createCompatibilityInput(state.session)); },
  };
}
test('production pour boundaries include startup and release tail with integer quantities', () => {
  for (const [ms, units] of [[0, 0], [799, 0], [800, 0], [924, 0], [925, 3], [1050, 6]]) {
    const g = game(); g.pour(ms!);
    assert.equal(totalVolumeUnits(g.state.view.derived.mix), units);
    assert.ok(Object.values(g.state.view.derived.mix.quantities).every(Number.isSafeInteger));
    assert.equal(g.state.view.derived.pours[0]?.elapsedMs, ms);
  }
});
test('every segmented pour pays its own startup and retains distinct histories', () => {
  const long = game(), split = game();
  long.pour(2100); split.pour(1050); split.pour(1050);
  assert.equal(totalVolumeUnits(long.state.view.derived.mix), 30);
  assert.equal(totalVolumeUnits(split.state.view.derived.mix), 12);
  assert.equal(split.state.view.derived.pours.length, 2);
});
test('full uninterrupted fill takes 10800ms, clamps and closes at capacity', () => {
  const g = game(); g.pour(10799);
  assert.equal(totalVolumeUnits(g.state.view.derived.mix), 237);
  const full = game(); full.pour(20000);
  assert.equal(totalVolumeUnits(full.state.view.derived.mix), 240);
  assert.equal(full.state.view.derived.pours[0]?.elapsedMs, 10800);
  assert.equal(full.state.view.derived.pours[0]?.endReason, 'limit');
  full.pour(1050, 'soda'); assert.equal(totalVolumeUnits(full.state.view.derived.mix), 240);
});
test('60Hz, 120Hz and delayed sampling produce identical canonical Pour histories', () => {
  const play = (cadence: number) => {
    const g = game();
    g.send({ type: 'PourStarted', operationId: 0, ingredientId: 'orchard', atMs: 0 });
    for (let frame = 1; Math.floor(frame * cadence) < 2387; frame++) {
      g.send({ type: 'HoldAdvanced', operationId: 0, atMs: Math.floor(frame * cadence) });
    }
    g.send({ type: 'PourEnded', operationId: 0, reason: 'completed', atMs: 2387 }); return g.state;
  };
  const slow = play(1000 / 60), fast = play(1000 / 120), delayed = play(2000);
  assert.deepEqual(slow.session.history, fast.session.history);
  assert.deepEqual(slow, delayed);
});
test('an Ice click flushes elapsed Pour before its canonical event, preserving order', () => {
  const g = game();
  g.send({ type: 'PourStarted', operationId: 0, ingredientId: 'orchard', atMs: 0 });
  g.send({ type: 'IceAdded', requestedUnits: 1, atMs: 1050 });
  g.send({ type: 'PourEnded', operationId: 0, reason: 'completed', atMs: 1175 });
  assert.deepEqual(g.state.session.history.map(e => [e.type, e.atMs]),
    [['PourStarted', 0], ['PourTick', 925], ['PourTick', 1050], ['IceAdded', 1050], ['PourTick', 1175], ['PourEnded', 1175]]);
});
test('canonical history replay derives exactly the application state and rejects corrupt chronology', () => {
  const g = game(); g.pour(3300); g.ice(); g.shake(200); g.garnish(); g.serve();
  assert.deepEqual(replayClassicHistory(g.state.session.history, gameDependencies.profile), g.state.view);
  assert.deepEqual(replayClassicHistory(g.state.session.history, gameDependencies.profile),
    replayClassicHistory(g.state.session.history, gameDependencies.profile));
  const reversed = [...g.state.session.history].reverse();
  assert.throws(() => replayClassicHistory(reversed, gameDependencies.profile), RangeError);
});
test('equal ingredient totals preserve distinguishable domain action sequences', () => {
  const a = game(), b = game(); a.pour(1050); b.pour(925); b.pour(925);
  assert.deepEqual(a.state.view.derived.mix, b.state.view.derived.mix);
  assert.notDeepEqual(a.state.session.history, b.state.session.history);
});
test('first two accepted Ice actions score 500 each, third changes neither history nor count', () => {
  const g = game(); g.pour(925); const liquid = totalVolumeUnits(g.state.view.derived.mix);
  g.ice(); assert.equal(g.score().iceScore, 500);
  g.ice(); assert.equal(g.score().iceScore, 1000);
  const history = g.state.session.history; g.ice();
  assert.equal(g.state.session.history, history); assert.equal(g.state.view.derived.mix.iceUnits, 2);
  assert.equal(totalVolumeUnits(g.state.view.derived.mix), liquid);
  g.shake(100); g.ice(); assert.equal(g.score().iceScore, 1000);
});
test('garnish is rejected before Shake, accepted once after and cannot be toggled away', () => {
  const g = game(); g.pour(925); g.garnish(); assert.equal(g.score().garnishScore, 0);
  g.shake(100); g.garnish(); assert.equal(g.score().garnishScore, 100);
  const history = g.state.session.history; g.garnish(); assert.equal(g.state.session.history, history);
  g.send({ type: 'GarnishChanged', garnishId: null, atMs: g.time }); assert.equal(g.score().garnishScore, 100);
});
test('Shake bonus uses accepted distinct actions, independently of their duration', () => {
  for (const duration of [1, 100, 1000]) {
    const g = game(); g.pour(925);
    assert.equal(g.score().shakeScore, 0);
    for (const expected of [0, 0, 5, 15, 30]) { g.shake(duration); assert.equal(g.score().shakeScore, expected); }
    assert.equal(g.state.view.shakeCount, 5);
  }
});
test('sixth accepted Shake fails at start, without waiting for release or animation', () => {
  const g = game(); g.pour(925);
  for (let n = 0; n < 5; n++) g.shake(1);
  g.send({ type: 'ShakeStarted', operationId: 99, atMs: g.time });
  assert.equal(g.state.view.failed, true); assert.equal(g.state.view.phase, 'RESULT');
  assert.equal(g.state.result?.totalScore, 0); assert.equal(g.state.result?.exploded, true);
  assert.ok(g.state.view.derived.shakes.every(op => op.endedAtMs !== null));
});
test('cumulative Shake duration fails at exactly 8000ms while held, including delayed callbacks', () => {
  const g = game(); g.pour(925); g.shake(3000);
  g.send({ type: 'ShakeStarted', operationId: 99, atMs: g.time });
  g.send({ type: 'HoldAdvanced', operationId: 99, atMs: g.time + 4999 });
  assert.equal(g.state.view.failed, false); assert.equal(g.state.view.derived.mix.shakeDurationMs, 7999);
  g.send({ type: 'HoldAdvanced', operationId: 99, atMs: g.time + 1000 });
  assert.equal(g.state.view.derived.mix.shakeDurationMs, 8000);
  assert.equal(g.state.view.derived.shakes[1]?.elapsedMs, 5000);
  assert.equal(g.state.result?.totalScore, 0);
  assert.deepEqual(g.state.result?.breakdown.map(item => item.points), [0, 0, 0, 0]);
});
test('empty drink cannot Shake or Serve; rejected actions never become accepted facts', () => {
  const g = game(); g.shake(100); g.serve(); assert.equal(g.state.result, null);
  assert.equal(g.state.session.history.length, 0); assert.match(g.state.feedback, /Prima agita/);
});
test('first accepted Shake closes mixing; post-Shake Pour and Ice are rejected', () => {
  const g = game(); g.pour(925); g.shake(100);
  assert.equal(g.state.view.phase, 'READY_TO_SERVE');
  const before = g.state.session.history; g.pour(1050, 'citrus'); g.ice();
  assert.equal(g.state.session.history, before); assert.equal(g.state.view.derived.mix.iceUnits, 0);
});
test('Serve requires a positive elapsed Shake and release, then freezes the attempt', () => {
  const g = game(); g.pour(925); g.serve(); assert.equal(g.state.result, null);
  g.shake(0); g.serve(); assert.equal(g.state.result, null);
  g.shake(1); g.serve(); assert.equal(g.state.view.phase, 'RESULT');
  const frozen = g.state; g.pour(2000); g.ice(); g.garnish(); g.shake(500);
  assert.equal(g.state, frozen);
});
test('Reset clears successful and failed attempts while retaining all chronology and ignoring stale callbacks', () => {
  for (const failed of [false, true]) {
    const g = game(); g.pour(925); g.shake(failed ? 8000 : 100); if (!failed) g.serve();
    const history = g.state.session.history; g.reset();
    assert.deepEqual(g.state.view.derived.mix, emptyMix()); assert.equal(g.state.result, null);
    assert.equal(g.state.view.phase, 'MIXING'); assert.equal(g.state.view.shakeCount, 0);
    assert.deepEqual(g.state.session.history.slice(0, -1), history);
    const clean = g.state; g.send({ type: 'HoldAdvanced', operationId: 1, atMs: g.time + 100 }); assert.equal(g.state, clean);
    g.pour(925); assert.equal(totalVolumeUnits(g.state.view.derived.mix), 3);
  }
});
test('reset during a live hold flushes and closes it without a ghost tick', () => {
  const g = game(); g.send({ type: 'PourStarted', operationId: 100, ingredientId: 'orchard', atMs: 0 });
  g.send({ type: 'Reset', atMs: 1050 });
  assert.deepEqual(g.state.session.history.map(e => e.type), ['PourStarted', 'PourTick', 'PourTick', 'PourEnded', 'Reset']);
  g.send({ type: 'HoldAdvanced', operationId: 100, atMs: 2000 }); assert.deepEqual(g.state.view.derived.mix, emptyMix());
});
test('original weighted 2:1:1 full drink scores 8800 before deterministic modifiers', () => {
  const g = game(); g.pour(5800, 'orchard'); g.pour(3300, 'citrus'); g.pour(3300, 'soda');
  assert.equal(g.score().ingredientScore, 8800);
  g.ice(); g.ice(); for (let n = 0; n < 5; n++) g.shake(100); g.garnish(); g.serve();
  assert.equal(g.state.result?.totalScore, 9930); assert.equal(g.state.result?.mechanicalReactionTierId, 'legendary');
  assert.equal(g.state.result?.breakdown.reduce((sum, item) => sum + item.points, 0), g.state.result?.totalScore);
  assert.deepEqual(g.state.result, gameDependencies.scoringEngine.evaluate(createCompatibilityInput(g.state.session)));
  assert.ok(g.state.result?.breakdown.every(item => Number.isSafeInteger(item.points)));
});
test('different full ingredient mixes have differentiated original scores, never automatic perfection', () => {
  const scores = ['orchard', 'citrus', 'soda'].map(id => { const g = game(); g.pour(10800, id); return g.score().ingredientScore; });
  assert.deepEqual(scores, [8450, 7312, 4912]); assert.ok(scores.every(score => score < 10000));
});
test('scoring configuration is data-driven; capped breakdown still adds to the total', () => {
  const profile = structuredClone(gameDependencies.profile);
  const tuned = { ...profile, score: { ...profile.score, ingredientWeights: { orchard: 20000, citrus: 7200, soda: 4800 } } };
  const deps = { profile: tuned, scoringEngine: createClassicInspiredScoringEngine(tuned) };
  const g = game(deps); g.pour(10800); g.ice(); g.ice(); g.shake(100); g.garnish(); g.serve();
  assert.equal(g.state.result?.totalScore, 10000);
  assert.equal(g.state.result?.breakdown.reduce((sum, item) => sum + item.points, 0), 10000);
});
test('scorer replays history, ignoring forged cached state and presentation scales', () => {
  const g = game(); g.pour(1050); g.shake(100);
  const input = createCompatibilityInput(g.state.session), expected = g.score();
  const forged = { ...input, projection: { ...input.projection, state: { ...input.projection.state, mix: emptyMix() } } };
  assert.deepEqual(gameDependencies.scoringEngine.evaluate(forged), expected);
  formatVolumeUnits(volumeUnits(6), { symbol: 'ml', scale: { numerator: 2, denominator: 1 } });
  assert.deepEqual(g.score(), expected);
});
test('production replay rejects forged non-integer quantity or untimed Pour ticks', () => {
  const g = game(); g.pour(925);
  const history = g.state.session.history;
  for (const requestedUnits of [1.5, 6]) {
    const forged = history.map(event => event.type === 'PourTick' ? { ...event, requestedUnits: requestedUnits as ReturnType<typeof volumeUnits> } : event);
    assert.throws(() => replayClassicHistory(forged, gameDependencies.profile), RangeError);
  }
});
test('tuning rejects fractional, zero cadence, incoherent ingredients and unsorted reaction scales', () => {
  const p = gameDependencies.profile;
  assert.throws(() => validateClassicProfile({ ...p, pour: { ...p.pour, intervalMs: 0 } }), RangeError);
  assert.throws(() => validateClassicProfile({ ...p, ice: { ...p.ice, pointsPerAction: 1.5 } }), RangeError);
  assert.throws(() => validateClassicProfile({ ...p, score: { ...p.score, targetParts: { orchard: 1 } } }), RangeError);
  assert.throws(() => validateClassicProfile({ ...p, score: { ...p.score, tiers: [...p.score.tiers].reverse() } }), RangeError);
  assert.equal(productivePourSteps(Number.MAX_SAFE_INTEGER, p), Number(BigInt(Number.MAX_SAFE_INTEGER - 800) / 125n));
});

test('production history rejects missing elapsed tails rather than scoring an incomplete hold', () => {
  const g = game(); g.pour(1050); g.shake(200);
  const missingPour = g.state.session.history.filter(event => !(event.type === 'PourTick' && event.atMs === 1050))
    .map((event, sequence) => ({ ...event, sequence }));
  assert.throws(() => replayClassicHistory(missingPour, gameDependencies.profile), /pour/);
  const missingShake = g.state.session.history.filter(event => event.type !== 'ShakeTick').map((event, sequence) => ({ ...event, sequence }));
  assert.throws(() => replayClassicHistory(missingShake, gameDependencies.profile), /shake tail/);
});
test('a future non-divisible capacity preserves requested and clamped integer tick quantities', () => {
  const profile = { ...gameDependencies.profile, capacityUnits: volumeUnits(241) };
  const deps = { profile, scoringEngine: createClassicInspiredScoringEngine(profile) };
  const g = game(deps); g.pour(20000);
  assert.equal(totalVolumeUnits(g.state.view.derived.mix), 241);
  const last = g.state.view.derived.pours[0]?.ticks.at(-1);
  assert.equal(last?.requestedUnits, 3); assert.equal(last?.addedUnits, 1);
});
test('the engine snapshots its configuration and final breakdown entries are frozen', () => {
  const g = game(); g.pour(1050); g.shake(1);
  const profile = structuredClone(gameDependencies.profile), engine = createClassicInspiredScoringEngine(profile);
  const input = createCompatibilityInput(g.state.session), before = engine.evaluate(input);
  (profile.score.ingredientWeights as Record<string, number>).orchard = 0;
  assert.deepEqual(engine.evaluate(input), before);
  assert.ok(Object.isFrozen(before)); assert.ok(before.breakdown.every(Object.isFrozen));
});
