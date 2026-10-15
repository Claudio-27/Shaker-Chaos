import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import { verifyRuntimeArt } from '../../scripts/verify-runtime-art.mjs';
import { publicVisualCatalog } from './publicVisualCatalog.ts';
import { allRuntimePaths,runtimeCandidates,runtimePath } from './runtimeVariants.ts';
import { validateVisualCatalog,planSceneAssets,resolveAsset } from './visualPlan.ts';
import { gamePresentation } from '../application/productionBootstrap.ts';
import { VISUAL_SAMPLES,visualPlacement } from '../ui/classicVisualFraming.ts';
import type { AssetId } from './visualModel.ts';
const inventory=JSON.parse(readFileSync(new URL('../../docs/runtime-art-inventory.json',import.meta.url),'utf8'));

test('generated runtime manifest verifies native dimensions and byte hashes of every master/variant',()=>{
  assert.deepEqual(verifyRuntimeArt(),{masters:inventory.assets.length,runtimeFiles:new Set(inventory.assets.flatMap((row:{variants:Record<string,{path:string}>})=>Object.values(row.variants).map(v=>v.path))).size});validateVisualCatalog(publicVisualCatalog);
});
test('all production PNG IDs use runtime-only paths; original master URLs are absent from public',()=>{
  for(const [id,asset] of Object.entries(publicVisualCatalog.assets))if(asset!.format==='png'){
    assert.ok(asset!.runtime,id);assert.match(asset!.path,/^art\/runtime\//);
    for(const path of allRuntimePaths(asset!))assert.ok(existsSync(new URL('../../public/'+path,import.meta.url)));
  }
  for(const row of inventory.assets){assert.equal(existsSync(new URL('../../public/'+row.historicalPublicPath,import.meta.url)),false);assert.ok(existsSync(new URL('../../'+row.sourcePath,import.meta.url)));}
});
test('crop retains category safety padding with explicit clamping at original canvas edges',()=>{
  for(const row of inventory.assets){const {alpha}=row.source,{crop,padding}=row;
    const expected=row.category==='background'?{x:0,y:0,width:row.source.width,height:row.source.height}:{x:Math.max(0,alpha.x-padding),y:Math.max(0,alpha.y-padding),width:Math.min(row.source.width,alpha.x+alpha.width+padding)-Math.max(0,alpha.x-padding),height:Math.min(row.source.height,alpha.y+alpha.height+padding)-Math.max(0,alpha.y-padding)};
    assert.deepEqual(crop,expected,row.id);assert.ok(row.discardedMaximumAlpha<8);
  }
});
test('runtime crop registration preserves original 2F alpha bounds and bartender/bottle logical anchors',()=>{
  for(const [id,sample] of Object.entries(VISUAL_SAMPLES)){
    const asset=publicVisualCatalog.assets[id as AssetId]!,runtime=asset.runtime!;
    assert.deepEqual(runtime.source.alpha,sample.opaque,id);
    const kind=id.startsWith('bartender.')?'bartender':id.startsWith('ingredient.')?'bottle':id.includes('shaker')?'shaker':id.includes('glass')?'glass':'counter';
    const placement=visualPlacement(id,kind)!;
    for(const variant of Object.values(runtime.variants)){
      const outputX=(sample.opaque.x-runtime.crop.x)*variant.width/runtime.crop.width;
      const backToSource=runtime.crop.x+outputX*runtime.crop.width/variant.width;
      assert.ok(Math.abs(placement.canvas.x+backToSource*placement.scale-placement.visible.x)<1e-8);
    }
    if(kind==='bartender'){assert.equal(placement.visible.height,292);assert.equal(placement.baseline,302);assert.equal(placement.centerX,105);}
  }
});
test('1x/2x selection and fallback ordering are deterministic and avoid aliased duplicate requests',()=>{
  const bottle=resolveAsset(publicVisualCatalog,'ingredient.bottle01');
  assert.equal(runtimeCandidates(bottle,{scale:1.76,canonical:true})[0],bottle.runtime!.variants['1x']);
  assert.equal(runtimeCandidates(bottle,{scale:3.52,canonical:true})[0],bottle.runtime!.variants['2x']);
  assert.equal(runtimeCandidates(bottle,{scale:3.52,canonical:true})[1],bottle.runtime!.variants['1x']);
  assert.equal(runtimeCandidates(bottle,{scale:1,canonical:false})[1],bottle.runtime!.variants['2x']);
  assert.equal(runtimeCandidates(resolveAsset(publicVisualCatalog,'environment.e01.background'),{scale:4,canonical:true}).length,1);
});
test('active-scene warm selects exactly one appropriate runtime per ID and keeps locked packs/reactions/effects deferred',()=>{
  const ids=planSceneAssets(publicVisualCatalog,gamePresentation.scene).critical;
  for(const scale of [1,1.76,3.52]){
    const paths=ids.map(id=>runtimePath(resolveAsset(publicVisualCatalog,id),{scale,canonical:true}));
    assert.equal(ids.length,15);assert.equal(new Set(paths).size,15);assert.ok(paths.every(path=>!path.includes('/b02/')&&!path.includes('tasting')&&!path.includes('excellent')&&!path.includes('/effects/')));
    assert.equal(paths.filter(path=>path.startsWith('art/runtime/')).length,9);
  }
});
test('PNG format decision retains original-alpha geometry and no arbitrary upscale; codec study reports pixel identity',()=>{
  for(const row of inventory.assets){for(const variant of Object.values(row.variants) as {width:number;height:number}[]){assert.ok(variant.width<=row.crop.width&&variant.height<=row.crop.height);}assert.ok(row.variants['2x'].width>=row.variants['1x'].width);}
  assert.ok(inventory.formatStudy.comparisons.every((row:{webpLossless:{rgbaIdentical:boolean}})=>row.webpLossless.rgbaIdentical));
  assert.ok(inventory.formatStudy.comparisons.some((row:{avifQuality100?:{rgbaIdentical:boolean}})=>row.avifQuality100&&!row.avifQuality100.rgbaIdentical));
});
test('registry validation rejects source exposure, forged dimensions and out-of-canvas crop',()=>{
  const source=resolveAsset(publicVisualCatalog,'ingredient.bottle01');
  for(const runtime of [{...source.runtime!,crop:{...source.runtime!.crop,x:-1}},{...source.runtime!,variants:{...source.runtime!.variants,'2x':{...source.runtime!.variants['2x'],path:'art-source/master.png'}}}])assert.throws(()=>validateVisualCatalog({...publicVisualCatalog,assets:{...publicVisualCatalog.assets,'ingredient.bottle01':{...source,runtime}}}),RangeError);
});
