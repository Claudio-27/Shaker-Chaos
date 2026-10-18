import { recipeCatalog } from '../src/content/recipeCatalog.ts';
import { recipeExample, recipeExampleNames } from '../src/application/recipeExamples.ts';
console.log('RECIPES_SIMULATION_DEV_ONLY');
for(const recipe of recipeCatalog.recipes){
  console.log(JSON.stringify({id:recipe.id,name:recipe.name,target:recipe.quantities,tolerance:recipe.tolerance,ice:recipe.ice,garnish:recipe.garnishId,shake:recipe.shake,
    examples:recipeExampleNames.map(example=>{const value=recipeExample(recipe,example);
      const expected=example==='within'?'SUCCESS':example==='outside'?'CLOSE':example==='far'?'FAILED':
        (example==='no-ice'&&recipe.ice)||(example==='no-garnish'&&recipe.garnishId)||(example==='wrong-shake'&&recipe.shake)?'CLOSE':'PERFECT';
      if(value.recipeResult.status!==expected)throw new Error('Unexpected recipe example');
      return {example,quantities:value.state.view.derived.mix.quantities,ice:value.state.view.derived.mix.iceUnits,garnish:value.state.view.derived.mix.garnishId,
        shakes:value.state.view.completedShakeCount,shakeDurationMs:value.state.view.derived.mix.shakeDurationMs,expected,actual:value.recipeResult,drinkScore:value.state.result.totalScore};})},null,2));
}
