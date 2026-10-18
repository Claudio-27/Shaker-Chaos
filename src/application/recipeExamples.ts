/** Deterministic examples for DEV, tests and analysis only. Never imported by normal production UI. */
import type { CocktailRecipe } from '../domain/recipes.ts';
import { evaluateRecipe } from '../domain/recipes.ts';
import { newClassicGame, transitionClassicGame } from './classicGame.ts';
import { gameDependencies } from './productionBootstrap.ts';
export type RecipeExample='exact'|'within'|'outside'|'far'|'no-ice'|'no-garnish'|'wrong-shake';
export const recipeExampleNames:readonly RecipeExample[]=['exact','within','outside','far','no-ice','no-garnish','wrong-shake'];
export function recipeExample(recipe:CocktailRecipe,example:RecipeExample='exact') {
  const {profile}=gameDependencies;let state=newClassicGame(gameDependencies),atMs=0,operationId=0;
  const apply=(action:Parameters<typeof transitionClassicGame>[1])=>{state=transitionClassicGame(state,action,gameDependencies);};
  const quantities={...recipe.quantities},first=Object.keys(quantities)[0]!;
  const reduction=example==='within'?recipe.tolerance.successfulDeviation:example==='outside'?recipe.tolerance.successfulDeviation+profile.pour.unitsPerStep:example==='far'?recipe.tolerance.nearDeviation+profile.pour.unitsPerStep:0;
  for(const [id,n]of Object.entries(quantities)){
    const units=n-(id===first?reduction:0);if(units<=0||units%profile.pour.unitsPerStep!==0)throw new RangeError('Example must use reachable pour ticks');
    apply({type:'PourStarted',ingredientId:id,operationId,atMs});atMs+=profile.pour.startupMs+units/profile.pour.unitsPerStep*profile.pour.intervalMs;
    apply({type:'PourEnded',operationId,reason:'completed',atMs});operationId++;atMs++;
  }
  if(example!=='no-ice')for(let n=0;n<(recipe.ice?.minimum??0);n++)apply({type:'IceAdded',requestedUnits:1,atMs});
  const count=example==='wrong-shake'?1:recipe.shake?.completed.minimum??1;
  const duration=example==='wrong-shake'?50:Math.max(300,recipe.shake?.durationMs.minimum??300);
  for(let n=0;n<count;n++){apply({type:'ShakeStarted',operationId,atMs});atMs+=Math.floor(duration/count)+(n===count-1?duration%count:0);apply({type:'ShakeEnded',operationId,reason:'completed',atMs});operationId++;atMs++;}
  if(recipe.garnishId&&example!=='no-garnish')apply({type:'GarnishChanged',garnishId:recipe.garnishId,atMs});
  apply({type:'Served',atMs});
  if(!state.result)throw new Error('Example did not finish');
  return {label:'RECIPE_EXAMPLES_DEV_ONLY',state,recipeResult:evaluateRecipe(recipe,state.view)};
}
