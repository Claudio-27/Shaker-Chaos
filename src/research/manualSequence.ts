import type { MixingRules } from '../domain/model.ts';
import { assertNonNegativeInteger, volumeUnits } from '../domain/quantity.ts';
import type { CocktailSession, MixEventData } from '../domain/session.ts';
import { appendMixEvent, createCompatibilityInput } from '../domain/session.ts';

export type ManualAction =
  | { readonly type: 'pour'; readonly ingredientId: string; readonly units: number; readonly durationMs?: number; readonly ticks?: number }
  | { readonly type: 'shake'; readonly durationMs: number }
  | { readonly type: 'ice'; readonly units: number }
  | { readonly type: 'garnish'; readonly garnishId: string | null }
  | { readonly type: 'wait'; readonly durationMs: number }
  | { readonly type: 'serve' | 'reset' };
export interface ManualTimeline { readonly session: CocktailSession; readonly cursorMs: number }
export const MAX_MANUAL_TICKS = 1000;
function integer(value: number, label: string) { assertNonNegativeInteger(value, label); return value; }

/** Synthetic tick allocation is explicit tooling policy, not reference behavior.
 * A missing duration is zero virtual ms; a missing tick count is one.
 * Imported measured tick histories bypass this convenience builder entirely.
 */
export function appendManualAction(timeline: ManualTimeline, action: ManualAction): ManualTimeline {
  let session = timeline.session;
  const last = session.history.at(-1)?.atMs ?? 0;
  const start = integer(timeline.cursorMs, 'Virtual clock');
  if (start < last) throw new RangeError('Virtual clock precedes history');
  let cursorMs = start;
  const emit = (data: MixEventData, atMs = cursorMs) => { session = appendMixEvent(session, data, atMs); };
  const nextId = () => integer(session.history.reduce((max, e) =>
    'operationId' in e ? Math.max(max, e.operationId) : max, -1) + 1, 'Operation ID');
  switch (action.type) {
    case 'pour': {
      const units = volumeUnits(action.units);
      const ticks = integer(action.ticks ?? 1, 'Pour tick count');
      if (ticks < 1 || ticks > MAX_MANUAL_TICKS) throw new RangeError('Pour ticks must be 1..1000');
      const duration = integer(action.durationMs ?? 0, 'Pour elapsed duration');
      const end = integer(start + duration, 'Virtual clock end');
      const operationId = nextId();
      emit({ type: 'PourStarted', operationId, ingredientId: action.ingredientId });
      const quantum = Number(BigInt(units) / BigInt(ticks)), remainder = Number(BigInt(units) % BigInt(ticks));
      for (let i = 0; i < ticks; i++) {
        const offset = Number(BigInt(duration) * BigInt(i + 1) / BigInt(ticks));
        emit({ type: 'PourTick', operationId, ingredientId: action.ingredientId,
          requestedUnits: volumeUnits(quantum + (i < remainder ? 1 : 0)) }, start + offset);
      }
      cursorMs = end;
      emit({ type: 'PourEnded', operationId, reason: 'completed' });
      break;
    }
    case 'shake': {
      const durationMs = integer(action.durationMs, 'Shake duration');
      const end = integer(start + durationMs, 'Virtual clock end');
      const operationId = nextId();
      emit({ type: 'ShakeStarted', operationId });
      cursorMs = end;
      emit({ type: 'ShakeTick', operationId, durationMs });
      emit({ type: 'ShakeEnded', operationId, reason: 'completed' });
      break;
    }
    case 'ice': emit({ type: 'IceAdded', requestedUnits: integer(action.units, 'Ice additions') }); break;
    case 'garnish': emit({ type: 'GarnishChanged', garnishId: action.garnishId }); break;
    case 'wait': cursorMs = integer(start + integer(action.durationMs, 'Wait duration'), 'Virtual clock end'); break;
    case 'serve':
    case 'reset': {
      const state = createCompatibilityInput(session).projection.state;
      const active = new Set([...state.pours, ...state.shakes].filter(op => op.endedAtMs === null).map(op => op.operationId));
      for (const event of session.history) {
        if ((event.type === 'PourStarted' || event.type === 'ShakeStarted') && active.has(event.operationId)) {
          emit({ type: event.type === 'PourStarted' ? 'PourEnded' : 'ShakeEnded',
            operationId: event.operationId, reason: action.type === 'serve' ? 'served' : 'reset' });
        }
      }
      emit({ type: action.type === 'serve' ? 'Served' : 'Reset' });
      break;
    }
  }
  return { session, cursorMs };
}
export function timelineFromHistory(history: CocktailSession['history'], rules: MixingRules): ManualTimeline {
  const input = createCompatibilityInput({ schemaVersion: 1, rules, history });
  return { session: { schemaVersion: 1, rules: input.projection.rules, history: input.history },
    cursorMs: history.at(-1)?.atMs ?? 0 };
}
