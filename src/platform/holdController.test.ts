import test from 'node:test';
import assert from 'node:assert/strict';
import { bindHoldInterruptions, createHoldController } from './holdController.ts';
import type { HoldSource } from './holdController.ts';
import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import { gameDependencies } from '../application/productionBootstrap.ts';
import { totalVolumeUnits } from '../domain/mix.ts';

function setup() {
  let now = 0, pending: (() => void) | null = null, stops = 0;
  const scheduled: (() => void)[] = [];
  let state = newClassicGame(gameDependencies), operationId = -1;
  const controller = createHoldController(() => now, {
    start(callback) { pending = callback; scheduled.push(callback); return 1; },
    stop() { pending = null; stops++; },
  }, {
    onStart(atMs) { operationId++; state = transitionClassicGame(state, { type: 'PourStarted', ingredientId: 'orchard', operationId, atMs }, gameDependencies); },
    onAction(atMs) { state = transitionClassicGame(state, { type: 'HoldAdvanced', operationId, atMs }, gameDependencies); },
    onEnd(reason, atMs) { state = transitionClassicGame(state, { type: 'PourEnded', operationId, reason, atMs }, gameDependencies); },
  });
  return { controller, get state() { return state; }, get stops() { return stops; },
    time(value: number) { now = value; }, tick() { pending?.(); }, lateTick() { scheduled[0]?.(); } };
}
const pointer: HoldSource = { kind: 'pointer', id: 1 };
test('pointer hold/release outside flushes the tail and ignores other pointers and late timers', () => {
  const f = setup(); f.controller.start(pointer); f.time(1050);
  f.controller.stop({ kind: 'pointer', id: 2 }); assert.equal(f.controller.isRunning(), true);
  f.controller.stop(pointer); assert.equal(totalVolumeUnits(f.state.view.derived.mix), 6);
  const frozen = f.state; f.time(5000); f.lateTick(); assert.equal(f.state, frozen);
  assert.equal(f.controller.isRunning(), false); assert.equal(f.stops, 1);
});
test('pointercancel or lost capture ends the same operation without ghost increments', () => {
  for (const duration of [799, 1050]) {
    const f = setup(); f.controller.start(pointer); f.time(duration); f.controller.stop(pointer, 'cancelled');
    assert.equal(f.state.view.derived.pours[0]?.endReason, 'cancelled');
    assert.equal(totalVolumeUnits(f.state.view.derived.mix), duration === 799 ? 0 : 6);
    const history = f.state.session.history; f.time(6000); f.lateTick(); assert.equal(f.state.session.history, history);
  }
});
test('keyboard hold and pointer hold produce identical history and suppress repeats / mixed sources', () => {
  const mouse = setup(), key = setup(); mouse.controller.start(pointer);
  const keyboard: HoldSource = { kind: 'keyboard', key: ' ' }; key.controller.start(keyboard);
  assert.equal(key.controller.start(keyboard), false); assert.equal(key.controller.start(pointer), false);
  mouse.time(1050); key.time(1050); mouse.controller.stop(pointer);
  key.controller.stop({ kind: 'keyboard', key: 'Enter' }); assert.equal(key.controller.isRunning(), true);
  key.controller.stop(keyboard); assert.deepEqual(key.state.session.history, mouse.state.session.history);
});
test('window focus loss, document hidden and cleanup interrupt safely and detach listeners', () => {
  for (const interruption of ['blur', 'hidden', 'cleanup']) {
    const f = setup(), surface = new EventTarget();
    const page = Object.assign(new EventTarget(), { hidden: false });
    const cleanup = bindHoldInterruptions(f.controller, surface, page);
    f.controller.start(pointer); f.time(1050);
    if (interruption === 'blur') surface.dispatchEvent(new Event('blur'));
    if (interruption === 'hidden') { page.hidden = true; page.dispatchEvent(new Event('visibilitychange')); }
    if (interruption === 'cleanup') cleanup();
    assert.equal(f.controller.isRunning(), false); assert.equal(totalVolumeUnits(f.state.view.derived.mix), 6);
    cleanup(); const frozen = f.state; surface.dispatchEvent(new Event('blur')); f.time(7000); f.lateTick(); assert.equal(f.state, frozen);
  }
});
test('polling is not required for release quantity and re-press restarts the full startup', () => {
  const f = setup(); f.controller.start(pointer); f.time(1050); f.controller.stop(pointer);
  f.controller.start(pointer); f.time(1849); f.tick(); f.controller.stop(pointer);
  assert.equal(totalVolumeUnits(f.state.view.derived.mix), 6); assert.equal(f.state.view.derived.pours.length, 2);
});

test('a late timer from an interrupted hold cannot advance a new operation', () => {
  const f = setup(); f.controller.start(pointer); f.time(1050); f.controller.cancel();
  f.controller.start(pointer); const before = f.state;
  f.time(2100); f.lateTick(); assert.equal(f.state, before);
  f.tick(); assert.equal(totalVolumeUnits(f.state.view.derived.mix), 12);
  f.controller.stop(pointer);
});
