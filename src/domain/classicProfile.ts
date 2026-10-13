import type { VolumeUnit } from './quantity.ts';
import { assertNonNegativeInteger, volumeUnits } from './quantity.ts';
import type { MixingRules } from './model.ts';

/** ORIGINAL SHAKER-CHAOS TUNING. No reference coefficients or physical ml mapping. */
export interface ClassicInspiredTuningProfile {
  readonly id: string;
  readonly capacityUnits: VolumeUnit;
  readonly pour: { readonly startupMs: number; readonly intervalMs: number; readonly unitsPerStep: VolumeUnit };
  readonly ice: { readonly maximumActions: number; readonly pointsPerAction: number };
  readonly garnish: { readonly id: string; readonly points: number };
  readonly shake: { readonly bonuses: readonly number[]; readonly failureCount: number; readonly failureDurationMs: number; readonly warningDurationMs: number };
  readonly score: {
    readonly maximum: number;
    readonly ingredientWeights: Readonly<Record<string, number>>;
    readonly targetParts: Readonly<Record<string, number>>;
    readonly balanceBonus: number;
    readonly tiers: readonly { readonly id: string; readonly minimum: number; readonly title: string }[];
  };
}
export function validateClassicProfile(profile: ClassicInspiredTuningProfile): void {
  volumeUnits(profile.capacityUnits);
  volumeUnits(profile.pour.unitsPerStep);
  const values = [profile.pour.startupMs, profile.pour.intervalMs, profile.ice.maximumActions, profile.ice.pointsPerAction,
    profile.garnish.points, profile.shake.failureCount, profile.shake.failureDurationMs, profile.shake.warningDurationMs,
    profile.score.maximum, profile.score.balanceBonus, ...profile.shake.bonuses,
    ...Object.values(profile.score.ingredientWeights), ...Object.values(profile.score.targetParts)];
  values.forEach(value => assertNonNegativeInteger(value, 'Classic tuning value'));
  if (!profile.id.trim() || !profile.garnish.id.trim() || profile.capacityUnits === 0 || profile.pour.unitsPerStep === 0 ||
    profile.pour.intervalMs === 0 || profile.shake.failureCount < 2 || profile.shake.failureDurationMs === 0 ||
    profile.shake.warningDurationMs >= profile.shake.failureDurationMs || profile.score.maximum === 0 ||
    profile.shake.bonuses.length !== profile.shake.failureCount) throw new RangeError('Invalid classic tuning profile');
  const modifierMaximum = BigInt(profile.ice.maximumActions) * BigInt(profile.ice.pointsPerAction) +
    BigInt(profile.garnish.points) + BigInt(Math.max(...profile.shake.bonuses));
  if (modifierMaximum > BigInt(profile.score.maximum)) throw new RangeError('Modifiers cannot exceed the score cap');
  const ids = Object.keys(profile.score.ingredientWeights);
  if (!ids.length || ids.some(id => !id.trim() || !Object.hasOwn(profile.score.targetParts, id) || !profile.score.targetParts[id]) ||
    Object.keys(profile.score.targetParts).some(id => !ids.includes(id))) throw new RangeError('Ingredient weights and target parts must match');
  let previous = -1;
  const tierIds = new Set<string>();
  for (const tier of profile.score.tiers) {
    assertNonNegativeInteger(tier.minimum, 'Tier threshold');
    if (!tier.id.trim() || !tier.title.trim() || tierIds.has(tier.id) || tier.minimum <= previous ||
      tier.minimum > profile.score.maximum) throw new RangeError('Invalid reaction thresholds');
    tierIds.add(tier.id); previous = tier.minimum;
  }
  if (profile.score.tiers[0]?.minimum !== 0) throw new RangeError('Reaction scale must start at zero');
}
export function classicMixingRules(profile: ClassicInspiredTuningProfile): MixingRules {
  validateClassicProfile(profile);
  return { capacityUnits: profile.capacityUnits, maximumIceUnits: profile.ice.maximumActions,
    maximumShakeDurationMs: profile.shake.failureDurationMs };
}
/** Integer division; overflow-free even for long safe-integer holds. */
export function productivePourSteps(elapsedMs: number, profile: ClassicInspiredTuningProfile): number {
  assertNonNegativeInteger(elapsedMs, 'Hold elapsed');
  return Number(BigInt(Math.max(0, elapsedMs - profile.pour.startupMs)) / BigInt(profile.pour.intervalMs));
}
