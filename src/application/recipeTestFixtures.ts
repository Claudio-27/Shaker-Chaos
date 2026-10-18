import { currentPlayerProfile } from '../domain/playerProfileV3.ts';
import type { PlayerProfileV3 } from '../domain/playerProfile.ts';
import { fundedProfile } from './shopTestFixtures.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { issueRoundIdentity, settleRoundReward } from '../domain/progression.ts';
import { settleRecipeRound } from '../domain/recipeProgression.ts';
import { recipeCatalog } from '../content/recipeCatalog.ts';
import { ownershipPolicy } from './playerContent.ts';
import { recipeExample } from './recipeExamples.ts';
import type { RecipeExample } from './recipeExamples.ts';
export const recipeProfile=()=>currentPlayerProfile(fundedProfile(),progressionTuning);
export function settleRecipeExample(profile:PlayerProfileV3=recipeProfile(),index=0,example:RecipeExample='exact'){
  const sample=recipeExample(recipeCatalog.recipes[index]!,example),at=Math.max(2000,profile.updatedAt);
  const issued=issueRoundIdentity(profile,'recipe-test',0,at),base=settleRoundReward(issued.profile,sample.state.result!,issued.round,progressionTuning,ownershipPolicy,at);
  return {...settleRecipeRound(base.profile,sample.recipeResult,issued.round,sample.state.result!,recipeCatalog,progressionTuning,ownershipPolicy,at),base,sample,round:issued.round};
}
