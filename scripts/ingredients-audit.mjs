/** Offline configuration analysis. Unpublished ingredients are never purchased or made playable. */
import process from 'node:process';import { pathToFileURL } from 'node:url';
import { barIngredients } from '../src/content/ingredientCatalog.ts';
import { simulateEconomy,scenarios } from './economy-simulation.mjs';
import { recipeCatalog } from '../src/content/recipeCatalog.ts';import { recipeExample } from '../src/application/recipeExamples.ts';
export function ingredientPacing(){return barIngredients.filter(i=>i.acquisition.kind==='coins').map(i=>({id:i.id,published:i.published,level:i.acquisition.availableFromLevel,price:i.acquisition.price,
  saveRounds:Object.fromEntries(Object.entries(scenarios).filter(([name])=>name!=='misto').map(([name,results])=>{const sim=simulateEconomy({results,rounds:100});return [name,sim.rows.find(r=>r.level>=i.acquisition.availableFromLevel&&r.coinsAvailable>=i.acquisition.price)?.round??null];})),
  midRoundsAfterEffect:simulateEconomy({results:scenarios.medio,rounds:100,purchasePlan:['offer.ice-blue']}).rows.find(r=>r.level>=i.acquisition.availableFromLevel&&r.coinsAvailable>=i.acquisition.price&&r.round>=6)?.round??null}));}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify({label:'INGREDIENTS_ANALYSIS_DEV_ONLY',pacing:ingredientPacing(),recipes:recipeCatalog.recipes.map(r=>({id:r.id,score:recipeExample(r).state.result.totalScore}))},null,2));
