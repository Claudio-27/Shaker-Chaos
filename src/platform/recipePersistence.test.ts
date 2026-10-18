import test from 'node:test';import assert from 'node:assert/strict';
import { recipeProfile,settleRecipeExample } from '../application/recipeTestFixtures.ts';
import { fundedProfile,intentFor,fakeWebLocks } from '../application/shopTestFixtures.ts';
import { recipeExample } from '../application/recipeExamples.ts';
import { recipeCatalog } from '../content/recipeCatalog.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { currentPlayerProfile,validatePlayerProfileV3 } from '../domain/playerProfileV3.ts';
import { issueRoundIdentity,settleRoundReward } from '../domain/progression.ts';
import { settleRecipeRound } from '../domain/recipeProgression.ts';
import { ownershipPolicy } from '../application/playerContent.ts';
import { purchaseOffer } from '../application/store.ts';
import { productionStore } from '../content/storeCatalog.ts';import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { memoryProfileStorage,newTestProfile,testRepository } from './profileTestFixtures.ts';
import { profileStorageKey as key } from './localPlayerProfileRepository.ts';
import { createPlayerController } from '../application/playerController.ts';
import { createProfileWriteCoordinator } from './profileWriteCoordinator.ts';

test('V1/V2→V3 preserve all prior fields and paid receipts, adding only empty typed recipe progress',()=>{
  const funded=fundedProfile(),paid=purchaseOffer(funded,intentFor(funded),productionStore,publicContentCatalog,2000).profile;
  for(const old of [newTestProfile(),paid]){const before=JSON.stringify(old),next=currentPlayerProfile(old,tuning);
    assert.equal(next.schemaVersion,3);assert.deepEqual(next.wallet,old.wallet);assert.deepEqual(next.equippedLoadout,old.equippedLoadout);assert.deepEqual(next.stats,old.stats);assert.deepEqual(next.ownership,old.ownership);assert.deepEqual(next.progression,old.progression);
    if(old.schemaVersion===2){const {schemaVersion,recipeProgress,...rest}=next;assert.equal(schemaVersion,3);assert.deepEqual({...rest,schemaVersion:2},old);assert.deepEqual(recipeProgress,{mastery:[],claimedGoalIds:[],lastSettledOrdinal:old.lastSettledOrdinal});}
    assert.equal(JSON.stringify(old),before);validatePlayerProfileV3(next,tuning);
  }
});
test('V3 validates mastery/claim consistency, integer precision, unique IDs and settled-round watermark',()=>{
  const p=settleRecipeExample().profile,m=p.recipeProgress.mastery[0]!;
  for(const patch of [{lastSettledOrdinal:p.lastSettledOrdinal+1},{claimedGoalIds:['x','x']},{mastery:[m,m]},
    {mastery:[{...m,bestPrecisionBps:1.5}]},{mastery:[{...m,completed:false}]},{mastery:[{...m,perfect:false}]},{mastery:[{...m,bestPrecisionBps:9999}]}])assert.throws(()=>validatePlayerProfileV3({...p,recipeProgress:{...p.recipeProgress,...patch}},tuning));
});
test('completion/perfect/goals and base reward persist in one write, survive offline-style reload, and retry adds nothing',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(recipeProfile())});let writes=0;const wrapped={...storage,setItem(k:string,v:string){writes++;storage.setItem(k,v);}};
  const c=createPlayerController(testRepository(wrapped),'recipe-offline',()=>2000),recipe=recipeCatalog.recipes[0]!,sample=recipeExample(recipe);writes=0;
  c.bindAttempt(0,recipe.id);await c.settle(sample.state.result!,0,sample.state.session);assert.equal(writes,1);
  const saved=JSON.parse(storage.values.get(key)!),before=JSON.stringify(saved);assert.equal(saved.recipeProgress.mastery[0].perfect,true);assert.equal(saved.rewardSettlementLedger.length,1);assert.equal(saved.recipeProgress.claimedGoalIds.length,2);
  await c.settle(sample.state.result!,0,sample.state.session);assert.equal(storage.values.get(key),before);
  const restored=testRepository(storage).load().profile;assert.deepEqual(restored,c.snapshot().profile);validatePlayerProfileV3(restored,tuning);
});
test('quota failure retains base and recipe bonuses together in memory, and later flush does not duplicate them',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(recipeProfile())}),c=createPlayerController(testRepository(storage),'quota-recipe',()=>2000),recipe=recipeCatalog.recipes[0]!,sample=recipeExample(recipe),raw=storage.values.get(key);
  storage.failWrite(true);c.bindAttempt(0,recipe.id);await c.settle(sample.state.result!,0,sample.state.session);const p=c.snapshot().profile;
  assert.equal(c.snapshot().status,'memory');assert.equal(p.recipeProgress.mastery[0]!.perfect,true);assert.equal(storage.values.get(key),raw);
  storage.failWrite(false);await c.refresh();assert.deepEqual(testRepository(storage).load().profile,p);assert.equal(c.snapshot().status,'saved');
});
test('two locked tabs completing the same first perfect pay both base rewards and the bonuses only once',async()=>{
  const start=recipeProfile(),storage=memoryProfileStorage({[key]:JSON.stringify(start)}),locks=fakeWebLocks(),listeners=new Set<()=>void>();
  const make=(id:string)=>createPlayerController(testRepository(storage),id,()=>2000,createProfileWriteCoordinator({requestLock:locks.request,listen(fn){listeners.add(fn);return()=>listeners.delete(fn);},broadcast(){for(const fn of listeners)fn();}}));
  const a=make('a'),b=make('b'),offA=a.subscribe(()=>{}),offB=b.subscribe(()=>{}),recipe=recipeCatalog.recipes[0]!,sample=recipeExample(recipe);
  a.bindAttempt(0,recipe.id);b.bindAttempt(0,recipe.id);await Promise.all([b.settle(sample.state.result!,0,sample.state.session),a.settle(sample.state.result!,0,sample.state.session)]);await b.refresh();
  const p=testRepository(storage).load().profile,baseCoins=5+Math.floor(sample.state.result!.totalScore/250),baseXp=20+Math.floor(sample.state.result!.totalScore/100);
  assert.equal(p.wallet.coins,start.wallet.coins+2*baseCoins+16);assert.equal(p.progression.lifetimeXp,start.progression.lifetimeXp+2*baseXp+35);assert.equal(p.stats.roundsPlayed,2);
  assert.equal(p.recipeProgress.mastery.length,1);assert.equal(p.recipeProgress.claimedGoalIds.length,2);assert.equal(p.recipeProgress.lastSettledOrdinal,2);assert.equal(b.snapshot().profile.wallet.coins,p.wallet.coins);offA();offB();
});
test('a locked recipe cannot earn a bonus, migration blocks retroactive claims, and reset hides late feedback',async()=>{
  const low=currentPlayerProfile(newTestProfile(),tuning),c=createPlayerController(testRepository(memoryProfileStorage({[key]:JSON.stringify(low)})),'locked-recipe',()=>2000),sample=recipeExample(recipeCatalog.recipes[3]!);
  c.bindAttempt(0,recipeCatalog.recipes[3]!.id);await c.settle(sample.state.result!,0,sample.state.session);assert.equal(c.snapshot().recipeReward!.result,null);assert.equal(c.snapshot().profile.recipeProgress.mastery.length,0);
  const old=issueRoundIdentity(fundedProfile(),'historical',0,2000),base=settleRoundReward(old.profile,sample.state.result!,old.round,tuning,ownershipPolicy,2000),migrated=currentPlayerProfile(base.profile,tuning);
  assert.equal(settleRecipeRound(migrated,sample.recipeResult,old.round,sample.state.result!,recipeCatalog,tuning,ownershipPolicy,2000).duplicate,true);
  const locks=fakeWebLocks(),queued=createPlayerController(testRepository(memoryProfileStorage({[key]:JSON.stringify(recipeProfile())})),'late-recipe',()=>2000,createProfileWriteCoordinator({requestLock:locks.request,listen:()=>()=>{},broadcast(){}}));
  queued.bindAttempt(0,recipeCatalog.recipes[0]!.id);const pending=queued.settle(recipeExample(recipeCatalog.recipes[0]!).state.result!,0,recipeExample(recipeCatalog.recipes[0]!).state.session);queued.clearAttempt();await pending;
  assert.equal(queued.snapshot().recipeReward,null);assert.equal(queued.snapshot().reward,null);assert.equal(queued.snapshot().profile.recipeProgress.mastery.length,1);
});
