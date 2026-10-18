import test from 'node:test';import assert from 'node:assert/strict';import { createElement } from 'react';import { renderToStaticMarkup } from 'react-dom/server';import { createServer } from 'vite';
import { barIngredients } from '../content/ingredientCatalog.ts';import { testIngredients,testIngredientVisuals } from '../application/ingredientTestFixtures.ts';
import { fundedProfile } from '../application/shopTestFixtures.ts';import { ingredientAvailability } from '../application/ingredientAccess.ts';
import { gameDependencies,gamePresentation } from '../application/productionBootstrap.ts';import { newClassicGame } from '../application/classicGame.ts';
import { storefront } from './shopPresentation.ts';import { collectionItems } from './progressionPresentation.ts';
const server=await createServer({configFile:false,server:{middlewareMode:true,watch:null,hmr:false},appType:'custom'});
const stage=await server.ssrLoadModule('/src/ui/GameStage.tsx') as typeof import('./GameStage.tsx');
const assets=await server.ssrLoadModule('/src/ui/AssetVisual.tsx') as typeof import('./AssetVisual.tsx');
const recipes=await server.ssrLoadModule('/src/ui/Recipes.tsx') as typeof import('./Recipes.tsx');
const lab=await server.ssrLoadModule('/src/ui/IngredientLab.tsx') as typeof import('./IngredientLab.tsx');test.after(()=>server.close());
const props={loadout:gamePresentation.scene,mix:newClassicGame(gameDependencies).view.derived.mix,selectedId:'orchard',disabled:false,pourFeedback:'idle' as const,onSelect(){},formatVolume:(n:number)=>n+' u'};
const render=(page:number,disabled=false)=>renderToStaticMarkup(createElement(assets.VisualAssetsProvider,{catalog:testIngredientVisuals,children:createElement(stage.BottleShelf,{...props,disabled,ingredients:testIngredients,visuals:testIngredientVisuals,page,availability:Object.fromEntries(testIngredients.map(i=>[i.id,{selectable:ingredientAvailability(fundedProfile(),i,testIngredientVisuals).selectable,reason:'Acquista nel Negozio'}]))})}));
test('shelf pages mount only three bottles and reuse identical slot positions, with locked disabled controls and named navigation',()=>{
  const first=render(0),second=render(1);assert.equal((first.match(/data-hitbox="bottle"/g)??[]).length,3);assert.equal((second.match(/data-hitbox="bottle"/g)??[]).length,3);
  assert.match(first,/aria-pressed="true"/);assert.doesNotMatch(first,/SOTTOBOSCO|PETALI/);assert.doesNotMatch(second,/FRUTTETO|BOLLICINE/);
  assert.match(second,/aria-label="Mensola 2"/);assert.equal((second.match(/disabled=""[^>]*aria-pressed="false"/g)??[]).length,3);assert.match(second,/Acquista nel Negozio/);assert.equal((second.match(/bottle-runtime-frame/g)??[]).length,3);assert.match(second,/--art-height:/);
  assert.match(first,/nav tabindex="0"[^>]*aria-label="Pagine della mensola"/);assert.match(first,/aria-label="Mensola precedente" disabled/);assert.match(second,/aria-label="Mensola successiva" disabled/);
  assert.deepEqual([...first.matchAll(/data-slot="([^"]+)"/g)].map(m=>m[1]),[...second.matchAll(/data-slot="([^"]+)"/g)].map(m=>m[1]));assert.equal((render(0,true).match(/disabled=""/g)??[]).length,5);
});
test('normal publication exposes the paginated shelf, six offers and seven ownership-gated recipes',()=>{
  const html=renderToStaticMarkup(createElement(assets.VisualAssetsProvider,{catalog:gamePresentation.visuals,children:createElement(stage.BottleShelf,{...props,ingredients:gamePresentation.catalog.ingredients,visuals:gamePresentation.visuals})}));
  assert.match(html,/shelf-navigation/);assert.doesNotMatch(html,/bottle04|bottle05|bottle06|SOTTOBOSCO/);assert.equal(storefront(fundedProfile()).length,6);assert.ok(collectionItems().every(i=>i.publication!=='unpublished'));
  const recipeHtml=renderToStaticMarkup(createElement(recipes.RecipeSelector,{profile:fundedProfile(),selection:{selectedRecipeId:null,canChoose:true,onSelect(){}}}));assert.match(recipeHtml,/Verde in controluce/);assert.match(recipeHtml,/Brace gentile/);assert.match(recipeHtml,/Corrente di petali/);assert.match(recipeHtml,/Richiede: Amaro di sottobosco/);
});
test('recipe selector clearly names missing ingredients and links to the shop without granting anything',()=>{
  const p=fundedProfile(),missing={...p,ownership:p.ownership.filter(o=>o.contentId!=='ingredient.orchard')},html=renderToStaticMarkup(createElement(recipes.RecipeSelector,{profile:missing,selection:{selectedRecipeId:null,canChoose:true,onSelect(){},onShop(){}}}));
  assert.match(html,/Richiede: Infuso del frutteto/);assert.match(html,/Vai al Negozio/);assert.doesNotMatch(html,/IngredientRequired|ingredient.orchard/);
});
test('existing DEV labs expose all six published definitions and their available final bottle assets',()=>{
  const html=renderToStaticMarkup(createElement(lab.IngredientLab,{profile:fundedProfile()}));assert.match(html,/INGREDIENT_LAB_DEV_ONLY/);assert.ok(html.includes('Pagina 1/2'));
  for(const i of barIngredients)assert.ok(html.includes(i.id));assert.equal((html.match(/&quot;artwork&quot;: &quot;presente&quot;/g)??[]).length,6);assert.doesNotMatch(html,/MANCANTE|NON PUBBLICATO/);assert.doesNotMatch(html,/<img/);
});
