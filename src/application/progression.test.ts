import test from 'node:test';
import assert from 'node:assert/strict';
import { issueRoundIdentity, rewardAmounts, settleRoundReward, evaluateProgressionUnlocks } from '../domain/progression.ts';
import { createPlayerProfile, gainXp, validatePlayerProfile } from '../domain/playerProfile.ts';
import { freeGrantTuning as tuning } from './progressionTestFixtures.ts';
const p=()=>createPlayerProfile('local-synthetic',1000,{bartenderId:'b',environmentId:'e',counterId:'c',bottleSetId:'bottles',effectOverride:null},['b','e','c','bottles']);
const policy={starterIds:['b','e','c','bottles'],availablePublicIds:['b','e','c','bottles','bartender.b02','effect.ice-blue']};
const result=(totalScore=5000,failed=false,mechanicalReactionTierId='okay')=>Object.freeze({totalScore,failed,mechanicalReactionTierId});
function settle(profile=p(), score=5000, failed=false, tier='okay') {
  const issued=issueRoundIdentity(profile,'synthetic-session',profile.nextAttemptOrdinal,2000);
  return settleRoundReward(issued.profile,result(score,failed,tier),issued.round,tuning,policy,2000);
}
test('approved success/failure reward formulas use integer floor boundaries',()=>{
  for(const [score,xp,coins] of [[0,20,5],[99,20,5],[100,21,5],[249,22,5],[250,22,6],[5000,70,25],[10000,120,45]]) assert.deepEqual(rewardAmounts(result(score!),tuning),{xp,coins});
  assert.deepEqual(rewardAmounts(result(0,true,'disaster'),tuning),{xp:5,coins:2});
  for(const score of [-1,0.5,10001,NaN]) assert.throws(()=>rewardAmounts(result(score),tuning),RangeError);
  assert.throws(()=>rewardAmounts(result(1,true),tuning),RangeError);
});
test('same issued attempt settles once, retaining the frozen cocktail result',()=>{
  const original=result(), issued=issueRoundIdentity(p(),'s',0,2000), before=JSON.stringify(original);
  const one=settleRoundReward(issued.profile,original,issued.round,tuning,policy,2000);
  const two=settleRoundReward(one.profile,original,issued.round,tuning,policy,3000);
  assert.equal(two.duplicate,true);assert.equal(two.profile,one.profile);assert.equal(two.reward,one.reward);
  assert.equal(JSON.stringify(original),before);assert.equal(one.profile.stats.roundsPlayed,1);assert.equal(one.reward?.xp,70);
  assert.equal(validatePlayerProfile(one.profile,tuning),one.profile);
});
test('different identities settle independently; unissued or colliding identities cannot mint rewards',()=>{
  const one=settle(),two=settle(one.profile);assert.equal(two.profile.progression.lifetimeXp,140);assert.equal(two.profile.wallet.coins,50);
  const round=one.reward!.round;
  assert.throws(()=>settleRoundReward(one.profile,result(),{...round,ordinal:one.profile.nextAttemptOrdinal},tuning,policy,2000),RangeError);
  assert.throws(()=>settleRoundReward(one.profile,result(),{...round,sessionId:'different'},tuning,policy,2000),RangeError);
  assert.throws(()=>settleRoundReward(one.profile,result(),{...round,profileId:'other'},tuning,policy,2000),RangeError);
});
test('bounded ledger plus persistent watermark prevents old payouts even after retention eviction',()=>{
  const short={...tuning,ledgerLimit:2};let profile=p();let first: ReturnType<typeof issueRoundIdentity>['round']|null=null;
  for(let n=0;n<5;n++){const issued=issueRoundIdentity(profile,'s',n,2000);first??=issued.round;profile=settleRoundReward(issued.profile,result(0),issued.round,short,policy,2000).profile;}
  assert.equal(profile.rewardSettlementLedger.length,2);assert.equal(profile.lastSettledOrdinal,5);
  const again=settleRoundReward(profile,result(0),first!,short,policy,2000);assert.equal(again.duplicate,true);assert.equal(again.profile,profile);assert.equal(again.reward,null);
  const restored=validatePlayerProfile(JSON.parse(JSON.stringify(profile)),short);
  assert.equal(settleRoundReward(restored,result(0),first!,short,policy,2000).profile,restored);
});
test('round stats track success, failure, best/lifetime score and legendary count independently',()=>{
  const one=settle(p(),10000,false,'legendary'),two=settle(one.profile,0,true,'disaster'),three=settle(two.profile,5000);
  assert.deepEqual(three.profile.stats,{roundsPlayed:3,successfulDrinks:2,failedDrinks:1,bestScore:10000,lifetimeScore:15000,legendaryCount:1});
  assert.equal(three.profile.wallet.coins,72);assert.equal(three.profile.progression.lifetimeXp,195);
});
test('level 2/3 grants and multi-level jumps grant every qualifying item once',()=>{
  const near=gainXp(p(),99,tuning),level2=settle(near,0);
  assert.equal(level2.reward?.levelsGained,1);assert.deepEqual(level2.reward?.unlockedContentIds,['bartender.b02']);
  const near3=gainXp(level2.profile,130,tuning),level3=settle(near3,0);
  assert.deepEqual(level3.reward?.unlockedContentIds,['effect.ice-blue']);
  const large={...tuning,xp:{...tuning.xp,base:700}};const issued=issueRoundIdentity(p(),'s',0,2000);
  const jump=settleRoundReward(issued.profile,result(0),issued.round,large,policy,2000);
  assert.equal(jump.reward?.levelsGained,4);assert.deepEqual(jump.reward?.unlockedContentIds,['bartender.b02','effect.ice-blue']);
  assert.equal(evaluateProgressionUnlocks(jump.profile,large,policy,2000).profile,jump.profile);
});
