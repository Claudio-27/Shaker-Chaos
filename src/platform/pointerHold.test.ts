import test from 'node:test';
import assert from 'node:assert/strict';
import { bindHoldInterruptions, createHoldController, createHoldOwnership } from './holdController.ts';
import { releasePointerHold, startPointerHold } from './pointerHold.ts';
import type { HoldSource } from './holdController.ts';
function setup() {
  let time = 0; const ownership = createHoldOwnership(), events: string[] = [], timers: (() => void)[] = [];
  const make = (name: string) => createHoldController(() => time, { start(cb) { timers.push(cb); return timers.length; }, stop() {} }, {
    onStart() { events.push(name + ':start'); }, onAction() { events.push(name + ':action'); }, onEnd(reason) { events.push(name + ':' + reason); },
  }, 25, ownership);
  return { pour: make('pour'), shake: make('shake'), events, timers, time(ms: number) { time = ms; } };
}
function pointer(id = 1, primary = true, throwCapture = false) {
  const calls: string[] = []; let captured = false;
  return { calls, event: { button: 0, pointerId: id, isPrimary: primary, preventDefault() { calls.push('prevent'); }, currentTarget: {
    focus() { calls.push('focus'); }, setPointerCapture() { calls.push('capture'); if (throwCapture) throw new Error('capture failed'); captured = true; },
    hasPointerCapture() { return captured; }, releasePointerCapture() { calls.push('release'); captured = false; },
  } } };
}
test('second pointer cannot acquire focus/capture or start a conflicting hold', () => {
  const f = setup(), first = pointer(), second = pointer(2); const owned = startPointerHold(f.pour, first.event, false);
  assert.ok(owned); assert.equal(startPointerHold(f.shake, second.event, false), null);
  assert.deepEqual(second.calls, ['prevent']); assert.deepEqual(f.events, ['pour:start']);
  f.pour.stop({ kind: 'pointer', id: 2 }); assert.equal(f.pour.isRunning(), true);
  f.pour.stop({ kind: 'pointer', id: 1 }); releasePointerHold(owned);
  assert.ok(startPointerHold(f.shake, second.event, false)); assert.deepEqual(first.calls, ['prevent','focus','capture','release']);
});
test('non-primary, disabled and secondary-button pointers cannot claim a control', () => {
  const f = setup(), secondary = pointer(2, false), disabled = pointer();
  assert.equal(startPointerHold(f.pour, secondary.event, false), null);
  assert.equal(startPointerHold(f.pour, disabled.event, true), null);
  assert.equal(startPointerHold(f.pour, { ...disabled.event, button: 2 }, false), null);
  assert.deepEqual(secondary.calls, ['prevent']); assert.deepEqual(disabled.calls, []); assert.equal(f.events.length, 0);
});
test('pointercancel and lost capture release shared ownership; queued callbacks stay inert', () => {
  for (const reason of ['pointercancel', 'lostpointercapture']) {
    const f = setup(), p = pointer(); const owned = startPointerHold(f.pour, p.event, false);
    f.time(1050); f.pour.stop({ kind: 'pointer', id: 1 }, 'cancelled'); releasePointerHold(owned);
    const before = [...f.events]; f.timers[0]!(); assert.deepEqual(f.events, before, reason);
    assert.ok(f.shake.start({ kind: 'pointer', id: 2 })); assert.equal(f.events.filter(e => e === 'pour:cancelled').length, 1);
  }
});
test('capture failure cancels cleanly and leaves another control available', () => {
  const f = setup(); assert.equal(startPointerHold(f.pour, pointer(1, true, true).event, false), null);
  assert.equal(f.pour.isRunning(), false); assert.ok(f.shake.start({ kind: 'keyboard', key: 'Enter' }));
});
test('keyboard and pointer share one owner; foreign release cannot stop the accepted source', () => {
  const f = setup(), key: HoldSource = { kind: 'keyboard', key: ' ' };
  assert.ok(f.pour.start(key)); assert.equal(f.shake.start({ kind: 'pointer', id: 1 }), false);
  f.pour.stop({ kind: 'pointer', id: 1 }); assert.equal(f.pour.isRunning(), true);
  f.pour.stop(key); assert.ok(f.shake.start(key)); assert.equal(f.pour.start(key), false);
});
test('blur, hidden document and cleanup release ownership with no stale timer action', () => {
  for (const cause of ['blur','hidden','cleanup']) {
    const f = setup(), surface = new EventTarget(), page = Object.assign(new EventTarget(), { hidden: false });
    const cleanup = bindHoldInterruptions(f.pour, surface, page); f.pour.start({ kind: 'pointer', id: 1 });
    if (cause === 'blur') surface.dispatchEvent(new Event('blur'));
    if (cause === 'hidden') { page.hidden = true; page.dispatchEvent(new Event('visibilitychange')); }
    if (cause === 'cleanup') cleanup();
    const before = [...f.events]; f.timers[0]!(); assert.deepEqual(f.events, before);
    assert.ok(f.shake.start({ kind: 'pointer', id: 2 })); cleanup();
  }
});
