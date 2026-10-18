/** Synthetic publication only for isolated tests; no artwork files or production flags. */
import { barIngredients } from '../content/ingredientCatalog.ts';
import { publicVisualCatalog } from '../content/publicVisualCatalog.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { productionStore } from '../content/storeCatalog.ts';
import { recipeCatalog } from '../content/recipeCatalog.ts';
import type { VisualCatalog } from '../content/visualModel.ts';
export const testIngredients=barIngredients.map(i=>({...i,published:true}));
const reference=publicVisualCatalog.assets['ingredient.bottle01']!;
export const testIngredientVisuals:VisualCatalog={...publicVisualCatalog,assets:{...publicVisualCatalog.assets,
  ...Object.fromEntries(testIngredients.slice(3).map(i=>[i.bottleAssetId,{...reference,path:'art/runtime/test/'+i.id+'.png',runtime:{...reference.runtime!,source:{...reference.runtime!.source,sha256:(i.id==='botanical'?'4':i.id==='ember'?'5':'6').repeat(64)}}}]))},
  ingredients:{...publicVisualCatalog.ingredients,...Object.fromEntries(testIngredients.slice(3).map(i=>[i.id,{id:i.id,bottle:i.bottleAssetId,icon:i.bottleAssetId,liquid:{color:i.color}}]))}};
export const testIngredientContent={...publicContentCatalog,items:publicContentCatalog.items.map(i=>i.kind==='ingredient'?{...i,publication:'published' as const}:i)};
export const testIngredientStore={offers:productionStore.offers.map(o=>({...o,availability:{...o.availability,published:true}}))};
export const testIngredientRecipes={...recipeCatalog,ingredientAccess:Object.fromEntries(testIngredients.map(i=>[i.id,{contentId:i.contentId,published:true}]))};

/** The pre-activation state remains testable without disabling production content. */
export const unpublishedIngredients=barIngredients.map((i,n)=>({...i,published:n<3}));
export const unpublishedIngredientContent={...publicContentCatalog,items:publicContentCatalog.items.map(i=>i.kind==='ingredient'&&!['orchard','citrus','soda'].includes(i.ingredientId!)?{...i,publication:'unpublished' as const}:i)};
export const unpublishedIngredientRecipes={...recipeCatalog,ingredientAccess:Object.fromEntries(unpublishedIngredients.map(i=>[i.id,{contentId:i.contentId,published:i.published}]))};
export const missingIngredientVisuals:VisualCatalog={...publicVisualCatalog,assets:{...publicVisualCatalog.assets,'ingredient.bottle04':undefined,'ingredient.bottle05':undefined,'ingredient.bottle06':undefined},ingredients:Object.fromEntries(Object.entries(publicVisualCatalog.ingredients).filter(([id])=>['orchard','citrus','soda'].includes(id)))};
