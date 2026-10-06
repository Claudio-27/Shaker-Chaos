import { totalVolumeUnits } from '../domain/mix.ts';
import type { MixingRules, ScoreResult, ScoringEngine } from '../domain/model.ts';
import { appendMixEvent, createCompatibilityInput, newSession } from '../domain/session.ts';
import type { CocktailSession, DerivedSession, MixEventData, OperationEndReason } from '../domain/session.ts';

export interface GameState {
  readonly session: CocktailSession;
  readonly view: DerivedSession;
  readonly result: ScoreResult | null;
}
export type GameAction = MixEventData & { readonly atMs: number };
export interface GameDependencies {
  readonly mixingRules: MixingRules;
  readonly scoringEngine: ScoringEngine;
  readonly ingredientIds: readonly string[];
  readonly garnishIds: readonly string[];
}

export function newGame(rules: MixingRules): GameState {
  const session = newSession(rules);
  return { session, view: createCompatibilityInput(session).projection.state, result: null };
}

function closeOperations(state: GameState, atMs: number, reason: OperationEndReason): CocktailSession {
  const activeIds = new Set([...state.view.pours, ...state.view.shakes]
    .filter((item) => item.endedAtMs === null).map((item) => item.operationId));
  let session = state.session;
  // Close in start-event order, not arbitrary ID order, when serve/reset interrupts holds.
  for (const event of state.session.history) {
    if ((event.type === 'PourStarted' || event.type === 'ShakeStarted') && activeIds.has(event.operationId)) {
      session = appendMixEvent(session, { type: event.type === 'PourStarted' ? 'PourEnded' : 'ShakeEnded',
        operationId: event.operationId, reason }, atMs);
    }
  }
  return session;
}

/** Domain chronology is retained; lifecycle restrictions below belong only to the demo. */
export function transitionGame(state: GameState, action: GameAction, deps: GameDependencies): GameState {
  if (action.type !== 'Reset' && state.view.phase === 'served') return state;
  if ((action.type === 'PourStarted' || action.type === 'PourTick') && !deps.ingredientIds.includes(action.ingredientId)) return state;
  if (action.type === 'GarnishChanged' && action.garnishId !== null && !deps.garnishIds.includes(action.garnishId)) return state;
  if (action.type === 'Served' && totalVolumeUnits(state.view.mix) === 0) return state;
  if (action.type === 'PourTick' || action.type === 'PourEnded') {
    if (!state.view.pours.some((item) => item.operationId === action.operationId && item.endedAtMs === null)) return state;
  }
  if (action.type === 'ShakeTick' || action.type === 'ShakeEnded') {
    if (!state.view.shakes.some((item) => item.operationId === action.operationId && item.endedAtMs === null)) return state;
  }
  const interrupted = action.type === 'Reset' || action.type === 'Served';
  const base = interrupted ? closeOperations(state, action.atMs, action.type === 'Reset' ? 'reset' : 'served') : state.session;
  const session = appendMixEvent(base, action, action.atMs);
  const input = createCompatibilityInput(session);
  return { session, view: input.projection.state,
    result: action.type === 'Served' ? deps.scoringEngine.evaluate(input) : null };
}

