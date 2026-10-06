import { addIce, emptyMix, pour, quantityOf, shake, validateMixingRules } from './mix.ts';
import type { MixState, MixingRules } from './model.ts';
import { assertNonNegativeInteger, volumeUnits } from './quantity.ts';
import type { VolumeUnit } from './quantity.ts';

export const DEMO_PROJECTION_ID = 'phase-0-demo-projection-v2';
export type OperationEndReason = 'completed' | 'cancelled' | 'limit' | 'served' | 'reset';
export type SessionPhase = 'mixing' | 'pouring' | 'shaking' | 'pouring-and-shaking' | 'served';

/** Facts about gameplay, never pointer coordinates, selected cards or render state. */
export type MixEventData =
  | { readonly type: 'PourStarted'; readonly operationId: number; readonly ingredientId: string }
  | { readonly type: 'PourTick'; readonly operationId: number; readonly ingredientId: string; readonly requestedUnits: VolumeUnit }
  | { readonly type: 'PourEnded'; readonly operationId: number; readonly reason: OperationEndReason }
  | { readonly type: 'ShakeStarted'; readonly operationId: number }
  | { readonly type: 'ShakeTick'; readonly operationId: number; readonly durationMs: number }
  | { readonly type: 'ShakeEnded'; readonly operationId: number; readonly reason: OperationEndReason }
  | { readonly type: 'IceAdded'; readonly requestedUnits: number }
  | { readonly type: 'GarnishChanged'; readonly garnishId: string | null }
  | { readonly type: 'Served' }
  | { readonly type: 'Reset' };

/** Array order and sequence are authoritative; equal integer timestamps are allowed. */
export type MixEvent = MixEventData & { readonly sequence: number; readonly atMs: number };
export interface CocktailSession {
  readonly schemaVersion: 1;
  readonly rules: MixingRules;
  readonly history: readonly MixEvent[];
}

export interface PourOperation {
  readonly operationId: number;
  readonly ingredientId: string;
  readonly startedAtMs: number;
  readonly endedAtMs: number | null;
  readonly elapsedMs: number | null;
  readonly endReason: OperationEndReason | null;
  readonly ticks: readonly {
    readonly sequence: number;
    readonly atMs: number;
    readonly ingredientId: string;
    readonly requestedUnits: VolumeUnit;
    readonly addedUnits: VolumeUnit;
  }[];
}
export interface ShakeOperation {
  readonly operationId: number;
  readonly startedAtMs: number;
  readonly endedAtMs: number | null;
  readonly elapsedMs: number | null;
  readonly endReason: OperationEndReason | null;
  readonly ticks: readonly { readonly sequence: number; readonly atMs: number; readonly durationMs: number }[];
  readonly requestedDurationMs: number;
  readonly appliedDurationMs: number;
}
export interface DerivedSession {
  readonly mix: MixState;
  readonly phase: SessionPhase;
  readonly pours: readonly PourOperation[];
  readonly shakes: readonly ShakeOperation[];
  readonly currentAttemptStart: number;
}

/** A scorer can use raw chronology, operation analysis, or the replaceable demo projection. */
export interface CompatibilityInput {
  readonly schemaVersion: 1;
  readonly history: readonly MixEvent[];
  readonly currentAttemptHistory: readonly MixEvent[];
  readonly projection: {
    readonly id: string;
    readonly rules: MixingRules;
    readonly state: DerivedSession;
  };
}

function validateReason(reason: OperationEndReason): void {
  if (!['completed', 'cancelled', 'limit', 'served', 'reset'].includes(reason)) {
    throw new RangeError('Unknown operation end reason');
  }
}
function operation<T extends { readonly operationId: number; readonly endedAtMs: number | null }>(items: readonly T[], id: number): T {
  assertNonNegativeInteger(id, 'Operation ID');
  const item = items.find((candidate) => candidate.operationId === id && candidate.endedAtMs === null);
  if (!item) throw new RangeError('Tick/end must reference an active operation of the same kind');
  return item;
}
function ended<T extends { readonly startedAtMs: number }>(item: T, atMs: number, reason: OperationEndReason) {
  return { ...item, endedAtMs: atMs, elapsedMs: atMs - item.startedAtMs, endReason: reason };
}

/**
 * NOT YET COMPATIBILITY-VERIFIED: this projection preserves the Phase 0 demo rules.
 * Requested ticks remain in history even when clamped or ignored by this projection.
 * It does not reject gameplay merely because a Served marker exists; the demo app does.
 */
export function replayMixEvents(history: readonly MixEvent[], rules: MixingRules): DerivedSession {
  validateMixingRules(rules);
  let mix = emptyMix();
  let pours: PourOperation[] = [];
  let shakes: ShakeOperation[] = [];
  let served = false;
  let currentAttemptStart = 0;
  let previousTime = 0;
  const operationIds = new Set<number>();
  for (const [sequence, event] of history.entries()) {
    assertNonNegativeInteger(event.sequence, 'Event sequence');
    assertNonNegativeInteger(event.atMs, 'Event time');
    if (event.sequence !== sequence) throw new RangeError('Event sequence must match chronological array order');
    if (event.atMs < previousTime) throw new RangeError('Event times must be non-decreasing');
    previousTime = event.atMs;
    if (event.type === 'PourStarted' || event.type === 'ShakeStarted') {
      assertNonNegativeInteger(event.operationId, 'Operation ID');
      if (operationIds.has(event.operationId)) throw new RangeError('Operation IDs must be unique across the retained session');
      operationIds.add(event.operationId);
    }
    switch (event.type) {
      case 'PourStarted':
        if (!event.ingredientId.trim()) throw new RangeError('Ingredient ID must not be empty');
        pours.push({ operationId: event.operationId, ingredientId: event.ingredientId, startedAtMs: event.atMs,
          endedAtMs: null, elapsedMs: null, endReason: null, ticks: [] });
        break;
      case 'PourTick': {
        const item = operation(pours, event.operationId);
        if (!event.ingredientId.trim()) throw new RangeError('Tick ingredient ID must not be empty');
        const before = quantityOf(mix, event.ingredientId);
        mix = pour(mix, event.ingredientId, event.requestedUnits, rules);
        const tick = { sequence, atMs: event.atMs, ingredientId: event.ingredientId, requestedUnits: event.requestedUnits,
          addedUnits: volumeUnits(quantityOf(mix, event.ingredientId) - before) };
        pours = pours.map((candidate) => candidate === item ? { ...item, ticks: [...item.ticks, tick] } : candidate);
        break;
      }
      case 'PourEnded': {
        validateReason(event.reason);
        const item = operation(pours, event.operationId);
        pours = pours.map((candidate) => candidate === item ? ended(item, event.atMs, event.reason) : candidate);
        break;
      }
      case 'ShakeStarted':
        shakes.push({ operationId: event.operationId, startedAtMs: event.atMs, endedAtMs: null,
          elapsedMs: null, endReason: null, ticks: [], requestedDurationMs: 0, appliedDurationMs: 0 });
        break;
      case 'ShakeTick': {
        const item = operation(shakes, event.operationId);
        assertNonNegativeInteger(event.durationMs, 'Shake tick duration');
        const requestedDurationMs = item.requestedDurationMs + event.durationMs;
        assertNonNegativeInteger(requestedDurationMs, 'Cumulative operation duration');
        const before = mix.shakeDurationMs;
        mix = shake(mix, event.durationMs, rules);
        shakes = shakes.map((candidate) => candidate === item ? { ...item, requestedDurationMs,
          appliedDurationMs: item.appliedDurationMs + (mix.shakeDurationMs - before),
          ticks: [...item.ticks, { sequence, atMs: event.atMs, durationMs: event.durationMs }] } : candidate);
        break;
      }
      case 'ShakeEnded': {
        validateReason(event.reason);
        const item = operation(shakes, event.operationId);
        shakes = shakes.map((candidate) => candidate === item ? ended(item, event.atMs, event.reason) : candidate);
        break;
      }
      case 'IceAdded':
        mix = addIce(mix, event.requestedUnits, rules);
        break;
      case 'GarnishChanged':
        if (event.garnishId !== null && !event.garnishId.trim()) throw new RangeError('Garnish ID must not be empty');
        mix = { ...mix, garnishId: event.garnishId };
        break;
      case 'Served':
        served = true;
        break;
      case 'Reset':
        mix = emptyMix();
        pours = [];
        shakes = [];
        served = false;
        currentAttemptStart = sequence + 1;
        break;
      default:
        throw new RangeError('Unsupported event type; migrate the history schema explicitly');
    }
  }
  const pouring = pours.some((item) => item.endedAtMs === null);
  const shaking = shakes.some((item) => item.endedAtMs === null);
  const phase = served ? 'served' : pouring && shaking ? 'pouring-and-shaking'
    : pouring ? 'pouring' : shaking ? 'shaking' : 'mixing';
  return Object.freeze({
    mix: Object.freeze({ ...mix, quantities: Object.freeze({ ...mix.quantities }) }),
    phase, currentAttemptStart,
    pours: Object.freeze(pours.map((item) => Object.freeze({ ...item, ticks: Object.freeze(item.ticks.map((tick) => Object.freeze(tick))) }))),
    shakes: Object.freeze(shakes.map((item) => Object.freeze({ ...item, ticks: Object.freeze(item.ticks.map((tick) => Object.freeze(tick))) }))),
  });
}

export function newSession(rules: MixingRules): CocktailSession {
  validateMixingRules(rules);
  return Object.freeze({ schemaVersion: 1, rules: Object.freeze({ ...rules }), history: Object.freeze([]) });
}

function snapshotSession(session: CocktailSession): CocktailSession {
  if (session.schemaVersion !== 1) throw new RangeError('Unsupported session schema');
  return Object.freeze({ ...session, rules: Object.freeze({ ...session.rules }),
    history: Object.freeze(session.history.map((event) => Object.freeze({ ...event }))) });
}

export function appendMixEvent(session: CocktailSession, data: MixEventData, atMs: number): CocktailSession {
  const candidate = snapshotSession({ ...session,
    history: [...session.history, { ...data, sequence: session.history.length, atMs }],
  });
  replayMixEvents(candidate.history, candidate.rules);
  return candidate;
}

export function createCompatibilityInput(session: CocktailSession): CompatibilityInput {
  const snapshot = snapshotSession(session);
  const state = replayMixEvents(snapshot.history, snapshot.rules);
  return Object.freeze({ schemaVersion: 1, history: snapshot.history,
    currentAttemptHistory: Object.freeze(snapshot.history.slice(state.currentAttemptStart)),
    projection: Object.freeze({ id: DEMO_PROJECTION_ID, rules: snapshot.rules, state }),
  });
}

