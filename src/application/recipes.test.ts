import type { CocktailRecipe } from '../domain/recipes.ts';
import test from 'node:test';import assert from 'node:assert/strict';
import { recipeCatalog as catalog, recipeValidationRules as rules } from '../content/recipeCatalog.ts';
import { evaluateRecipe, validateRecipeCatalog } from '../domain/recipes.ts';
import { recipeExample } from './recipeExamples.ts';
import { gameDependencies } from './productionBootstrap.ts';
import { createCompatibilityInput } from '../domain/session.ts';
import { replayClassicHistory } from '../domain/classicSession.ts';
const recipes=catalog.recipes;
test('seven recipes use valid ingredients, reachable canonical targets and distinct objectives',()=>{
  validateRecipeCatalog(catalog,rules);assert.equal(recipes.length,7);assert.equal(catalog.goals.length,4);
  assert.equal(new Set(recipes.map(r=>JSON.stringify(r.quantities))).size,7);
  for(const recipe of recipes){assert.ok(Object.values(recipe.quantities).every(Number.isSafeInteger));const sample=recipeExample(recipe);
    assert.deepEqual(recipeExample(recipe),sample);assert.equal(sample.recipeResult.status,'PERFECT');assert.equal(sample.recipeResult.precisionBps,10000);
    assert.equal(evaluateRecipe(recipe,replayClassicHistory(sample.state.session.history,gameDependencies.profile)).status,'PERFECT');
    for(const other of recipes.filter(r=>r!==recipe))assert.notEqual(evaluateRecipe(other,sample.state.view).status,'PERFECT');
  }
});
test('recipe validation rejects unknown ingredients, unsafe targets, impossible extras, duplicate IDs and invalid tolerance',()=>{
  const r=recipes[0]!;
  for(const patch of [{quantities:{unknown:120}},{quantities:{orchard:241}},{quantities:{orchard:1.5}},{availableFromLevel:0},{availableFromLevel:1000001},
    {tolerance:{successfulDeviation:12,nearDeviation:11}},{tolerance:{successfulDeviation:12,nearDeviation:120}},{ice:{minimum:3,maximum:3}},
    {garnishId:'missing'},{shake:{completed:{minimum:6,maximum:6},durationMs:{minimum:1,maximum:100}}}])assert.throws(()=>validateRecipeCatalog({...catalog,recipes:[{...r,...patch} as unknown as CocktailRecipe]},rules));
  assert.throws(()=>validateRecipeCatalog({...catalog,recipes:[r,r]},rules));assert.throws(()=>validateRecipeCatalog({recipes:[],goals:[]},rules));
  assert.throws(()=>validateRecipeCatalog({...catalog,goals:[{...catalog.goals[0]!,reward:{xp:1.5,coins:0}}]},rules));
});
test('all recipes distinguish exact, inclusive success boundary, just outside success and outside near with integer precision',()=>{
  for(const recipe of recipes){
    for(const [name,status,deviation] of [['exact','PERFECT',0],['within','SUCCESS',recipe.tolerance.successfulDeviation],['outside','CLOSE',recipe.tolerance.successfulDeviation+3],['far','FAILED',recipe.tolerance.nearDeviation+3]] as const){
      const result=recipeExample(recipe,name).recipeResult;assert.equal(result.status,status);assert.equal(result.deviation,deviation);assert.ok(Number.isSafeInteger(result.precisionBps));
    }
  }
});
test('ice, garnish and cumulative completed-shake criteria independently prevent completion when missing',()=>{
  assert.deepEqual(recipeExample(recipes[2]!,'no-ice').recipeResult.missing,['ice']);assert.equal(recipeExample(recipes[2]!,'no-ice').recipeResult.status,'CLOSE');
  assert.deepEqual(recipeExample(recipes[3]!,'no-garnish').recipeResult.missing,['garnish']);
  assert.deepEqual(recipeExample(recipes[1]!,'wrong-shake').recipeResult.missing,['shake']);assert.deepEqual(recipeExample(recipes[3]!,'wrong-shake').recipeResult.missing,['shake']);
  const exact=recipeExample(recipes[3]!).state.view;assert.equal(exact.completedShakeCount,2);assert.equal(exact.derived.mix.shakeDurationMs,500);
  assert.equal(evaluateRecipe(recipes[3]!,{...exact,failed:true}).status,'FAILED');
});
test('unexpected ingredients count in L1 distance and perfect recipes can have different general drink scores',()=>{
  const simple=recipeExample(recipes[0]!),balanced=recipeExample(recipes[1]!),before=JSON.stringify(balanced.state);
  assert.equal(evaluateRecipe(recipes[0]!,balanced.state.view).status,'FAILED');assert.ok(balanced.state.result!.totalScore>=8500);
  assert.equal(simple.recipeResult.status,'PERFECT');assert.ok(simple.state.result!.totalScore<balanced.state.result!.totalScore);
  for(const r of recipes)evaluateRecipe(r,balanced.state.view);
  assert.equal(JSON.stringify(balanced.state),before);assert.deepEqual(gameDependencies.scoringEngine.evaluate(createCompatibilityInput(balanced.state.session)),balanced.state.result);
});
