import { barIngredients } from './ingredientCatalog.ts';
import type { ProgressionTuningProfile } from '../domain/playerProfile.ts';
import { immutable } from '../domain/playerProfile.ts';
/** Original 2C reward/XP curve unchanged; free-grant policy revised in Phase 2K. */
export const progressionTuning: ProgressionTuningProfile = immutable({
  id: 'shaker-chaos-progression-v1', scoreMaximum: 10000, legendaryTierId: 'legendary',
  xp: { base: 20, scoreDivisor: 100, failure: 5 }, coins: { base: 5, scoreDivisor: 250, failure: 2 },
  levels: { firstRequirement: 100, increment: 50, technicalMaximum: 1000000 }, ledgerLimit: 128,
  // Only intentional FREE progression grants belong here. Purchase gates live in currency metadata.
  unlocks: barIngredients.filter(i=>i.acquisition.kind==='progression'&&i.published).map(i=>({contentId:i.contentId,requirementId:i.acquisition.kind==='progression'?i.acquisition.requirementId:'',minimumLevel:i.acquisition.kind==='progression'?i.acquisition.availableFromLevel:1})),
});
export const starterContentIds = ['bartender.b01','environment.e01','counter.c01','bottles.supplied','effect.sparkles',...barIngredients.filter(i=>i.acquisition.kind==='starter'&&i.published).map(i=>i.contentId)] as const;
