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

/** Reasons describe existing acceptance rules; they never enable a control or dispatch an action. */
export function controlHelp(state:ClassicGameState,profile:ClassicInspiredTuningProfile,hasIngredient:boolean){
  const ui=gameplayPresentation(state,profile,hasIngredient),mix=state.view.derived.mix,volume=totalVolumeUnits(mix);
  const done='Scegli Nuovo drink per preparare un altro mix.';
  return {
    pour:ui.terminal?done:!ui.mixing?'Hai già agitato: per cambiare ingredienti ricomincia il mix.':!hasIngredient?'Scegli una bottiglia posseduta, oppure visita il Negozio in Collezione.':volume>=profile.capacityUnits?'Lo shaker è pieno. Rilascia Versa e passa ad Agita.':'Tieni premuto per versare; rilascia per fermarti.',
    shake:ui.terminal?done:volume===0?'Versa prima un po’ di mix.':ui.pouring?'Rilascia Versa prima di agitare.':'Tieni premuto Agita, poi rilascia per poter servire.',
    serve:ui.terminal?done:ui.controls.serve?'Il mix è pronto: premi Servi.':'Versa, agita e rilascia Agita prima di servire.',
    ice:!ui.mixing?'Il ghiaccio si aggiunge prima di Agita.':mix.iceUnits>=profile.ice.maximumActions?'Hai già aggiunto tutto il ghiaccio disponibile.':'Aggiungi ghiaccio prima di agitare, fino a due volte.',
    garnish:mix.garnishId?'Agrume già aggiunto.':ui.controls.garnish?'Aggiungi l’agrume, poi servi.':'L’agrume si aggiunge dopo aver agitato e rilasciato, prima di Servi.',
  };
}
