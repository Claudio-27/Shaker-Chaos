import { quantityOf, totalVolumeUnits } from './mix.ts';
import type { ScoreComponent, ScoreResult, ScoringConfiguration, ScoringEngine } from './model.ts';
import { assertNonNegativeInteger } from './quantity.ts';
import { DEMO_PROJECTION_ID, replayMixEvents } from './session.ts';
import type { CompatibilityInput } from './session.ts';

const components: readonly ScoreComponent[] = ['balance', 'ice', 'shake', 'garnish'];

export function validateScoringConfiguration(config: ScoringConfiguration): void {
  if (config.verificationStatus !== 'UNVERIFIED') throw new RangeError('The demo equation cannot claim verified compatibility');
  if (!config.id.trim()) throw new RangeError('Configuration ID must not be empty');
  const parts = Object.values(config.targetParts);
  parts.forEach((value) => assertNonNegativeInteger(value, 'Target part'));
  if (!parts.length || !parts.some((value) => value > 0)) throw new RangeError('At least one target part must be positive');
  assertNonNegativeInteger(config.idealIceUnits, 'Ideal ice');
  assertNonNegativeInteger(config.idealShakeDurationMs, 'Ideal shake duration');
  if (!config.idealIceUnits || !config.idealShakeDurationMs) throw new RangeError('Demo ideals must be positive');
  for (const component of components) assertNonNegativeInteger(config.points[component], 'Component points');
  const maximum = components.reduce((sum, component) => sum + config.points[component], 0);
  assertNonNegativeInteger(maximum, 'Point budget');
  assertNonNegativeInteger(config.thresholds.balanced, 'Balanced threshold');
  assertNonNegativeInteger(config.thresholds.excellent, 'Excellent threshold');
  if (!maximum || config.thresholds.balanced > config.thresholds.excellent || config.thresholds.excellent > maximum) {
    throw new RangeError('Invalid reaction thresholds or point budget');
  }
}

function absolute(value: bigint): bigint { return value < 0n ? -value : value; }
function positive(value: bigint): bigint { return value < 0n ? 0n : value; }
function closeness(actual: number, target: number): readonly [bigint, bigint] {
  const ideal = BigInt(target);
  return [positive(ideal - absolute(BigInt(actual) - ideal)), ideal];
}
function contribution(weight: number, [numerator, denominator]: readonly [bigint, bigint]): number {
  // Exact rational arithmetic and half-up rounding. No floating-point division.
  return Number((2n * BigInt(weight) * numerator + denominator) / (2n * denominator));
}

/** NOT YET COMPATIBILITY-VERIFIED. Only the demo elects to ignore order for its score. */
export function evaluateDemoInput(input: CompatibilityInput, config: ScoringConfiguration): ScoreResult {
  validateScoringConfiguration(config);
  if (input.schemaVersion !== 1 || input.projection.id !== DEMO_PROJECTION_ID) throw new RangeError('Unsupported demo scoring input');
  // History is authoritative; a manually forged/stale derived view cannot alter scoring.
  const mix = replayMixEvents(input.history, input.projection.rules).mix;
  const volume = BigInt(totalVolumeUnits(mix));
  const targetTotal = Object.values(config.targetParts).reduce((sum, part) => sum + BigInt(part), 0n);
  const denominator = 2n * volume * targetTotal;
  const ids = new Set([...Object.keys(config.targetParts), ...Object.keys(mix.quantities)]);
  const distance = [...ids].reduce((sum, id) => {
    const part = Object.hasOwn(config.targetParts, id) ? config.targetParts[id] ?? 0 : 0;
    return sum + absolute(BigInt(quantityOf(mix, id)) * targetTotal - BigInt(part) * volume);
  }, 0n);
  const factors: Record<ScoreComponent, readonly [bigint, bigint]> = {
    balance: volume === 0n ? [0n, 1n] : [positive(denominator - distance), denominator],
    ice: closeness(mix.iceUnits, config.idealIceUnits),
    shake: closeness(mix.shakeDurationMs, config.idealShakeDurationMs),
    garnish: [mix.garnishId === config.preferredGarnishId ? 1n : 0n, 1n],
  };
  const breakdown = components.map((component) => ({ component,
    points: volume === 0n ? 0 : contribution(config.points[component], factors[component]), maximum: config.points[component] }));
  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  const maximum = breakdown.reduce((sum, item) => sum + item.maximum, 0);
  const reactionTier = volume === 0n ? 'unrated' : score >= config.thresholds.excellent ? 'excellent'
    : score >= config.thresholds.balanced ? 'balanced' : 'rough';
  return { score, maximum, reactionTier, breakdown, configurationId: config.id, verificationStatus: config.verificationStatus };
}

export function createDemoScoringEngine(config: ScoringConfiguration): ScoringEngine {
  const snapshot: ScoringConfiguration = { ...config, targetParts: { ...config.targetParts },
    points: { ...config.points }, thresholds: { ...config.thresholds } };
  validateScoringConfiguration(snapshot);
  return { configurationId: snapshot.id, verificationStatus: snapshot.verificationStatus,
    evaluate: (input) => evaluateDemoInput(input, snapshot) };
}
