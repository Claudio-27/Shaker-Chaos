import { volumeUnits } from '../domain/quantity.ts';

/**
 * Original Shaker-Chaos tuning selected on 2026-10-13.
 * Approximate design values, NOT a verified reference mapping or scoring engine.
 * Versioned for the next gameplay implementation; the Phase 0 demo remains active.
 * Provenance and tradeoffs: docs/APPROXIMATE_GAMEPLAY_TUNING.md (not a runtime dependency).
 */
export const approximateGameplayProfile = {
  id: 'shaker-chaos-approx-v1',
  verificationStatus: 'UNVERIFIED',
  purpose: 'original-gameplay-tuning',
  activeInDemo: false,
  quantity: { capacityUnits: volumeUnits(240), displaySymbol: 'u', milliliterMapping: null },
  pour: {
    startupMs: 800, intervalMs: 125, stepUnits: volumeUnits(3),
    firstTick: 'startup-plus-interval', restartStartupForEachOperation: true,
  },
  phase: {
    requireCompletedShakeBeforeServe: true,
    liquidAdditionAfterFirstShake: false, iceAdditionAfterFirstShake: false,
    rewardedGarnish: 'after-shake-before-serve',
  },
  ice: { maximumActions: 8, rewardedActions: 2, pointsPerRewardedAction: 500, maximumBonus: 1000 },
  shake: {
    minimumQualifyingActionMs: 500, creditedDurationCapMs: 4000,
    multiActionEffort: 1, fifthActionEffort: 1,
    effortBonuses: [{ minimumEffort: 0, points: 0 }, { minimumEffort: 4, points: 5 },
      { minimumEffort: 5, points: 15 }, { minimumEffort: 6, points: 30 }],
    maximumBonus: 30,
    failureAtCumulativeMs: 8000, failureAtQualifyingActionCount: 6,
    failureEvaluation: 'release-or-serve', failureScore: 0,
  },
  garnish: { maximumRewardedActions: 1, points: 100 },
  scoring: {
    maximum: 10000, compositionBudget: 8870,
    targetParts: { orchard: 2, citrus: 1, soda: 1 },
    balancedThreshold: 5500, excellentThreshold: 8500,
    arithmetic: 'integer-rational', referenceIngredientMapping: null,
  },
} as const;

