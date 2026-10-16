/** Synthetic intentional free grants, matching the historical 2C/2J policy. Test-only. */
import { progressionTuning } from '../content/progressionTuning.ts';
import { gainXp } from '../domain/playerProfile.ts';
import type { PlayerProfile } from '../domain/playerProfile.ts';
import { evaluateProgressionUnlocks } from '../domain/progression.ts';
import { ownershipPolicy } from './playerContent.ts';
export const freeGrantTuning = { ...progressionTuning, unlocks: [
  { requirementId: 'level-2-bartender', contentId: 'bartender.b02', minimumLevel: 2 },
  { requirementId: 'level-3-effect', contentId: 'effect.ice-blue', minimumLevel: 3 },
] };
export function withFreeGrants<P extends PlayerProfile>(profile:P,xp=100) {
  return evaluateProgressionUnlocks(gainXp(profile,xp,freeGrantTuning),freeGrantTuning,ownershipPolicy,2000).profile;
}
