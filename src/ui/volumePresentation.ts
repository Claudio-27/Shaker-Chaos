import type { VolumeUnit } from '../domain/quantity.ts';

export interface VolumePresentation {
  readonly symbol: string;
  /** Optional presentation mapping only. Production has NONE until research establishes one. */
  readonly scale?: { readonly numerator: number; readonly denominator: number };
}
const formatter = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 });

export function formatVolumeUnits(units: VolumeUnit, presentation: VolumePresentation): string {
  const scale = presentation.scale;
  if (scale && (!Number.isSafeInteger(scale.numerator) || scale.numerator <= 0
    || !Number.isSafeInteger(scale.denominator) || scale.denominator <= 0)) {
    throw new RangeError('Display scale must use positive integer numerator and denominator');
  }
  const displayValue = scale ? units * scale.numerator / scale.denominator : units;
  return formatter.format(displayValue);
}
