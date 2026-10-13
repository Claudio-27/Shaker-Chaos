import type { ClassicGameState } from '../application/classicGame.ts';
import type { ClassicInspiredTuningProfile } from '../domain/classicProfile.ts';
import { totalVolumeUnits } from '../domain/mix.ts';
import { playerCopy } from '../content/playerExperience.ts';

export type PlayerPhase = 'mix' | 'shake' | 'serve' | 'result';
export type PourFeedback = 'idle' | 'preparing' | 'pouring';
export type ShakeRisk = 'safe' | 'warming' | 'risky' | 'danger';
export function shakeRisk(count: number, durationMs: number, profile: ClassicInspiredTuningProfile): ShakeRisk {
  if (count >= profile.shake.failureCount - 1 || durationMs >= profile.shake.warningDurationMs) return 'danger';
  if (count >= profile.shake.failureCount - 2 || durationMs >= Math.floor(profile.shake.warningDurationMs * 2 / 3)) return 'risky';
  if (count >= profile.shake.failureCount - 3 || durationMs >= Math.floor(profile.shake.warningDurationMs / 2)) return 'warming';
  return 'safe';
}
/** Pure UI selectors; acceptance, duration and score still belong to the domain/application. */
export function gameplayPresentation(state: ClassicGameState, profile: ClassicInspiredTuningProfile, hasIngredient: boolean) {
  const view = state.view, mix = view.derived.mix, volume = totalVolumeUnits(mix);
  const terminal = view.phase === 'RESULT', mixing = view.phase === 'MIXING';
  const pour = view.derived.pours.find(op => op.endedAtMs === null);
  const shaking = view.derived.shakes.some(op => op.endedAtMs === null);
  const phase: PlayerPhase = terminal ? 'result' : mixing ? 'mix' : view.phase === 'READY_TO_SERVE' ? 'serve' : 'shake';
  const pourFeedback: PourFeedback = !pour ? 'idle' : pour.ticks.length ? 'pouring' : 'preparing';
  const risk = shakeRisk(view.shakeCount, mix.shakeDurationMs, profile);
  const ready = view.phase === 'READY_TO_SERVE' && !pour && !shaking;
  return {
    phase, terminal, mixing, pouring: !!pour, shaking, pourFeedback, risk,
    instruction: phase === 'mix' ? volume === 0 ? playerCopy.instructions.empty : playerCopy.instructions.mix : playerCopy.instructions[phase],
    controls: {
      ingredient: mixing && !pour,
      pour: mixing && hasIngredient && volume < profile.capacityUnits,
      shake: !terminal && volume > 0 && !pour,
      ice: mixing && mix.iceUnits < profile.ice.maximumActions,
      garnish: ready && mix.garnishId === null,
      serve: ready,
      reset: terminal || view.derived.pours.length > 0 || view.shakeCount > 0 || mix.iceUnits > 0 || mix.garnishId !== null,
    },
  } as const;
}
/** A click burst can request one reset; the empty next attempt stays unavailable. */
export function createResetGuard() {
  let pending = false;
  return {
    request(allowed: boolean): boolean { if (!allowed || pending) return false; pending = true; return true; },
    settled() { pending = false; },
  };
}
