import test from 'node:test';import assert from 'node:assert/strict';
import { createElement } from 'react';import { renderToStaticMarkup } from 'react-dom/server';import { createServer } from 'vite';
import { currentPlayerProfile } from '../domain/playerProfileV3.ts';import { progressionTuning } from '../content/progressionTuning.ts';import { newTestProfile } from '../platform/profileTestFixtures.ts';
import { settleRecipeExample,recipeProfile } from '../application/recipeTestFixtures.ts';import { recipeCatalog } from '../content/recipeCatalog.ts';
const server=await createServer({configFile:false,server:{middlewareMode:true,watch:null,hmr:false},appType:'custom'});
const ui=await server.ssrLoadModule('/src/ui/Recipes.tsx') as typeof import('./Recipes.tsx');test.after(()=>server.close());
const selection={selectedRecipeId:null,canChoose:true,onSelect(){}};
test('recipe selector explains separate scores, real targets, availability and one-time rewards in Italian',()=>{
  const html=renderToStaticMarkup(createElement(ui.RecipeSelector,{profile:currentPlayerProfile(newTestProfile(),progressionTuning),selection}));
  assert.match(html,/Il punteggio valuta il drink/);assert.match(html,/120 frutteto/);assert.match(html,/Prima riuscita/);assert.match(html,/Disponibile dal livello 4/);assert.match(html,/Scegli Primo raggio/);assert.match(html,/Obiettivi del banco/);
  assert.doesNotMatch(html,/VolumeUnit|RecipeResult|tolerance|ml/);
});
test('active-round selection is locked while mastery and goal progress remain readable',()=>{
  const p=settleRecipeExample().profile,html=renderToStaticMarkup(createElement(ui.RecipeSelector,{profile:p,selection:{...selection,selectedRecipeId:recipeCatalog.recipes[0]!.id,canChoose:false}}));
  assert.match(html,/Il giro è iniziato/);assert.match(html,/Perfetta raggiunta/);assert.match(html,/Migliore: Perfetta/);assert.match(html,/Completato/);assert.doesNotMatch(html,/<button(?![^>]*disabled)/);
});
test('compact outcome distinguishes ingredient precision, first perfect and explicit bonus from general drink score',()=>{
  const settled=settleRecipeExample(recipeProfile()),html=renderToStaticMarkup(createElement(ui.RecipeOutcome,{reward:settled.reward!}));
  assert.match(html,/Risultato della ricetta/);assert.match(html,/Primo raggio · Perfetta/);assert.match(html,/Precisione ingredienti: 100%/);assert.ok(html.includes('Bonus ricetta: +25 XP'));assert.match(html,/Obiettivi:/);
});
