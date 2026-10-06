import { volumeUnits } from '../domain/quantity.ts';
import type { MixingRules, ScoringConfiguration } from '../domain/model.ts';

/** ALL values below are invented Phase 0 settings, not observed original mechanics. */
export const demoMixingRules: MixingRules = {
  capacityUnits: volumeUnits(240),
  maximumIceUnits: 8,
  maximumShakeDurationMs: 20_000,
};

export const demoScoringConfiguration: ScoringConfiguration = {
  id: 'phase-0-demo-v2',
  verificationStatus: 'UNVERIFIED',
  description: 'Formula lineare originale e temporanea. NOT YET COMPATIBILITY-VERIFIED.',
  targetParts: { orchard: 2, citrus: 1, soda: 1 },
  idealIceUnits: 4,
  idealShakeDurationMs: 6_000,
  preferredGarnishId: 'citrus-wheel',
  points: { balance: 60, ice: 15, shake: 20, garnish: 5 },
  thresholds: { balanced: 55, excellent: 85 },
};

/** UI input cadence is also a demo choice; never a compatibility coefficient. */
export const demoInput = { pourStepUnits: volumeUnits(15), pourIntervalMs: 180, shakeStepMs: 100, shakeIntervalMs: 100 } as const;

