import { addIce, emptyMix, pour, totalVolumeUnits } from './mix.ts';
import type { DerivedSession, MixEvent } from './session.ts';
import { replayMixEvents } from './session.ts';
import type { ClassicInspiredTuningProfile } from './classicProfile.ts';
import { classicMixingRules, productivePourSteps } from './classicProfile.ts';

export type ClassicPhase = 'MIXING' | 'SHAKING' | 'READY_TO_SERVE' | 'RESULT';
export interface ClassicSessionView {
  readonly derived: DerivedSession;
  readonly phase: ClassicPhase;
  readonly failed: boolean;
  readonly shakeCount: number;
  readonly completedShakeCount: number;
}
/** A production projection validates accepted domain facts. The permissive legacy projection remains available for historical tooling. */
export function replayClassicHistory(history: readonly MixEvent[], profile: ClassicInspiredTuningProfile): ClassicSessionView {
  const rules = classicMixingRules(profile);
  const derived = replayMixEvents(history, rules); // Schema, integer times, operation IDs and chronology.
  let mix = emptyMix(), phase: ClassicPhase = 'MIXING', failed = false, shakeCount = 0, completedShakeCount = 0;
  let activePour: { id: number; ingredientId: string; started: number; steps: number } | null = null;
  let activeShake: { id: number; started: number; last: number } | null = null;
  const require = (condition: boolean, message: string) => { if (!condition) throw new RangeError('Classic history: ' + message); };
  for (const event of history) {
    if (event.type === 'Reset') {
      mix = emptyMix(); phase = 'MIXING'; failed = false; shakeCount = 0; completedShakeCount = 0;
      activePour = null; activeShake = null; continue;
    }
    // Failure may close its active operation; it cannot accept more gameplay.
    require(phase !== 'RESULT' || (failed && event.type === 'ShakeEnded' && activeShake !== null), 'attempt is frozen');
    switch (event.type) {
      case 'PourStarted':
        require(phase === 'MIXING' && !activePour && !activeShake && totalVolumeUnits(mix) < profile.capacityUnits, 'pour is unavailable');
        require((Object.hasOwn(profile.score.ingredientWeights, event.ingredientId)||Object.hasOwn(profile.score.additionalIngredients??{},event.ingredientId)), 'unknown ingredient');
        activePour = { id: event.operationId, ingredientId: event.ingredientId, started: event.atMs, steps: 0 };
        break;
      case 'PourTick': {
        const op = activePour;
        require(!!op && op.id === event.operationId && op.ingredientId === event.ingredientId, 'wrong pour operation');
        if (!op) throw new RangeError('Missing pour');
        require(event.requestedUnits === profile.pour.unitsPerStep &&
          event.atMs === op.started + profile.pour.startupMs + (op.steps + 1) * profile.pour.intervalMs, 'pour tick must follow elapsed timing');
        mix = pour(mix, event.ingredientId, event.requestedUnits, rules);
        op.steps++; break;
      }
      case 'PourEnded':
        require(activePour?.id === event.operationId, 'wrong pour end');
        if (activePour) require(activePour.steps === productivePourSteps(event.atMs - activePour.started, profile), 'missing productive pour ticks');
        activePour = null; break;
      case 'IceAdded':
        require(phase === 'MIXING' && event.requestedUnits === 1 && mix.iceUnits < profile.ice.maximumActions, 'ice is unavailable');
        mix = addIce(mix, 1, rules); break;
      case 'ShakeStarted':
        require(totalVolumeUnits(mix) > 0 && !activePour && !activeShake, 'shake needs liquid and an idle shaker');
        activeShake = { id: event.operationId, started: event.atMs, last: event.atMs };
        shakeCount++; phase = 'SHAKING';
        if (shakeCount >= profile.shake.failureCount) { failed = true; phase = 'RESULT'; }
        break;
      case 'ShakeTick': {
        const op = activeShake;
        require(!!op && op.id === event.operationId, 'wrong shake operation');
        if (!op) throw new RangeError('Missing shake');
        require(event.durationMs > 0 && event.durationMs === event.atMs - op.last &&
          mix.shakeDurationMs + event.durationMs <= profile.shake.failureDurationMs, 'shake tick must follow elapsed timing');
        mix = { ...mix, shakeDurationMs: mix.shakeDurationMs + event.durationMs }; op.last = event.atMs;
        if (mix.shakeDurationMs >= profile.shake.failureDurationMs) { failed = true; phase = 'RESULT'; }
        break;
      }
      case 'ShakeEnded':
        require(activeShake?.id === event.operationId, 'wrong shake end');
        if (activeShake) require(event.atMs === activeShake.last, 'missing elapsed shake tail');
        if (activeShake && activeShake.last > activeShake.started) completedShakeCount++;
        activeShake = null;
        if (!failed) phase = completedShakeCount > 0 ? 'READY_TO_SERVE' : 'SHAKING';
        break;
      case 'GarnishChanged':
        require(phase === 'READY_TO_SERVE' && mix.garnishId === null && event.garnishId === profile.garnish.id, 'garnish is unavailable');
        mix = { ...mix, garnishId: event.garnishId }; break;
      case 'Served':
        require(phase === 'READY_TO_SERVE' && completedShakeCount > 0 && !activeShake, 'shake before serving');
        phase = 'RESULT'; break;
    }
  }
  return Object.freeze({ derived, phase, failed, shakeCount, completedShakeCount });
}
