import { IngredientLab } from './IngredientLab.tsx';
import { useState } from 'react';
import type { PlayerController, PlayerSnapshot } from '../application/playerController.ts';
import type { RecipeSelection } from './Recipes.tsx';
import { recipeCatalog } from '../content/recipeCatalog.ts';
import { recipeExample, recipeExampleNames } from '../application/recipeExamples.ts';
import type { RecipeExample } from '../application/recipeExamples.ts';
import { emptyRecipeProgress,recipeAvailability } from '../domain/recipes.ts';
import { issueRoundIdentity, settleRoundReward } from '../domain/progression.ts';
import { settleRecipeRound } from '../domain/recipeProgression.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { ownershipPolicy } from '../application/playerContent.ts';
export default function RecipeLab({controller,snapshot,selection}:{readonly controller:PlayerController;readonly snapshot:PlayerSnapshot;readonly selection:RecipeSelection}){
  const [recipeId,setRecipeId]=useState(recipeCatalog.recipes[0]!.id),[example,setExample]=useState<RecipeExample>('exact'),[confirmed,setConfirmed]=useState(false),[message,setMessage]=useState('');
  const recipe=recipeCatalog.recipes.find(r=>r.id===recipeId)!,sample=recipeExample(recipe,example);
  return <details className="asset-lab" data-lab-marker="RECIPE_LAB_DEV_ONLY"><summary>Recipe Lab · solo sviluppo</summary>
    <label>Ricetta da ispezionare<select value={recipeId} onChange={e=>setRecipeId(e.target.value)}>{recipeCatalog.recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    <button type="button" disabled={!selection.canChoose||recipeAvailability(snapshot.profile,recipe,recipeCatalog).state!=='AVAILABLE'} onClick={()=>selection.onSelect(recipe.id)}>Seleziona ricetta nel gioco</button>
    <label>Esempio deterministico<select value={example} onChange={e=>setExample(e.target.value as RecipeExample)}>{recipeExampleNames.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
    <pre>{JSON.stringify({recipe,result:sample.recipeResult,drinkScore:sample.state.result!.totalScore,mix:sample.state.view.derived.mix,completedShakes:sample.state.view.completedShakeCount},null,2)}</pre>
    <p>Solo DEV: l'esempio applicato aggiunge premio base, statistiche e gli eventuali bonus al profilo locale. Un nuovo tentativo non ripete i bonus già assegnati.</p>
    <button type="button" disabled={recipeAvailability(snapshot.profile,recipe,recipeCatalog).state!=='AVAILABLE'} onClick={()=>{void controller.update(profile=>{
      const at=Math.max(Date.now(),profile.updatedAt),issued=issueRoundIdentity(profile,'recipe-lab',profile.nextAttemptOrdinal,at);
      const base=settleRoundReward(issued.profile,sample.state.result!,issued.round,progressionTuning,ownershipPolicy,at);
      return settleRecipeRound(base.profile,sample.recipeResult,issued.round,sample.state.result!,recipeCatalog,progressionTuning,ownershipPolicy,at).profile;
    });setMessage('Esempio applicato. Controlla mastery, obiettivi e saldo.');}}>Applica esempio al profilo DEV</button>
    <pre>{JSON.stringify({mastery:snapshot.profile.recipeProgress,goals:recipeCatalog.goals,coordination:snapshot.coordinationMode,status:snapshot.status},null,2)}</pre>
    <label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Confermo il reset delle sole ricette e degli obiettivi DEV</label>
    <p>XP, saldo, acquisti ed equip restano intatti. Il reset permette di riprovare i bonus in futuri round DEV, senza revocare quelli già guadagnati.</p>
    <button type="button" disabled={!confirmed} onClick={()=>{void controller.update(p=>({...p,recipeProgress:emptyRecipeProgress(p.lastSettledOrdinal)}));setConfirmed(false);setMessage('Stato ricette/obiettivi DEV azzerato.');}}>Reset ricette e obiettivi DEV</button><p role="status">{message}</p>
    <IngredientLab profile={snapshot.profile}/>
  </details>;
}
