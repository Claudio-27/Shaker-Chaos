import type { ProgressionTuningProfile } from '../domain/playerProfile.ts';
import { immutable } from '../domain/playerProfile.ts';
/** ORIGINAL SHAKER-CHAOS progression values approved for Phase 2C. */
export const progressionTuning: ProgressionTuningProfile = immutable({
  id: 'shaker-chaos-progression-v1', scoreMaximum: 10000, legendaryTierId: 'legendary',
  xp: { base: 20, scoreDivisor: 100, failure: 5 }, coins: { base: 5, scoreDivisor: 250, failure: 2 },
  levels: { firstRequirement: 100, increment: 50, technicalMaximum: 1000000 }, ledgerLimit: 128,
  unlocks: [
    { requirementId: 'level-2-bartender', contentId: 'bartender.b02', minimumLevel: 2 },
    { requirementId: 'level-3-effect', contentId: 'effect.ice-blue', minimumLevel: 3 },
  ],
});
export const starterContentIds = ['bartender.b01','environment.e01','counter.c01','bottles.supplied','effect.sparkles'] as const;
