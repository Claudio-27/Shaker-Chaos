import type { CocktailRecipe, RecipeResult } from '../domain/recipes.ts';
import type { PlayerProfile } from '../domain/playerProfile.ts';
import type { RecipeReward } from '../domain/recipeProgression.ts';
import { recipeAvailability,emptyRecipeProgress } from '../domain/recipes.ts';
import { recipeCatalog } from '../content/recipeCatalog.ts';
import './Recipes.css';
export interface RecipeSelection { readonly selectedRecipeId:string|null;readonly canChoose:boolean;readonly onSelect:(id:string|null)=>void;readonly onShop?:()=>void }
export const recipeStatusCopy={FAILED:'Non riuscita',CLOSE:'Vicina',SUCCESS:'Riuscita',PERFECT:'Perfetta'};
const extrasCopy={ice:'ghiaccio',garnish:'agrume',shake:'agitazione'};
export const recipePrecision=(bps:number)=>new Intl.NumberFormat('it-IT',{maximumFractionDigits:2}).format(bps/100)+'%';
import { barIngredients } from '../content/ingredientCatalog.ts';
export function recipeTarget(recipe:CocktailRecipe){return Object.entries(recipe.quantities).map(([id,n])=>n+' '+(barIngredients.find(i=>i.id===id)?.shortLabel.toLowerCase()??id)).join(' · ');}
export function recipeExtras(recipe:CocktailRecipe){return [recipe.ice?'Ghiaccio: '+recipe.ice.minimum+(recipe.ice.maximum===recipe.ice.minimum?'':'–'+recipe.ice.maximum)+' aggiunte':null,
  recipe.garnishId?'Aggiungi la ruota di agrume':null,recipe.shake?recipe.shake.completed.minimum+(recipe.shake.completed.maximum===recipe.shake.completed.minimum?'':'–'+recipe.shake.completed.maximum)+(recipe.shake.completed.minimum===1&&recipe.shake.completed.maximum===1?' agitazione, ':' agitazioni, ')+new Intl.NumberFormat('it-IT').format(recipe.shake.durationMs.minimum/1000)+'–'+new Intl.NumberFormat('it-IT').format(recipe.shake.durationMs.maximum/1000)+' secondi totali':null].filter(Boolean).join(' · ')||'Agita e servi come di consueto.';}
export function RecipeSelector({profile,selection}:{readonly profile:PlayerProfile;readonly selection:RecipeSelection}){
  const progress=profile.schemaVersion===3?profile.recipeProgress:emptyRecipeProgress();
  return <section className="recipe-surface" aria-label="Ricette e obiettivi">
    <p>Il punteggio valuta il drink. La ricetta misura quanto ti avvicini al suo obiettivo. Le ricette si aprono con i livelli e gli ingredienti posseduti. Sceglierle non costa monete.</p>
    {!selection.canChoose&&<p role="status">Il giro è iniziato. Puoi cambiare ricetta dopo aver ricominciato il mix o scelto Nuovo drink.</p>}
    <button type="button" disabled={!selection.canChoose||selection.selectedRecipeId===null} onClick={()=>selection.onSelect(null)}>Gioco libero</button>
    <div className="recipe-grid">{recipeCatalog.recipes.filter(r=>recipeAvailability(profile,r,recipeCatalog).state!=='UNPUBLISHED').map(recipe=>{const mastery=progress.mastery.find(m=>m.recipeId===recipe.id),access=recipeAvailability(profile,recipe,recipeCatalog),locked=access.state!=='AVAILABLE',selected=selection.selectedRecipeId===recipe.id;
      return <article key={recipe.id} aria-label={recipe.name+(selected?', selezionata':'')}><h3>{recipe.name}</h3><p>{recipe.description}</p><p><strong>{recipeTarget(recipe)}</strong></p><p>{recipeExtras(recipe)}</p>
        <p>Perfetta: quantità esatte e requisiti rispettati. Riuscita: scarto totale fino a {recipe.tolerance.successfulDeviation}; vicina: fino a {recipe.tolerance.nearDeviation} o un requisito mancante.</p>
        <p>Le differenze di ogni ingrediente si sommano; anche gli ingredienti extra contano. Una ricetta fallita durante il gioco non è completata.</p>
        <p>{mastery?.perfect?'★ Perfetta raggiunta':mastery?.completed?'✓ Completata':'Da completare'}{mastery?' · Migliore: '+recipeStatusCopy[mastery.bestStatus]+', ingredienti '+recipePrecision(mastery.bestPrecisionBps):''}</p>
        <p>Prima riuscita: +{recipe.rewards.completion.xp} XP, +{recipe.rewards.completion.coins} monete. Prima perfetta: altri +{recipe.rewards.perfect.xp} XP, +{recipe.rewards.perfect.coins} monete.</p>
        {access.state==='LEVEL_REQUIRED'&&<p>Disponibile dal livello {recipe.availableFromLevel}</p>}{access.state==='INGREDIENT_REQUIRED'&&<p>Richiede: {access.missing.map(id=>barIngredients.find(i=>i.id===id)?.name??'Ingrediente').join(', ')}{selection.onShop&&<button type="button" onClick={selection.onShop}>Vai al Negozio</button>}</p>}
        <button type="button" disabled={locked||!selection.canChoose||selected} aria-pressed={selected} onClick={()=>selection.onSelect(recipe.id)}>{selected?'Selezionata':'Scegli '+recipe.name}</button>
      </article>;})}</div>
    <h3>Obiettivi del banco</h3><ul className="recipe-goals">{recipeCatalog.goals.map(goal=><li key={goal.id}><strong>{goal.name}</strong> — {goal.description}<br/>{progress.claimedGoalIds.includes(goal.id)?'✓ Completato':goal.kind==='recipe-score'?'Da completare':progress.mastery.filter(m=>goal.kind==='completions'?m.completed:m.perfect).length+' / '+goal.count} · Premio una tantum: +{goal.reward.xp} XP, +{goal.reward.coins} monete</li>)}</ul>
  </section>;
}
export function RecipeHint({recipe,result,onDetails}:{readonly recipe:CocktailRecipe;readonly result:RecipeResult;readonly onDetails:()=>void}){
  return <div className="recipe-hint"><strong>{recipe.name}</strong><small>{recipeTarget(recipe)}</small><small>{recipeExtras(recipe)}</small><small>Ingredienti: {recipePrecision(result.precisionBps)}{result.missing.length?' · Da completare: '+result.missing.map(id=>extrasCopy[id]).join(', '):' · Requisiti pronti'}</small><button type="button" onClick={onDetails}>Dettagli ricetta</button></div>;
}
export function RecipeOutcome({reward}:{readonly reward:RecipeReward}){
  if(!reward.result)return null;const recipe=recipeCatalog.recipes.find(r=>r.id===reward.result!.recipeId);if(!recipe)return null;
  return <section className="recipe-outcome" aria-label="Risultato della ricetta" aria-live="polite"><strong>{recipe.name} · {recipeStatusCopy[reward.result.status]}</strong><p>Precisione ingredienti: {recipePrecision(reward.result.precisionBps)}{reward.result.missing.length?' · Da completare: '+reward.result.missing.map(id=>extrasCopy[id]).join(', '):''}</p>
    {(reward.newCompletion||reward.newPerfect||reward.newRecord)&&<p>{reward.newPerfect?'★ Prima perfetta!':reward.newCompletion?'✓ Prima riuscita!':'Nuovo record ricetta'}</p>}
    {(reward.recipeXp>0||reward.recipeCoins>0)&&<p>Bonus ricetta: +{reward.recipeXp} XP · +{reward.recipeCoins} monete</p>}
    {reward.goalIds.length>0&&<p>Obiettivi: {reward.goalIds.map(id=>recipeCatalog.goals.find(g=>g.id===id)?.name).join(' · ')}. Bonus: +{reward.goalXp} XP · +{reward.goalCoins} monete</p>}
    {reward.levelAfter>reward.levelBefore&&<p>Livello con i bonus: {reward.levelAfter}</p>}
  </section>;
}
