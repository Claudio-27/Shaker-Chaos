import test from 'node:test';import assert from 'node:assert/strict';
import { constantPacing, simulateEconomy, simulationMilestones, scenarios, strategies } from './economy-simulation.mjs';
import { validatePlayerProfileV2 } from '../src/domain/playerProfileV2.ts';
import { progressionTuning } from '../src/content/progressionTuning.ts';
test('economy analysis uses approved integer rewards and XP thresholds for five outcomes',()=>{
  const rows=constantPacing();assert.deepEqual(rows.map(r=>[r.xp,r.coins]),[[5,2],[35,11],[70,25],[105,39],[115,43]]);
  assert.deepEqual(rows[2].levels.map(l=>l.round),[2,4,7,10,15]);assert.deepEqual(rows[2].funds.map(p=>p.round),[6,12,16]);
});
test('economy simulation repeats exactly, respects actual level availability and never invents free ownership',()=>{
  for(const results of Object.values(scenarios)){
    const one=simulateEconomy({results}),two=simulateEconomy({results});assert.deepEqual(two,one);
    assert.equal(one.profile.ownership.length,5);validatePlayerProfileV2(one.profile,progressionTuning);
    for(const r of one.rows){assert.ok(Number.isSafeInteger(r.coinsAvailable));assert.equal(r.coinsAvailable,r.lifetimeCoinsEarned);}
  }
  const mid=simulateEconomy({results:scenarios.medio});
  assert.deepEqual(simulationMilestones(mid).offers,[{offerId:'offer.b02',availableAt:4,affordableAt:12},{offerId:'offer.ice-blue',availableAt:2,affordableAt:6},{offerId:'offer.new-shift',availableAt:15,affordableAt:16}]);
});
test('real purchases in simulation conserve coins, preserve XP/stats and show the early-equip versus savings tradeoff',()=>{
  const results=scenarios.medio,saver=simulateEconomy({results}),bundle=simulateEconomy({results,purchasePlan:strategies.bundle}),early=simulateEconomy({results,purchasePlan:['offer.ice-blue','offer.new-shift']});
  assert.deepEqual(bundle.profile.progression,saver.profile.progression);assert.deepEqual(early.profile.stats,saver.profile.stats);
  assert.deepEqual(simulationMilestones(bundle).purchases,[{round:16,offerId:'offer.new-shift',coins:382}]);
  assert.deepEqual(simulationMilestones(early).purchases,[{round:6,offerId:'offer.ice-blue',coins:150},{round:17,offerId:'offer.new-shift',coins:255}]);
  for(const simulation of [bundle,early]){const spent=simulation.rows.flatMap(r=>r.purchases).reduce((sum,p)=>sum+p.coins,0);
    assert.equal(simulation.profile.wallet.lifetimeCoinsSpent,spent);assert.equal(simulation.profile.wallet.coins+spent,1000);
    assert.equal(simulation.profile.ownership.length,7);assert.deepEqual(simulation.profile.equippedLoadout,saver.profile.equippedLoadout);validatePlayerProfileV2(simulation.profile,progressionTuning);}
  assert.throws(()=>simulateEconomy({results:[],rounds:40}));assert.throws(()=>simulateEconomy({results,rounds:1.5}));assert.throws(()=>simulateEconomy({results,purchasePlan:['absent']}));
});
