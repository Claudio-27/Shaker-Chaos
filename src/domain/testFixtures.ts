/** Synthetic software fixtures only. No reference-game values or physical unit mapping. */
import { appendMixEvent, createCompatibilityInput, newSession } from './session.ts';
import type { CocktailSession, MixEventData } from './session.ts';
import { volumeUnits } from './quantity.ts';
import type { MixingRules } from './model.ts';

export const syntheticRules: MixingRules = {
  capacityUnits: volumeUnits(Number.MAX_SAFE_INTEGER), maximumIceUnits: 100, maximumShakeDurationMs: 100_000,
};
export function sessionFrom(events: readonly { readonly data: MixEventData; readonly atMs: number }[], rules = syntheticRules): CocktailSession {
  return events.reduce((session, item) => appendMixEvent(session, item.data, item.atMs), newSession(rules));
}
export function inputForMix(quantities: Readonly<Record<string, number>>, iceUnits = 2, shakeDurationMs = 1000, garnishId: string | null = 'g') {
  let session = newSession(syntheticRules);
  let operationId = 0;
  let atMs = 0;
  const record = (data: MixEventData) => { session = appendMixEvent(session, data, atMs++); };
  for (const [ingredientId, amount] of Object.entries(quantities)) {
    record({ type: 'PourStarted', ingredientId, operationId });
    record({ type: 'PourTick', ingredientId, operationId, requestedUnits: volumeUnits(amount) });
    record({ type: 'PourEnded', operationId: operationId++, reason: 'completed' });
  }
  record({ type: 'IceAdded', requestedUnits: iceUnits });
  record({ type: 'ShakeStarted', operationId });
  record({ type: 'ShakeTick', operationId, durationMs: shakeDurationMs });
  record({ type: 'ShakeEnded', operationId, reason: 'completed' });
  record({ type: 'GarnishChanged', garnishId });
  return createCompatibilityInput(session);
}

