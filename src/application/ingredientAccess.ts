import type { PlayerProfile } from '../domain/playerProfile.ts';
import type { BarIngredient } from '../content/ingredientCatalog.ts';
import { barIngredients } from '../content/ingredientCatalog.ts';
import type { VisualCatalog } from '../content/visualModel.ts';
import type { ClassicGameAction,ClassicGameDependencies,ClassicGameState } from './classicGame.ts';
import { transitionClassicGame } from './classicGame.ts';
export function ingredientAvailability(profile:PlayerProfile,ingredient:BarIngredient,visuals:VisualCatalog){
  const ready=ingredient.published&&!!visuals.assets[ingredient.bottleAssetId]&&(visuals.bottleSets['bottles.supplied']?.bottles[ingredient.id]??visuals.ingredients[ingredient.id]?.bottle)===ingredient.bottleAssetId;
  const owned=profile.ownership.some(o=>o.contentId===ingredient.contentId),minimumLevel=ingredient.acquisition.kind==='starter'?1:ingredient.acquisition.availableFromLevel;
  return {owned,minimumLevel,price:ingredient.acquisition.kind==='coins'?ingredient.acquisition.price:null,
    state:!ready?'UNPUBLISHED' as const:owned?'AVAILABLE' as const:profile.progression.level<minimumLevel?'LEVEL_REQUIRED' as const:'NOT_OWNED' as const,
    selectable:ready&&owned};
}
export function canUseIngredient(profile:PlayerProfile,id:string,visuals:VisualCatalog,ingredients:readonly BarIngredient[]=barIngredients){
  const ingredient=ingredients.find(i=>i.id===id);return !!ingredient&&ingredientAvailability(profile,ingredient,visuals).selectable;
}
/** Permission is an application concern; canonical replay/scoring remain independent from current ownership. */
export function transitionPlayerGame(state:ClassicGameState,action:ClassicGameAction,deps:ClassicGameDependencies,profile:PlayerProfile,visuals:VisualCatalog,ingredients:readonly BarIngredient[]=barIngredients){
  if(action.type==='PourStarted'&&!canUseIngredient(profile,action.ingredientId,visuals,ingredients))return state;
  return transitionClassicGame(state,action,deps);
}
export const SHELF_PAGE_SIZE=3;
export function shelfPage<T>(items:readonly T[],page:number){
  const pages=Math.max(1,Math.ceil(items.length/SHELF_PAGE_SIZE)),index=Math.min(pages-1,Math.max(0,Number.isFinite(page)?Math.trunc(page):0));
  return {index,pages,items:items.slice(index*SHELF_PAGE_SIZE,(index+1)*SHELF_PAGE_SIZE)};
}
export function nextShelfPage(page:number,key:string,pages:number){return key==='Home'?0:key==='End'?pages-1:key==='ArrowRight'?Math.min(pages-1,page+1):key==='ArrowLeft'?Math.max(0,page-1):page;}
