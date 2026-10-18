import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateJourney,journeySummary,journeyDrink,playerSkills,journeyPlans} from './balance-journey.mjs';
import {recipeCatalog} from '../src/content/recipeCatalog.ts';
import {recipeAvailability} from '../src/domain/recipes.ts';
import {validatePlayerProfileV3} from '../src/domain/playerProfileV3.ts';
import {progressionTuning} from '../src/content/progressionTuning.ts';
test('complete V3 journeys replay identically and record round, ownership, rewards and choices',()=>{
  const a=simulateJourney({skill:'medio',rounds:36}),b=simulateJourney({skill:'medio',rounds:36});assert.deepEqual(a,b);
  validatePlayerProfileV3(a.profile,progressionTuning);
  assert.ok(journeySummary(a).allContent<=36);
  assert.ok(a.rows.some(r=>r.bundle.remainingIds.length===0));
  for(const row of a.rows){assert.ok(Number.isSafeInteger(row.score));assert.equal(row.balance,a.rows.slice(0,row.round).reduce((n,r)=>n+r.coinsEarned-r.coinsSpent,0));
    for(const id of row.availableRecipes){const recipe=recipeCatalog.recipes.find(r=>r.id===id);assert.ok(row.level>=recipe.availableFromLevel);for(const i of Object.keys(recipe.quantities))assert.ok(row.ingredients.includes(i));}}
});
test('all skill and spending choices traverse the current content without grants or negative balances',()=>{
  for(const skill of Object.keys(playerSkills))for(const strategy of Object.keys(journeyPlans)){
    const run=simulateJourney({skill,strategy,rounds:40}),summary=journeySummary(run);
    assert.ok(summary.allContent!==null&&summary.allContent<=40,skill+'/'+strategy);
    assert.ok(run.rows.every(r=>r.balance>=0));
    assert.equal(run.profile.wallet.coins+run.profile.wallet.lifetimeCoinsSpent,run.profile.wallet.lifetimeCoinsEarned);
    assert.ok(summary.bonus.xp<=205&&summary.bonus.coins<=85);
    for(const recipe of recipeCatalog.recipes)assert.equal(recipeAvailability(run.profile,recipe,recipeCatalog).state,'AVAILABLE');
    for(const row of run.rows.filter(r=>r.goals.includes('goal.three-recipes')))assert.ok(row.mastery.filter(m=>m.completed).length>=5);
  }
});
test('perfect stays harder than completion and petal success is reachable without broadening exact mastery',()=>{
  const recipe=recipeCatalog.recipes.at(-1),counts={FAILED:0,CLOSE:0,SUCCESS:0,PERFECT:0};
  for(let n=1;n<=120;n++)counts[journeyDrink(recipe,'medio',n,17).recipeResult.status]++;
  assert.ok(counts.SUCCESS>counts.PERFECT);assert.ok(counts.CLOSE>0&&counts.FAILED>0&&counts.PERFECT>0);
  assert.throws(()=>simulateJourney({skill:'unknown'}));assert.throws(()=>simulateJourney({rounds:0}));assert.throws(()=>simulateJourney({seed:1.5}));
});
