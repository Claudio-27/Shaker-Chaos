/** Canonical counts, not millilitres. No physical conversion is defined. */
declare const volumeUnitBrand: unique symbol;
export type VolumeUnit = number & { readonly [volumeUnitBrand]: 'VolumeUnit' };

export function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative safe integer`);
  }
}

export function volumeUnits(value: number): VolumeUnit {
  assertNonNegativeInteger(value, 'Volume units');
  return value as VolumeUnit;
}

export function addVolumeUnits(left: VolumeUnit, right: VolumeUnit): VolumeUnit {
  volumeUnits(left);
  volumeUnits(right);
  return volumeUnits(left + right);
}
