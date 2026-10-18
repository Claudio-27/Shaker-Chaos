import test from 'node:test';import assert from 'node:assert/strict';
import { barIngredients as testIngredients } from '../content/ingredientCatalog.ts';
import { publicVisualCatalog as testIngredientVisuals } from '../content/publicVisualCatalog.ts';
import { publicContentCatalog as testIngredientContent } from '../content/publicContentCatalog.ts';
import { productionStore as testIngredientStore } from '../content/storeCatalog.ts';
import { recipeCatalog as testIngredientRecipes } from '../content/recipeCatalog.ts';
import { fundedProfile,intentFor,fakeWebLocks } from '../application/shopTestFixtures.ts';
import { currentPlayerProfile,validatePlayerProfileV3 } from '../domain/playerProfileV3.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { createPlayerController } from '../application/playerController.ts';
import { createProfileWriteCoordinator } from './profileWriteCoordinator.ts';
import { memoryProfileStorage,testRepository } from './profileTestFixtures.ts';
import { profileStorageKey as key } from './localPlayerProfileRepository.ts';
import { recipeExample } from '../application/recipeExamples.ts';
import { transitionPlayerGame,canUseIngredient } from '../application/ingredientAccess.ts';
import { gameDependencies } from '../application/productionBootstrap.ts';
import { newClassicGame } from '../application/classicGame.ts';
const content={catalog:testIngredientContent,store:testIngredientStore,recipes:testIngredientRecipes};
const makeIntent=(p:Parameters<typeof intentFor>[0])=>intentFor(p,'offer.ingredient.botanical',content.store,content.catalog);
test('production ingredients: offline purchase → select → drink → new recipe/mastery → reload uses default V3 services',async()=>{
  for(const recipe of content.recipes.recipes.slice(4)){
    const ingredient=testIngredients.slice(3).find(i=>recipe.quantities[i.id])!,offerId='offer.'+ingredient.contentId,price=ingredient.acquisition.kind==='coins'?ingredient.acquisition.price:0;
    const initial=currentPlayerProfile(fundedProfile(),tuning),storage=memoryProfileStorage({[key]:JSON.stringify(initial)}),c=createPlayerController(testRepository(storage),'ingredient-offline',()=>2000);
    const before=c.snapshot().profile,intent=intentFor(before,offerId),bought=await c.purchase(intent);assert.equal(bought.status,'SUCCESS');assert.equal(bought.persistence,'saved');
    assert.ok(canUseIngredient(c.snapshot().profile,ingredient.id,testIngredientVisuals));
    const pour=transitionPlayerGame(newClassicGame(gameDependencies),{type:'PourStarted',ingredientId:ingredient.id,operationId:0,atMs:0},gameDependencies,c.snapshot().profile,testIngredientVisuals);assert.equal(pour.session.history.length,1);
    const sample=recipeExample(recipe);c.bindAttempt(0,recipe.id);await c.settle(sample.state.result!,0,sample.state.session);
    const p=c.snapshot().profile;assert.equal(p.recipeProgress.mastery.find(m=>m.recipeId===recipe.id)!.perfect,true);assert.equal(p.purchaseTransactionLedger.length,1);assert.equal(p.rewardSettlementLedger.length,1);
    assert.equal(p.wallet.coins,initial.wallet.coins-price+5+Math.floor(sample.state.result!.totalScore/250)+(sample.state.result!.totalScore>=8500?20:16));validatePlayerProfileV3(p,tuning);
    assert.deepEqual(testRepository(storage).load().profile,p);const again=createPlayerController(testRepository(storage),'ingredient-reload',()=>2000);assert.equal((await again.purchase(intent)).status,'ALREADY_PROCESSED');assert.deepEqual(again.snapshot().profile.recipeProgress,p.recipeProgress);
  }
});
test('two coordinated offline tabs buying the same ingredient debit once and propagate ownership, receipt and recipe access',async()=>{
  const initial=currentPlayerProfile(fundedProfile(),tuning),storage=memoryProfileStorage({[key]:JSON.stringify(initial)}),locks=fakeWebLocks(),listeners=new Set<()=>void>();
  const make=(id:string)=>createPlayerController(testRepository(storage),id,()=>2000,createProfileWriteCoordinator({requestLock:locks.request,listen(fn){listeners.add(fn);return()=>listeners.delete(fn);},broadcast(){for(const fn of listeners)fn();}}));
  const a=make('ingredient-a'),b=make('ingredient-b'),offA=a.subscribe(()=>{}),offB=b.subscribe(()=>{}),intent=makeIntent(initial);
  const results=await Promise.all([a.purchase(intent),b.purchase(intent)]);assert.deepEqual(results.map(r=>r.status).sort(),['ALREADY_PROCESSED','SUCCESS']);await a.refresh();await b.refresh();
  const saved=testRepository(storage).load().profile;assert.equal(saved.wallet.coins,initial.wallet.coins-100);assert.equal(saved.purchaseTransactionLedger.length,1);assert.equal(saved.ownership.filter(o=>o.contentId==='ingredient.botanical').length,1);
  assert.deepEqual(a.snapshot().profile,saved);assert.deepEqual(b.snapshot().profile,saved);offA();offB();
});
test('an ingredient purchase retained after quota failure flushes once without losing prior mastery or double spending',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(currentPlayerProfile(fundedProfile(),tuning))}),c=createPlayerController(testRepository(storage),'ingredient-quota',()=>2000);
  const intent=makeIntent(c.snapshot().profile);storage.failWrite(true);assert.equal((await c.purchase(intent)).persistence,'memory');assert.equal(c.snapshot().profile.wallet.coins,900);
  storage.failWrite(false);await c.refresh();assert.equal((await c.purchase(intent)).status,'ALREADY_PROCESSED');assert.equal(testRepository(storage).load().profile.wallet.coins,900);
});
