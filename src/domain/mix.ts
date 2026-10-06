import type { MixState, MixingRules } from './model.ts';
import { addVolumeUnits, assertNonNegativeInteger, volumeUnits } from './quantity.ts';
import type { VolumeUnit } from './quantity.ts';

export function emptyMix(): MixState {
  return { quantities: {}, iceUnits: 0, shakeDurationMs: 0, garnishId: null };
}

export function quantityOf(mix: MixState, ingredientId: string): VolumeUnit {
  return volumeUnits(Object.hasOwn(mix.quantities, ingredientId) ? mix.quantities[ingredientId] ?? 0 : 0);
}

export function totalVolumeUnits(mix: MixState): VolumeUnit {
  return Object.keys(mix.quantities).sort().reduce(
    (total, id) => addVolumeUnits(total, quantityOf(mix, id)), volumeUnits(0),
  );
}

export function validateMix(mix: MixState): void {
  totalVolumeUnits(mix);
  assertNonNegativeInteger(mix.iceUnits, 'Ice units');
  assertNonNegativeInteger(mix.shakeDurationMs, 'Shake duration');
}

export function validateMixingRules(rules: MixingRules): void {
  volumeUnits(rules.capacityUnits);
  assertNonNegativeInteger(rules.maximumIceUnits, 'Maximum ice');
  assertNonNegativeInteger(rules.maximumShakeDurationMs, 'Maximum shake duration');
  if (rules.capacityUnits === 0) throw new RangeError('Capacity must be positive');
}

/** Demo projection only. History retains the requested tick even if capacity clamps it. */
export function pour(mix: MixState, ingredientId: string, requestedUnits: VolumeUnit, rules: MixingRules): MixState {
  validateMix(mix);
  validateMixingRules(rules);
  volumeUnits(requestedUnits);
  if (!ingredientId.trim()) throw new RangeError('Ingredient ID must not be empty');
  const added = volumeUnits(Math.min(requestedUnits, Math.max(0, rules.capacityUnits - totalVolumeUnits(mix))));
  if (added === 0) return mix;
  return { ...mix, quantities: { ...mix.quantities, [ingredientId]: addVolumeUnits(quantityOf(mix, ingredientId), added) } };
}

export function addIce(mix: MixState, units: number, rules: MixingRules): MixState {
  validateMix(mix);
  validateMixingRules(rules);
  assertNonNegativeInteger(units, 'Added ice');
  const available = Math.max(0, rules.maximumIceUnits - mix.iceUnits);
  return { ...mix, iceUnits: mix.iceUnits + Math.min(available, units) };
}

export function shake(mix: MixState, durationMs: number, rules: MixingRules): MixState {
  validateMix(mix);
  validateMixingRules(rules);
  assertNonNegativeInteger(durationMs, 'Added shake duration');
  if (totalVolumeUnits(mix) === 0) return mix;
  const available = Math.max(0, rules.maximumShakeDurationMs - mix.shakeDurationMs);
  return { ...mix, shakeDurationMs: mix.shakeDurationMs + Math.min(available, durationMs) };
}
