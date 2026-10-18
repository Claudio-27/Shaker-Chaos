import type { PlayerProfile, PlayerProfileV2, PlayerProfileV3, ProgressionTuningProfile } from './playerProfile.ts';
import { identifier, immutable, integer } from './playerProfile.ts';
import { migrateV1ToV2, validatePlayerProfileV2 } from './playerProfileV2.ts';
import type { RecipeMastery } from './recipes.ts';
import { emptyRecipeProgress, recipeRank } from './recipes.ts';
/** Existing fields, ledgers and timestamps survive exactly. Historical rounds cannot claim new recipe rewards. */
export function migrateV2ToV3(profile:PlayerProfileV2,tuning:ProgressionTuningProfile):PlayerProfileV3 {
  validatePlayerProfileV2(profile,tuning);return validatePlayerProfileV3({...profile,schemaVersion:3,recipeProgress:emptyRecipeProgress(profile.lastSettledOrdinal)},tuning);
}
export function validatePlayerProfileV3(value:unknown,tuning:ProgressionTuningProfile):PlayerProfileV3 {
  if(!value||typeof value!=='object'||!('schemaVersion'in value)||value.schemaVersion!==3)throw new RangeError('Expected profile schema 3');
  const p=value as PlayerProfileV3;validatePlayerProfileV2({...p,schemaVersion:2},tuning);
  const r=p.recipeProgress;if(!r||!Array.isArray(r.mastery)||!Array.isArray(r.claimedGoalIds)||r.mastery.length>10000||r.claimedGoalIds.length>10000)throw new RangeError('Invalid recipe progress');
  integer(r.lastSettledOrdinal);if(r.lastSettledOrdinal>p.lastSettledOrdinal)throw new RangeError('Future recipe settlement');
  const ids=new Set<string>();for(const m of r.mastery as readonly RecipeMastery[]){if(!m||typeof m!=='object')throw new RangeError('Invalid mastery');identifier(m.recipeId);
    if(ids.has(m.recipeId)||!Object.hasOwn(recipeRank,m.bestStatus)||typeof m.completed!=='boolean'||typeof m.perfect!=='boolean')throw new RangeError('Invalid mastery state');ids.add(m.recipeId);
    integer(m.bestPrecisionBps);if(m.bestPrecisionBps>10000||m.completed!==(recipeRank[m.bestStatus]>=2)||m.perfect!==(m.bestStatus==='PERFECT')||(m.perfect&&m.bestPrecisionBps!==10000))throw new RangeError('Inconsistent mastery');
  }
  r.claimedGoalIds.forEach(identifier);if(new Set(r.claimedGoalIds).size!==r.claimedGoalIds.length)throw new RangeError('Duplicate goal claim');
  return immutable(p);
}
export function currentPlayerProfile(profile:PlayerProfile,tuning:ProgressionTuningProfile):PlayerProfileV3 {
  return profile.schemaVersion===3?validatePlayerProfileV3(profile,tuning):migrateV2ToV3(profile.schemaVersion===1?migrateV1ToV2(profile,tuning):profile,tuning);
}
