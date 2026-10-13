import type { ScoreResult, ScoringEngine, ScoreBreakdown } from './model.ts';
import type { CompatibilityInput } from './session.ts';
import type { ClassicInspiredTuningProfile } from './classicProfile.ts';
import { validateClassicProfile } from './classicProfile.ts';
import { replayClassicHistory } from './classicSession.ts';
import { totalVolumeUnits } from './mix.ts';

export interface ClassicScoreResult extends ScoreResult {
  readonly ingredientScore: number;
  readonly iceScore: number;
  readonly garnishScore: number;
  readonly shakeScore: number;
  readonly totalScore: number;
  readonly failed: boolean;
  readonly exploded: boolean;
  readonly mechanicalReactionTierId: string;
}
export interface ClassicInspiredScoringEngine extends ScoringEngine {
  readonly evaluate: (input: CompatibilityInput) => ClassicScoreResult;
}
/** Canonical history is authoritative. Cached totals/display conversions cannot change scoring. */
export function evaluateClassicHistory(input: Pick<CompatibilityInput, 'history'>, profile: ClassicInspiredTuningProfile): ClassicScoreResult {
  validateClassicProfile(profile);
  const session = replayClassicHistory(input.history, profile), mix = session.derived.mix;
  const volume = BigInt(totalVolumeUnits(mix)), capacity = BigInt(profile.capacityUnits);
  let ingredientScore = 0;
  if (volume > 0n) {
    const targetTotal = Object.values(profile.score.targetParts).reduce((sum, part) => sum + BigInt(part), 0n);
    let weighted = 0n, distance = 0n;
    for (const [id, weight] of Object.entries(profile.score.ingredientWeights)) {
      const units = BigInt(mix.quantities[id] ?? 0);
      weighted += units * BigInt(weight);
      const delta = units * targetTotal - BigInt(profile.score.targetParts[id]!) * volume;
      distance += delta < 0n ? -delta : delta;
    }
    const denominator = 2n * volume * targetTotal;
    const closeness = denominator - distance;
    const balance = BigInt(profile.score.balanceBonus) * volume * closeness * closeness / (capacity * denominator * denominator);
    ingredientScore = Number((weighted / capacity + balance) > BigInt(profile.score.maximum)
      ? BigInt(profile.score.maximum) : weighted / capacity + balance);
  }
  const iceScore = mix.iceUnits * profile.ice.pointsPerAction;
  const garnishScore = mix.garnishId ? profile.garnish.points : 0;
  const shakeScore = profile.shake.bonuses[Math.min(session.shakeCount, profile.shake.bonuses.length - 1)] ?? 0;
  ingredientScore = Math.min(ingredientScore, profile.score.maximum - iceScore - garnishScore - shakeScore);
  const total = BigInt(ingredientScore) + BigInt(iceScore) + BigInt(garnishScore) + BigInt(shakeScore);
  const totalScore = session.failed ? 0 : Number(total > BigInt(profile.score.maximum) ? BigInt(profile.score.maximum) : total);
  const tier = [...profile.score.tiers].reverse().find(item => totalScore >= item.minimum)!;
  // Compatibility-only legacy field. Artwork uses the separate mechanical-tier presentation mapping.
  const reactionTier = 'unrated'; // Production presentation uses only mechanicalReactionTierId.
  const points = session.failed ? [0, 0, 0, 0] : [ingredientScore, iceScore, garnishScore, shakeScore];
  return Object.freeze({
    ingredientScore: points[0]!, iceScore: points[1]!, garnishScore: points[2]!, shakeScore: points[3]!,
    score: totalScore, totalScore, maximum: profile.score.maximum,
    failed: session.failed, exploded: session.failed, mechanicalReactionTierId: tier.id, reactionTier,
    configurationId: profile.id, verificationStatus: 'UNVERIFIED',
    breakdown: Object.freeze(([
      { component: 'balance', points: points[0]!, maximum: profile.score.maximum },
      { component: 'ice', points: points[1]!, maximum: profile.ice.maximumActions * profile.ice.pointsPerAction },
      { component: 'garnish', points: points[2]!, maximum: profile.garnish.points },
      { component: 'shake', points: points[3]!, maximum: Math.max(...profile.shake.bonuses) },
    ] satisfies readonly ScoreBreakdown[]).map(item => Object.freeze(item))),
  });
}
export function createClassicInspiredScoringEngine(profile: ClassicInspiredTuningProfile): ClassicInspiredScoringEngine {
  // Snapshot configuration: later DEV/editor mutations cannot silently change a live engine.
  const snapshot = structuredClone(profile);
  validateClassicProfile(snapshot);
  return Object.freeze({ configurationId: snapshot.id, verificationStatus: 'UNVERIFIED',
    evaluate: (input: CompatibilityInput) => evaluateClassicHistory(input, snapshot) });
}
