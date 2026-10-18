import { barIngredients,legacyIngredientIds } from './ingredientCatalog.ts';
import { runtimeArtManifest } from './runtimeArtManifest.ts';
import type { AssetId,ImageAssetDefinition,IngredientVisualDefinition,RuntimeAssetDefinition } from './visualModel.ts';
const manifest=runtimeArtManifest as Partial<Record<AssetId,RuntimeAssetDefinition>>;
export const additionalIngredientAssets:Partial<Record<AssetId,ImageAssetDefinition>>={};
export const additionalIngredientVisuals:Record<string,IngredientVisualDefinition>={};
for(const ingredient of barIngredients.filter(i=>i.published&&!legacyIngredientIds.some(id=>id===i.id))){
  const runtime=manifest[ingredient.bottleAssetId];if(!runtime)continue;
  additionalIngredientAssets[ingredient.bottleAssetId]={runtime,path:runtime.variants['1x'].path,width:runtime.source.width,height:runtime.source.height,format:'png',visibility:'public'};
  additionalIngredientVisuals[ingredient.id]={id:ingredient.id,bottle:ingredient.bottleAssetId,icon:ingredient.bottleAssetId,liquid:{color:ingredient.color}};
}
