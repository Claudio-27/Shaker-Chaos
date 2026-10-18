import type { PlayerProfileV3, ProgressionTuningProfile, RoundIdentity } from './playerProfile.ts';
import { addInteger, earnCoins, gainXp, immutable, integer, settlementId } from './playerProfile.ts';
import type { RecipeCatalog, RecipeMastery, RecipeResult } from './recipes.ts';
import { completedRecipe, recipeRank, recipeAvailability } from './recipes.ts';
import { evaluateProgressionUnlocks } from './progression.ts';
import type { OwnershipPolicy, RoundResult } from './progression.ts';
export interface RecipeReward {
  readonly round:RoundIdentity;readonly result:RecipeResult|null;readonly newCompletion:boolean;readonly newPerfect:boolean;readonly newRecord:boolean;
  readonly goalIds:readonly string[];readonly recipeXp:number;readonly recipeCoins:number;readonly goalXp:number;readonly goalCoins:number;
  readonly levelBefore:number;readonly levelAfter:number;
}
/** Coupled to one already settled base round; flags and watermark last forever, independent of bounded reward ledgers. */
export function settleRecipeRound(profile:PlayerProfileV3,result:RecipeResult|null,round:RoundIdentity,drink:RoundResult,catalog:RecipeCatalog,tuning:ProgressionTuningProfile,policy:OwnershipPolicy,at:number):{profile:PlayerProfileV3;reward:RecipeReward|null;duplicate:boolean} {
  integer(at,profile.updatedAt);
  integer(round.ordinal,1);if(round.profileId!==profile.profileId)throw new RangeError('Recipe profile mismatch');
  if(round.ordinal<=profile.recipeProgress.lastSettledOrdinal)return {profile,reward:null,duplicate:true};
  if(round.ordinal!==profile.lastSettledOrdinal)throw new RangeError('Recipe reward needs the current settled round');
  const base=profile.rewardSettlementLedger.find(r=>r.settlementId===settlementId(round));
  if(!base||base.round.sessionId!==round.sessionId||base.round.attemptStartSequence!==round.attemptStartSequence)throw new RangeError('Recipe round identity mismatch');
  if(result){integer(result.deviation);integer(result.precisionBps);if(!Object.hasOwn(recipeRank,result.status)||result.precisionBps>10000||(drink.failed&&result.status!=='FAILED'))throw new RangeError('Invalid recipe result');}
  const recipe=result?catalog.recipes.find(r=>r.id===result.recipeId):undefined;
  if(result&&(!recipe||recipeAvailability({...profile,progression:{...profile.progression,level:base.levelBefore}},recipe,catalog).state!=='AVAILABLE'))throw new RangeError('Recipe unavailable at round start');
  const old=profile.recipeProgress.mastery.find(m=>m.recipeId===result?.recipeId),success=!!result&&!drink.failed&&completedRecipe(result),perfect=success&&result?.status==='PERFECT';
  const newCompletion=success&&!old?.completed,newPerfect=perfect&&!old?.perfect;
  const newRecord=!!result&&(!old||recipeRank[result.status]>recipeRank[old.bestStatus]||(result.status===old.bestStatus&&result.precisionBps>old.bestPrecisionBps));
  let mastery=profile.recipeProgress.mastery;
  if(result){const next:RecipeMastery={recipeId:result.recipeId,completed:!!old?.completed||success,perfect:!!old?.perfect||perfect,
    bestStatus:newRecord?result.status:old!.bestStatus,bestPrecisionBps:newRecord?result.precisionBps:old!.bestPrecisionBps};
    mastery=old?mastery.map(m=>m===old?next:m):[...mastery,next];}
  const goalIds=catalog.goals.filter(g=>!profile.recipeProgress.claimedGoalIds.includes(g.id)&&(g.kind==='recipe-score'?success&&drink.totalScore>=g.minimumScore:
    mastery.filter(m=>g.kind==='completions'?m.completed:m.perfect).length>=g.count)).map(g=>g.id);
  const recipeXp=addInteger(newCompletion?recipe!.rewards.completion.xp:0,newPerfect?recipe!.rewards.perfect.xp:0),recipeCoins=addInteger(newCompletion?recipe!.rewards.completion.coins:0,newPerfect?recipe!.rewards.perfect.coins:0);
  const sumGoals=(key:'xp'|'coins')=>goalIds.reduce((sum,id)=>addInteger(sum,catalog.goals.find(g=>g.id===id)!.reward[key]),0);
  const goalXp=sumGoals('xp'),goalCoins=sumGoals('coins');
  const progressed=gainXp(profile,addInteger(recipeXp,goalXp),tuning);
  const granted=evaluateProgressionUnlocks(progressed,tuning,policy,at).profile;
  const next=immutable({...granted,updatedAt:at,wallet:earnCoins(profile.wallet,addInteger(recipeCoins,goalCoins)),recipeProgress:{mastery,claimedGoalIds:[...profile.recipeProgress.claimedGoalIds,...goalIds],lastSettledOrdinal:round.ordinal}});
  return {profile:next,reward:immutable({round,result,newCompletion,newPerfect,newRecord,goalIds,recipeXp,recipeCoins,goalXp,goalCoins,levelBefore:profile.progression.level,levelAfter:next.progression.level}),duplicate:false};
}
