import type { ClassicInspiredTuningProfile } from '../domain/classicProfile.ts';
import { classicMixingRules, productivePourSteps } from '../domain/classicProfile.ts';
import { replayClassicHistory } from '../domain/classicSession.ts';
import type { ClassicSessionView } from '../domain/classicSession.ts';
import type { ClassicInspiredScoringEngine, ClassicScoreResult } from '../domain/classicScoring.ts';
import { totalVolumeUnits } from '../domain/mix.ts';
import { appendMixEvent, createCompatibilityInput, newSession } from '../domain/session.ts';
import type { CocktailSession, MixEventData, OperationEndReason } from '../domain/session.ts';
import { assertNonNegativeInteger } from '../domain/quantity.ts';

export interface ClassicGameDependencies {
  readonly profile: ClassicInspiredTuningProfile;
  readonly scoringEngine: ClassicInspiredScoringEngine;
}
export interface ClassicGameState {
  readonly session: CocktailSession;
  readonly view: ClassicSessionView;
  readonly result: ClassicScoreResult | null;
  readonly feedback: string;
}
export type ClassicGameAction = (
  | Extract<MixEventData, { type: 'PourStarted' | 'PourEnded' | 'ShakeStarted' | 'ShakeEnded' | 'IceAdded' | 'GarnishChanged' | 'Served' | 'Reset' }>
  | { readonly type: 'HoldAdvanced'; readonly operationId: number }
) & { readonly atMs: number };
export function newClassicGame(deps: ClassicGameDependencies): ClassicGameState {
  const session = newSession(classicMixingRules(deps.profile));
  return { session, view: replayClassicHistory(session.history, deps.profile), result: null, feedback: '' };
}
function accepted(state: ClassicGameState, event: MixEventData, atMs: number, deps: ClassicGameDependencies): ClassicGameState {
  const session = appendMixEvent(state.session, event, atMs);
  const view = replayClassicHistory(session.history, deps.profile);
  return { session, view, feedback: '',
    result: view.phase === 'RESULT' ? deps.scoringEngine.evaluate(createCompatibilityInput(session)) : null };
}
function closeActive(state: ClassicGameState, atMs: number, reason: OperationEndReason, deps: ClassicGameDependencies): ClassicGameState {
  let next = state;
  for (const op of state.view.derived.pours.filter(op => op.endedAtMs === null)) {
    next = accepted(next, { type: 'PourEnded', operationId: op.operationId, reason }, atMs, deps);
  }
  for (const op of state.view.derived.shakes.filter(op => op.endedAtMs === null)) {
    next = accepted(next, { type: 'ShakeEnded', operationId: op.operationId, reason }, atMs, deps);
  }
  return next;
}
/** Timer cadence only samples time. Pour ticks use their exact logical deadlines, including the release tail. */
function advanceTo(state: ClassicGameState, atMs: number, deps: ClassicGameDependencies): ClassicGameState {
  if (state.view.phase === 'RESULT') return state;
  let next = state;
  const profile = deps.profile;
  const pouring = next.view.derived.pours.find(op => op.endedAtMs === null);
  if (pouring) {
    const steps = productivePourSteps(atMs - pouring.startedAtMs, profile);
    for (let step = pouring.ticks.length + 1; step <= steps; step++) {
      const due = pouring.startedAtMs + profile.pour.startupMs + step * profile.pour.intervalMs;
      next = accepted(next, { type: 'PourTick', operationId: pouring.operationId, ingredientId: pouring.ingredientId,
        requestedUnits: profile.pour.unitsPerStep }, due, deps);
      if (totalVolumeUnits(next.view.derived.mix) >= profile.capacityUnits) {
        return accepted(next, { type: 'PourEnded', operationId: pouring.operationId, reason: 'limit' }, due, deps);
      }
    }
  }
  const shaking = next.view.derived.shakes.find(op => op.endedAtMs === null);
  if (shaking) {
    const last = shaking.ticks.at(-1)?.atMs ?? shaking.startedAtMs;
    const durationMs = Math.min(atMs - last, profile.shake.failureDurationMs - next.view.derived.mix.shakeDurationMs);
    if (durationMs > 0) {
      next = accepted(next, { type: 'ShakeTick', operationId: shaking.operationId, durationMs }, last + durationMs, deps);
      if (next.view.failed) next = closeActive(next, last + durationMs, 'limit', deps);
    }
  }
  return next;
}
export function transitionClassicGame(state: ClassicGameState, action: ClassicGameAction, deps: ClassicGameDependencies): ClassicGameState {
  assertNonNegativeInteger(action.atMs, 'Action time');
  if (action.atMs < (state.session.history.at(-1)?.atMs ?? 0)) throw new RangeError('Action time cannot move backwards');
  if (state.view.phase === 'RESULT' && action.type !== 'Reset') return state;
  // Late callbacks cannot update a later operation, including after Reset.
  if (action.type === 'HoldAdvanced' || action.type === 'PourEnded' || action.type === 'ShakeEnded') {
    const kind = action.type === 'PourEnded' ? state.view.derived.pours : action.type === 'ShakeEnded' ? state.view.derived.shakes
      : [...state.view.derived.pours, ...state.view.derived.shakes];
    if (!kind.some(op => op.operationId === action.operationId && op.endedAtMs === null)) return state;
  }
  let next = advanceTo(state, action.atMs, deps);
  if (action.type === 'Reset') {
    next = closeActive(next, action.atMs, 'reset', deps);
    return accepted(next, { type: 'Reset' }, action.atMs, deps);
  }
  if (action.type === 'HoldAdvanced' || next.view.phase === 'RESULT') return next;
  if (action.type === 'PourEnded' && !next.view.derived.pours.some(op => op.operationId === action.operationId && op.endedAtMs === null)) return next;
  const reject = (feedback: string): ClassicGameState => ({ ...next, feedback });
  const { phase, derived } = next.view;
  const activePour = derived.pours.some(op => op.endedAtMs === null);
  const activeShake = derived.shakes.some(op => op.endedAtMs === null);
  switch (action.type) {
    case 'PourStarted':
      if (phase !== 'MIXING' || activePour || activeShake || totalVolumeUnits(derived.mix) >= deps.profile.capacityUnits)
        return reject('La miscelazione è chiusa. Agita e poi servi il tuo mix.');
      if (!Object.hasOwn(deps.profile.score.ingredientWeights, action.ingredientId)&&!Object.hasOwn(deps.profile.score.additionalIngredients??{},action.ingredientId)) return reject('Scegli una bottiglia del banco.');
      break;
    case 'ShakeStarted':
      if (!totalVolumeUnits(derived.mix)) return reject('Prima versa un po’ di mix nello shaker.');
      if (activeShake) return next;
      if (activePour) next = closeActive(next, action.atMs, 'cancelled', deps);
      break;
    case 'IceAdded':
      if (phase !== 'MIXING' || derived.mix.iceUnits >= deps.profile.ice.maximumActions || action.requestedUnits !== 1)
        return reject('Il ghiaccio è pronto: passa all’agitazione.');
      break;
    case 'GarnishChanged':
      if (phase !== 'READY_TO_SERVE' || derived.mix.garnishId || action.garnishId !== deps.profile.garnish.id)
        return reject('Una guarnizione dopo aver agitato: il tocco finale.');
      break;
    case 'Served':
      if (phase !== 'READY_TO_SERVE' || !next.view.completedShakeCount || activePour || activeShake)
        return reject('Prima agita il mix e rilascia il pulsante. Poi puoi servire!');
      break;
  }
  next = accepted(next, action, action.atMs, deps);
  if (next.view.failed) next = closeActive(next, action.atMs, 'limit', deps);
  return next;
}
