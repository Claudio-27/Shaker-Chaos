import test from 'node:test';import assert from 'node:assert/strict';import { readFileSync,existsSync } from 'node:fs';import { createHash } from 'node:crypto';
import { barIngredients } from './ingredientCatalog.ts';import { publicVisualCatalog as visuals } from './publicVisualCatalog.ts';import { runtimeArtManifest } from './runtimeArtManifest.ts';
import { planSceneAssets } from './visualPlan.ts';import { gamePresentation } from '../application/productionBootstrap.ts';import { shelfPage } from '../application/ingredientAccess.ts';
import { ingredientBottleStyle } from '../ui/ingredientBottleFraming.ts';import { VISUAL_SAMPLES } from '../ui/classicVisualFraming.ts';
const inventory=JSON.parse(readFileSync(new URL('../../docs/artwork-inventory.json',import.meta.url),'utf8'));
test('three final generated bottle masters are distinct transparent RGBA with registered deterministic 1x/2x runtime variants',()=>{
  const hashes=new Set<string>();for(const i of barIngredients.slice(3)){
    const id=i.bottleAssetId,row=inventory.find((r:{id:string})=>r.id===id),runtime=runtimeArtManifest[id as keyof typeof runtimeArtManifest],bytes=readFileSync(new URL('../../art-source/'+row.path,import.meta.url));
    assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1536);assert.equal(bytes[25],6);assert.ok(row.transparentPixels>100000);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.equal(runtime.source.sha256,row.sha256);hashes.add(row.sha256);
    assert.ok(i.published);assert.equal(visuals.ingredients[i.id]!.bottle,id);assert.equal(visuals.assets[id]!.runtime,runtime);assert.ok(!VISUAL_SAMPLES[id]);
    for(const density of ['1x','2x'] as const){const variant=runtime.variants[density],raw=readFileSync(new URL('../../public/'+variant.path,import.meta.url));assert.equal(createHash('sha256').update(raw).digest('hex'),variant.sha256);assert.ok(variant.path.startsWith('art/runtime/ingredients/'));assert.equal(existsSync(new URL('../../public/'+row.path,import.meta.url)),false);}
    assert.ok(runtime.variants['2x'].height>runtime.variants['1x'].height);const alpha=runtime.source.alpha;assert.ok(alpha.width*118/alpha.height<=64);assert.ok(ingredientBottleStyle(id,visuals.assets[id]));
  }assert.equal(hashes.size,3);
});
test('initial scene requests only legacy shelf page; visiting page two requests new bottles without loading other pages',()=>{
  assert.deepEqual(gamePresentation.scene.ingredientIds,['orchard','citrus','soda']);const first=planSceneAssets(visuals,gamePresentation.scene).critical;
  for(const i of barIngredients.slice(3))assert.ok(!first.includes(i.bottleAssetId));
  const second=planSceneAssets(visuals,{...gamePresentation.scene,ingredientIds:shelfPage(barIngredients,1).items.map(i=>i.id)}).critical;
  for(const i of barIngredients.slice(3))assert.ok(second.includes(i.bottleAssetId));for(const i of barIngredients.slice(0,3))assert.ok(!second.includes(i.bottleAssetId));
});
