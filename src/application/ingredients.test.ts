import test from 'node:test';import assert from 'node:assert/strict';import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { barIngredients,validateIngredientCatalog } from '../content/ingredientCatalog.ts';
import { publicVisualCatalog as visuals } from '../content/publicVisualCatalog.ts';
import { publicCatalog } from '../content/publicCatalog.ts';import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { productionStore } from '../content/storeCatalog.ts';import { recipeCatalog } from '../content/recipeCatalog.ts';
import { progressionTuning as tuning,starterContentIds } from '../content/progressionTuning.ts';
import { testIngredients,testIngredientVisuals,testIngredientContent,testIngredientStore,testIngredientRecipes,unpublishedIngredients,unpublishedIngredientContent,unpublishedIngredientRecipes,missingIngredientVisuals } from './ingredientTestFixtures.ts';
import { fundedProfile,intentFor } from './shopTestFixtures.ts';import { newTestProfile,memoryProfileStorage,testRepository } from '../platform/profileTestFixtures.ts';
import { currentPlayerProfile,validatePlayerProfileV3 } from '../domain/playerProfileV3.ts';
import { ingredientAvailability,canUseIngredient,transitionPlayerGame,shelfPage,nextShelfPage } from './ingredientAccess.ts';
import { quoteStoreOffer,purchaseOffer } from './store.ts';import { newClassicGame } from './classicGame.ts';import { gameDependencies } from './productionBootstrap.ts';
import { recipeAvailability } from '../domain/recipes.ts';import { recipeExample } from './recipeExamples.ts';
import { settleRecipeExample } from './recipeTestFixtures.ts';import { reconcilePlayerProfile } from './playerContent.ts';
import { profileStorageKey } from '../platform/localPlayerProfileRepository.ts';
import { createCompatibilityInput } from '../domain/session.ts';import type { MixEvent,MixEventData } from '../domain/session.ts';
import { classicMixingRules } from '../domain/classicProfile.ts';import { createClassicInspiredScoringEngine } from '../domain/classicScoring.ts';
import { volumeUnits } from '../domain/quantity.ts';
const buy=(p=fundedProfile(),id='botanical')=>purchaseOffer(p,intentFor(p,'offer.ingredient.'+id,testIngredientStore,testIngredientContent),testIngredientStore,testIngredientContent,2000);

test('six unique ingredients bind stable IDs, aroma, acquisition, scoring and unique final artwork publication',()=>{
  assert.equal(barIngredients.length,6);validateIngredientCatalog(barIngredients,visuals);validateIngredientCatalog(testIngredients,testIngredientVisuals);
  assert.deepEqual(barIngredients.slice(0,3).map(i=>i.id),['orchard','citrus','soda']);
  for(const i of barIngredients){assert.equal(i.contentId,'ingredient.'+i.id);assert.ok(recipeCatalog.recipes.some(r=>r.quantities[i.id]));assert.equal(i.scoring.weight,gameDependencies.profile.score.ingredientWeights[i.id]??gameDependencies.profile.score.additionalIngredients![i.id]!.weight);}
  const first=barIngredients[0]!;
  for(const ingredients of [[...barIngredients,first],barIngredients.map((i,n)=>n===3?{...i,scoring:{weight:1.5,balanceParts:1}}:i),barIngredients.map((i,n)=>n===3?{...i,acquisition:{kind:'coins' as const,price:-1,availableFromLevel:3}}:i)])assert.throws(()=>validateIngredientCatalog(ingredients,visuals));
  assert.throws(()=>validateIngredientCatalog(barIngredients,missingIngredientVisuals));validateIngredientCatalog(unpublishedIngredients,missingIngredientVisuals);
  const reused={...testIngredientVisuals,assets:{...testIngredientVisuals.assets,'ingredient.bottle05':testIngredientVisuals.assets['ingredient.bottle04']!}};assert.throws(()=>validateIngredientCatalog(testIngredients,reused));
  const copiedPixels={...testIngredientVisuals,assets:{...testIngredientVisuals.assets,'ingredient.bottle05':{...testIngredientVisuals.assets['ingredient.bottle05']!,runtime:testIngredientVisuals.assets['ingredient.bottle04']!.runtime!}}};assert.throws(()=>validateIngredientCatalog(testIngredients,copiedPixels));
});
test('the same three starters are immediately owned; level alone does not grant purchasable ingredients',()=>{
  assert.equal(starterContentIds.length,8);const p=newTestProfile(),high=fundedProfile();
  for(const i of barIngredients.slice(0,3)){assert.ok(canUseIngredient(p,i.id,visuals));assert.equal(p.ownership.filter(o=>o.contentId===i.contentId).length,1);}
  for(const i of testIngredients.slice(3)){assert.equal(ingredientAvailability(p,i,testIngredientVisuals).state,'LEVEL_REQUIRED');assert.equal(ingredientAvailability(high,i,testIngredientVisuals).state,'NOT_OWNED');}
});
test('all three coin purchases obey levels, exact prices, permanent ownership and receipt idempotence',()=>{
  for(const i of testIngredients.slice(3)){
    const id='offer.ingredient.'+i.id,low=fundedProfile(1000,1),high=fundedProfile(),q=quoteStoreOffer(low,testIngredientStore,testIngredientContent,id)!;
    assert.equal(q.state,'LOCKED');assert.equal(purchaseOffer(low,intentFor(low,id,testIngredientStore,testIngredientContent),testIngredientStore,testIngredientContent,2000).status,'OFFER_UNAVAILABLE');
    const bought=buy(high,i.id);assert.equal(bought.status,'SUCCESS');assert.equal(bought.receipt!.coinsSpent,i.acquisition.kind==='coins'?i.acquisition.price:0);
    assert.equal(bought.profile.wallet.coins,high.wallet.coins-bought.receipt!.coinsSpent);assert.deepEqual(bought.profile.progression,high.progression);assert.deepEqual(bought.profile.equippedLoadout,high.equippedLoadout);
    assert.ok(canUseIngredient(bought.profile,i.id,testIngredientVisuals,testIngredients));
    const retry=purchaseOffer(bought.profile,intentFor(high,id,testIngredientStore,testIngredientContent),testIngredientStore,testIngredientContent,2000);assert.equal(retry.status,'ALREADY_PROCESSED');assert.equal(retry.profile,bought.profile);
  }
});
test('unavailable, unowned and unpublished ingredients cannot append gameplay history; purchased ingredients can',()=>{
  const state=newClassicGame(gameDependencies),p=fundedProfile(),action={type:'PourStarted' as const,operationId:0,ingredientId:'botanical',atMs:0};
  assert.equal(transitionPlayerGame(state,action,gameDependencies,p,testIngredientVisuals,testIngredients),state);
  assert.equal(transitionPlayerGame(state,action,gameDependencies,buy().profile,missingIngredientVisuals),state);
  assert.equal(transitionPlayerGame(state,action,gameDependencies,buy().profile,testIngredientVisuals,testIngredients).session.history[0]!.type,'PourStarted');
});
test('unpublished content cannot bypass publication; production activates all six ingredients and seven recipe definitions',()=>{
  assert.deepEqual(publicCatalog.ingredients.map(i=>i.id),barIngredients.map(i=>i.id));const p=fundedProfile();
  for(const i of unpublishedIngredients.slice(3)){assert.equal(ingredientAvailability(p,i,missingIngredientVisuals).state,'UNPUBLISHED');
    const id='offer.ingredient.'+i.id;for(const store of [productionStore,testIngredientStore]){assert.equal(quoteStoreOffer(p,store,unpublishedIngredientContent,id)!.state,'UNAVAILABLE');assert.equal(purchaseOffer(p,intentFor(p,id,store,unpublishedIngredientContent),store,unpublishedIngredientContent,2000).status,'OFFER_UNAVAILABLE');}
    assert.equal(quoteStoreOffer(p,productionStore,publicContentCatalog,id)!.state,'AVAILABLE');}
  assert.equal(recipeCatalog.recipes.filter(r=>recipeAvailability(p,r,recipeCatalog).state!=='UNPUBLISHED').length,7);
  assert.equal(recipeCatalog.recipes.filter(r=>recipeAvailability(p,r,unpublishedIngredientRecipes).state!=='UNPUBLISHED').length,4);
});
test('three ingredients per shelf reuse slots deterministically and keyboard navigation clamps without wrapping',()=>{
  assert.deepEqual(shelfPage(barIngredients,0).items.map(i=>i.id),['orchard','citrus','soda']);assert.deepEqual(shelfPage(barIngredients,1).items.map(i=>i.id),['botanical','ember','blossom']);
  assert.equal(shelfPage(barIngredients,99).index,1);assert.equal(shelfPage(barIngredients,-1).index,0);assert.equal(shelfPage(barIngredients,NaN).index,0);
  assert.equal(nextShelfPage(0,'ArrowRight',2),1);assert.equal(nextShelfPage(1,'ArrowRight',2),1);assert.equal(nextShelfPage(1,'ArrowLeft',2),0);assert.equal(nextShelfPage(1,'Home',2),0);assert.equal(nextShelfPage(0,'End',2),1);assert.equal(nextShelfPage(0,'Escape',2),0);
});
test('V3 reconciliation of a genuine pre-ingredient profile adds starters without resetting mastery, goals, ledgers or paid ownership',()=>{
  const completed=settleRecipeExample().profile,paid=purchaseOffer(completed,intentFor(completed),productionStore,publicContentCatalog,2000).profile;
  const historical={...paid,ownership:paid.ownership.filter(o=>!o.contentId.startsWith('ingredient.'))};const raw=JSON.stringify(historical),storage=memoryProfileStorage({[profileStorageKey]:raw}),restored=testRepository(storage).load().profile;
  assert.equal(restored.schemaVersion,3);for(const key of ['recipeProgress','wallet','progression','stats','equippedLoadout','purchaseTransactionLedger','rewardSettlementLedger'] as const)assert.deepEqual(restored[key],historical[key]);
  assert.equal(restored.ownership.length,historical.ownership.length+3);assert.equal(reconcilePlayerProfile(restored,2000),restored);validatePlayerProfileV3(restored,tuning);
});
test('recipe availability distinguishes publication, level, missing ownership and permanent purchased access',()=>{
  const r=recipeCatalog.recipes[4]!,p=fundedProfile(),low=currentPlayerProfile(fundedProfile(1000,1),tuning);
  assert.equal(recipeAvailability(p,r,unpublishedIngredientRecipes).state,'UNPUBLISHED');assert.equal(recipeAvailability(low,r,testIngredientRecipes).state,'LEVEL_REQUIRED');
  assert.deepEqual(recipeAvailability(p,r,testIngredientRecipes),{state:'INGREDIENT_REQUIRED',missing:['botanical']});assert.equal(recipeAvailability(buy().profile,r,testIngredientRecipes).state,'AVAILABLE');
});
test('the four original recipe definitions are byte-data identical and retain their numerical drink results',()=>{
  assert.deepEqual(recipeCatalog.recipes.slice(0,4),JSON.parse(readFileSync(new URL('../content/legacyRecipes.fixture.json',import.meta.url),'utf8')));
  assert.deepEqual(recipeCatalog.recipes.slice(0,4).map(r=>recipeExample(r).state.result!.totalScore),[4225,8800,8212,8312]);
  assert.equal(recipeCatalog.goals.length,4);
});
test('new ingredient recipes differ in composition, tolerances and extras and score deterministically with integer values',()=>{
  for(const r of recipeCatalog.recipes.slice(4)){const a=recipeExample(r),b=recipeExample(r);assert.deepEqual(a,b);assert.equal(a.recipeResult.status,'PERFECT');
    assert.ok(Object.keys(r.quantities).some(id=>barIngredients.slice(3).some(i=>i.id===id)));assert.ok(Number.isSafeInteger(a.state.result!.totalScore));assert.ok(a.state.result!.totalScore>0&&a.state.result!.totalScore<=10000);
    assert.ok(Object.values(a.state.view.derived.mix.quantities).every(Number.isSafeInteger));}
});
/** Direct canonical facts avoid tying regression coverage to the UI hold scheduler. */
function legacyHistory(quantities:readonly number[],ice:number,shakes:number,garnish:boolean,reverse:boolean,duration=300){
  const history:MixEvent[]=[];let atMs=0,operationId=0,failed=false;
  const add=(event:MixEventData)=>history.push({...event,sequence:history.length,atMs});
  const entries=['orchard','citrus','soda'].map((id,n)=>({id,units:quantities[n]!}));if(reverse)entries.reverse();
  for(const {id,units}of entries){if(!units)continue;add({type:'PourStarted',operationId,ingredientId:id});atMs+=800;
    for(let n=0;n<units/3;n++){atMs+=125;add({type:'PourTick',operationId,ingredientId:id,requestedUnits:volumeUnits(3)});}add({type:'PourEnded',operationId,reason:'completed'});operationId++;atMs++;}
  for(let n=0;n<ice;n++)add({type:'IceAdded',requestedUnits:1});
  for(let n=0;n<shakes;n++){add({type:'ShakeStarted',operationId});if(n===5){failed=true;}else{atMs+=duration;add({type:'ShakeTick',operationId,durationMs:duration});failed=duration>=8000;}
    add({type:'ShakeEnded',operationId,reason:failed?'limit':'completed'});operationId++;atMs++;if(failed)break;}
  if(garnish&&!failed)add({type:'GarnishChanged',garnishId:'citrus-wheel'});if(!failed)add({type:'Served'});
  return createCompatibilityInput({schemaVersion:1,rules:classicMixingRules(gameDependencies.profile),history});
}
test('legacy exact regression: every full result matches the pre-extension engine over quantity, order, ice, garnish, shakes and failure matrix',t=>{
  const {additionalIngredients:removed,...legacyScore}=gameDependencies.profile.score;assert.equal(Object.keys(removed!).length,3);
  const prior=createClassicInspiredScoringEngine({...gameDependencies.profile,score:legacyScore});const golden=JSON.parse(readFileSync(new URL('../content/legacyScoring.fixture.json',import.meta.url),'utf8')),hash=createHash('sha256');assert.deepEqual({...gameDependencies.profile,score:legacyScore},golden.tuning);let comparisons=0;
  for(const a of [0,30,60,120])for(const b of [0,30,60,120])for(const c of [0,30,60,120]){if(a+b+c===0||a+b+c>240)continue;
    for(const ice of [0,1,2])for(const shakes of [1,2,3,5,6])for(const garnish of [false,true])for(const reverse of [false,true]){
      const input=legacyHistory([a,b,c],ice,shakes,garnish,reverse);const result=gameDependencies.scoringEngine.evaluate(input);assert.deepEqual(result,prior.evaluate(input));hash.update(JSON.stringify(result)+'\n');comparisons++;}}
  const failure=legacyHistory([120,60,60],2,1,true,false,8000);assert.deepEqual(gameDependencies.scoringEngine.evaluate(failure),prior.evaluate(failure));comparisons++;hash.update(JSON.stringify(gameDependencies.scoringEngine.evaluate(failure))+'\n');assert.equal(comparisons,golden.comparisons);assert.equal(hash.digest('hex'),golden.resultSha256);
  t.diagnostic(comparisons+' full legacy RoundResult comparisons, zero drift');
});
