import test from 'node:test';import assert from 'node:assert/strict';
import { settleRecipeExample,recipeProfile } from './recipeTestFixtures.ts';
import { recipeCatalog as catalog } from '../content/recipeCatalog.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { settleRecipeRound } from '../domain/recipeProgression.ts';
import { issueRoundIdentity,settleRoundReward } from '../domain/progression.ts';
import { ownershipPolicy } from './playerContent.ts';
import { validatePlayerProfileV3 } from '../domain/playerProfileV3.ts';
import { fundedProfile,intentFor } from './shopTestFixtures.ts';
import { purchaseOffer,quoteStoreOffer } from './store.ts';
import { productionStore } from '../content/storeCatalog.ts';import { publicContentCatalog } from '../content/publicContentCatalog.ts';
test('first completion, first perfect and goals award separate small bonuses once; inferior attempts preserve best mastery',()=>{
  const start=recipeProfile(),one=settleRecipeExample(start,0,'within');assert.equal(one.reward!.newCompletion,true);assert.equal(one.reward!.newPerfect,false);
  assert.equal(one.reward!.recipeXp,15);assert.equal(one.reward!.recipeCoins,5);assert.deepEqual(one.reward!.goalIds,['goal.first-recipe']);
  const again=settleRecipeExample(one.profile,0,'within');assert.equal(again.reward!.recipeXp+again.reward!.goalXp,0);
  const perfect=settleRecipeExample(again.profile);assert.equal(perfect.reward!.newCompletion,false);assert.equal(perfect.reward!.newPerfect,true);assert.equal(perfect.reward!.recipeXp,10);assert.deepEqual(perfect.reward!.goalIds,['goal.first-perfect']);
  const repeated=settleRecipeExample(perfect.profile),worse=settleRecipeExample(repeated.profile,0,'far');
  assert.equal(repeated.reward!.recipeXp+repeated.reward!.goalXp,0);assert.equal(worse.profile.recipeProgress.mastery[0]!.bestStatus,'PERFECT');validatePlayerProfileV3(worse.profile,tuning);
  assert.equal(one.profile.progression.lifetimeXp-one.base.profile.progression.lifetimeXp,20);assert.equal(one.base.reward!.xp,one.sample.state.result?20+Math.floor(one.sample.state.result.totalScore/100):0);
});
test('one exact first attempt grants completion plus perfect; duplicate settlement cannot grant again',()=>{
  const one=settleRecipeExample();assert.equal(one.reward!.recipeXp,25);assert.equal(one.reward!.recipeCoins,10);assert.deepEqual(one.reward!.goalIds,['goal.first-recipe','goal.first-perfect']);
  const duplicate=settleRecipeRound(one.profile,one.sample.recipeResult,one.round,one.sample.state.result!,catalog,tuning,ownershipPolicy,2000);
  assert.equal(duplicate.duplicate,true);assert.equal(duplicate.profile,one.profile);assert.equal(duplicate.reward,null);
});
test('near and failed recipes do not complete mastery or goals, and unselected rounds cannot claim a recipe later',()=>{
  for(const kind of ['outside','far','no-ice'] as const){const one=settleRecipeExample(recipeProfile(),kind==='no-ice'?2:0,kind);assert.equal(one.reward!.newCompletion,false);assert.deepEqual(one.reward!.goalIds,[]);assert.equal(one.reward!.recipeCoins,0);}
  const one=settleRecipeExample(),issued=issueRoundIdentity(one.profile,'free-play',1,2000),base=settleRoundReward(issued.profile,one.sample.state.result!,issued.round,tuning,ownershipPolicy,2000);
  const free=settleRecipeRound(base.profile,null,issued.round,one.sample.state.result!,catalog,tuning,ownershipPolicy,2000);
  assert.equal(settleRecipeRound(free.profile,one.sample.recipeResult,issued.round,one.sample.state.result!,catalog,tuning,ownershipPolicy,2000).profile,free.profile);
});
test('five distinct completions spread the final goal across owned new content without repeating earlier bonuses',()=>{
  let p=recipeProfile();for(const index of [0,1,2])p=settleRecipeExample(p,index).profile;
  assert.ok(!p.recipeProgress.claimedGoalIds.includes('goal.three-recipes'));
  const bought=purchaseOffer(p,intentFor(p,'offer.ingredient.botanical'),productionStore,publicContentCatalog,2000);
  assert.equal(bought.status,'SUCCESS');p=bought.profile;
  for(const index of [3,4])p=settleRecipeExample(p,index).profile;
  assert.deepEqual(new Set(p.recipeProgress.claimedGoalIds),new Set(catalog.goals.map(g=>g.id)));assert.equal(p.recipeProgress.mastery.filter(m=>m.completed).length,5);
  const again=settleRecipeExample(p,1);assert.deepEqual(again.reward!.goalIds,[]);assert.equal(again.reward!.recipeCoins,0);
});
test('recipe reward watermark survives base ledger eviction and shop preserves mastery, XP and 2K gates',()=>{
  const one=settleRecipeExample();let p=one.profile;const short={...tuning,ledgerLimit:2};
  for(let n=0;n<4;n++){const issued=issueRoundIdentity(p,'other',n,2000),base=settleRoundReward(issued.profile,one.sample.state.result!,issued.round,short,ownershipPolicy,2000);p=settleRecipeRound(base.profile,null,issued.round,one.sample.state.result!,catalog,short,ownershipPolicy,2000).profile;}
  assert.equal(p.rewardSettlementLedger.length,2);assert.equal(settleRecipeRound(p,one.sample.recipeResult,one.round,one.sample.state.result!,catalog,short,ownershipPolicy,2000).profile,p);
  const bought=purchaseOffer(p,intentFor(p),productionStore,publicContentCatalog,2000);assert.equal(bought.status,'SUCCESS');assert.equal(bought.profile.recipeProgress,p.recipeProgress);assert.equal(bought.profile.progression,p.progression);
  assert.equal(quoteStoreOffer(fundedProfile(1000,1),productionStore,publicContentCatalog,'offer.b02')!.state,'LOCKED');
});

test('historically claimed recipe goal survives the raised requirement without revocation or a second reward',()=>{
  let p=recipeProfile();for(const index of [0,1,2])p=settleRecipeExample(p,index).profile;
  const legacy={...p,recipeProgress:{...p.recipeProgress,claimedGoalIds:[...p.recipeProgress.claimedGoalIds,'goal.three-recipes']}};
  const after=settleRecipeExample(legacy,1);
  assert.ok(after.profile.recipeProgress.claimedGoalIds.includes('goal.three-recipes'));
  assert.deepEqual(after.reward!.goalIds,[]);assert.equal(after.reward!.goalCoins,0);assert.equal(after.reward!.recipeCoins,0);
  validatePlayerProfileV3(after.profile,tuning);
});
