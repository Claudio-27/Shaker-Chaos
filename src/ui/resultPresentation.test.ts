import test from 'node:test';
import assert from 'node:assert/strict';
import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import type { ClassicGameAction } from '../application/classicGame.ts';
import { gameDependencies } from '../application/productionBootstrap.ts';
import { createResultPresentation } from './resultPresentation.ts';
import type { ResultPresentation } from './resultPresentation.ts';
function result(failed = false) {
  let state = newClassicGame(gameDependencies);
  const send = (action: ClassicGameAction) => { state = transitionClassicGame(state, action, gameDependencies); };
  send({ type: 'PourStarted', ingredientId: 'orchard', operationId: 0, atMs: 0 });
  send({ type: 'PourEnded', operationId: 0, reason: 'completed', atMs: 1050 });
  send({ type: 'ShakeStarted', operationId: 1, atMs: 1050 });
  send({ type: 'ShakeEnded', operationId: 1, reason: 'completed', atMs: failed ? 9050 : 1150 });
  if (!failed) send({ type: 'Served', atMs: 1150 });
  assert.ok(state.result); return state.result;
}
function setup() {
  let id = 0; const jobs = new Map<number, { delay: number; run: () => void }>(), cancelled: number[] = [], views: ResultPresentation[] = [];
  const controller = createResultPresentation({
    after(delay, run) { jobs.set(++id, { delay, run }); return id; }, cancel(id) { cancelled.push(id); },
  }, view => views.push(view));
  return { controller, jobs, cancelled, views, fire(delay: number) { for (const job of jobs.values()) if (job.delay === delay) job.run(); } };
}
test('Serve freezes the score before presentation; reveal orders tasting, score, reaction, breakdown', () => {
  const frozen = result(), before = JSON.stringify(frozen), f = setup();
  assert.ok(Object.isFrozen(frozen)); assert.ok(frozen.totalScore > 0);
  f.controller.observe(frozen, 0, false); assert.equal(f.controller.current().stage, 'tasting');
  f.fire(650); f.fire(830); f.fire(1050);
  assert.deepEqual(f.views.map(v => v.stage), ['tasting','score','reaction','breakdown']);
  assert.ok(f.views.every(v => v.result === frozen)); assert.equal(JSON.stringify(frozen), before);
});
test('skip is immediate and idempotent; queued callbacks cannot regress or change score', () => {
  const frozen = result(), f = setup(); f.controller.observe(frozen, 0, false); f.controller.skip();
  const complete = f.controller.current(); f.controller.skip(); f.fire(650); f.fire(830); f.fire(1050);
  assert.equal(f.controller.current(), complete); assert.equal(complete.stage, 'breakdown'); assert.equal(complete.result, frozen);
  assert.equal(f.cancelled.length, 3);
});
test('reset during or after reveal ignores stale timers and permits a new independent round', () => {
  for (const completed of [false, true]) {
    const f = setup(), first = result(); f.controller.observe(first, 0, false); if (completed) f.fire(1050);
    const oldJobs = [...f.jobs.values()]; f.controller.observe(null, 10, false);
    oldJobs.forEach(j => j.run()); assert.equal(f.controller.current().stage, 'idle'); assert.equal(f.controller.current().result, null);
    const second = result(); f.controller.observe(second, 10, false); oldJobs.forEach(j => j.run());
    assert.equal(f.controller.current().stage, 'tasting'); assert.equal(f.controller.current().result, second);
    f.fire(1050); assert.equal(f.controller.current().stage, 'breakdown');
  }
});
test('failed or reduced-motion results reveal fully without scheduling or changing score', () => {
  for (const failed of [false, true]) {
    const f = setup(), frozen = result(failed); f.controller.observe(frozen, 0, !failed);
    assert.equal(f.controller.current().stage, 'breakdown'); assert.equal(f.jobs.size, 0);
    assert.equal(f.controller.current().result, frozen); if (failed) assert.equal(frozen.totalScore, 0);
  }
});
test('turning on reduced motion during tasting skips presentation only', () => {
  const f = setup(), frozen = result(); f.controller.observe(frozen, 0, false); f.controller.observe(frozen, 0, true);
  assert.equal(f.controller.current().stage, 'breakdown'); assert.equal(f.controller.current().result, frozen);
  f.controller.observe(frozen, 0, false); assert.equal(f.controller.current().stage, 'breakdown');
});
test('out of order timer delivery cannot regress and effect cleanup can safely reattach', () => {
  const f = setup(), frozen = result(); f.controller.observe(frozen, 0, false);
  f.fire(1050); f.fire(650); assert.equal(f.controller.current().stage, 'breakdown');
  f.controller.dispose(); const oldJobs = [...f.jobs.values()];
  f.controller.observe(frozen, 0, false); oldJobs.forEach(j => j.run());
  assert.equal(f.controller.current().stage, 'tasting'); f.fire(1050); assert.equal(f.controller.current().stage, 'breakdown');
});
