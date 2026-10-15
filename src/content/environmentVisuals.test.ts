import { contentPortrait } from '../ui/progressionPresentation.ts';
import { publicContentItem } from './publicContentCatalog.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { publicVisualCatalog as catalog } from './publicVisualCatalog.ts';
import { gamePresentation } from '../application/productionBootstrap.ts';
import { environmentBackground, planSceneAssets, validateVisualCatalog } from './visualPlan.ts';
import { sceneDownloads } from './sceneDownloads.ts';
import { validateLoadout, replaceVisualSlot } from './visualLoadout.ts';
import { newTestProfile } from '../platform/profileTestFixtures.ts';
import { CLASSIC_STAGE_CONTRACT } from '../ui/classicStageContract.ts';
import * as stage from '../ui/classicStageLayout.ts';
import type { AssetId, VisualCatalog } from './visualModel.ts';
const cleanId: AssetId = 'environment.e01.background.clean';
const legacyId = 'environment.e01.background' as const;
const scene = gamePresentation.scene;
// Metadata-only alternate delivery paths. No clean image is fabricated or deployed.
const legacy = catalog.assets[legacyId]!;
const cleanCatalog: VisualCatalog = { ...catalog, assets: { ...catalog.assets, [cleanId]: { ...legacy, path:'art/runtime/test-clean-1x.png', runtime: { ...legacy.runtime!, variants: {
  '1x': { ...legacy.runtime!.variants['1x'], path: 'art/runtime/test-clean-1x.png' },
  '2x': { ...legacy.runtime!.variants['2x'], path: 'art/runtime/test-clean-2x.png' },
} } } } };

test('optional clean background preference keeps stable environment content ID and legacy fallback',()=>{
  validateVisualCatalog(cleanCatalog);
  assert.deepEqual(environmentBackground(cleanCatalog,cleanCatalog.environments['environment.e01']!),{preferred:cleanId,legacy:legacyId});
  const missing={...catalog,assets:{...catalog.assets,[cleanId]:undefined}};
  assert.equal(environmentBackground(missing,missing.environments['environment.e01']!).preferred,legacyId);
  assert.equal(cleanCatalog.environments['environment.e01']!.id,'environment.e01');
});

test('clean and legacy environment paths preserve independently selectable counter combinations',()=>{
  for(const visuals of [catalog,cleanCatalog])for(const counterId of ['counter.c01','counter.studio']){
    const selection=replaceVisualSlot(scene,'counterId',counterId);
    validateLoadout(visuals,selection);
    const ids=planSceneAssets(visuals,{...selection,ingredientIds:scene.ingredientIds}).critical;
    assert.ok(ids.includes(visuals.counters[counterId]!.surface));
    assert.ok(ids.includes(environmentBackground(visuals,visuals.environments['environment.e01']!).preferred));
    assert.equal(selection.environmentId,'environment.e01');
  }
});

test('active scene prefers clean runtime and delivers ordered resolution then legacy fallbacks',()=>{
  const plan=planSceneAssets(cleanCatalog,scene);
  assert.ok(plan.critical.includes(cleanId));assert.ok(!plan.critical.includes(legacyId));
  const result=sceneDownloads(cleanCatalog,scene,{scale:3.6,canonical:true});
  assert.ok(result.paths.includes('art/runtime/test-clean-2x.png'));
  assert.deepEqual(result.fallbackPaths['art/runtime/test-clean-2x.png'],['art/runtime/test-clean-1x.png',legacy.runtime!.variants['1x'].path]);
  assert.equal(result.paths.length,15);assert.equal(new Set(result.paths).size,15);
  assert.ok(result.paths.every(p=>typeof p==='string'&&!p.includes('art-source')));
  assert.ok(result.paths.includes(catalog.assets['ui.pour']!.path),'SVG controls still resolve');
});

test('saved environment/counter content IDs resolve with clean art added or removed without migration',()=>{
  const saved=JSON.parse(JSON.stringify(newTestProfile().equippedLoadout));
  for(const visuals of [catalog,cleanCatalog]){
    validateLoadout(visuals,saved);assert.equal(saved.environmentId,'environment.e01');assert.equal(saved.counterId,'counter.c01');
  }
});

test('drop-in discovery records source presence and provenance without altering historical master records',()=>{
  const config=JSON.parse(readFileSync(new URL('../../scripts/environment-art-sources.json',import.meta.url),'utf8'));
  const inventory=JSON.parse(readFileSync(new URL('../../docs/runtime-art-inventory.json',import.meta.url),'utf8'));
  for(const spec of config.exports){const record=inventory.environmentSources.find((row:{id:string})=>row.id===spec.id);assert.ok(record);assert.equal(record.present,existsSync(new URL('../../'+spec.sourcePath,import.meta.url)));assert.ok(spec.sourcePath.startsWith('art-source/'));assert.equal(spec.id,cleanId);assert.equal(spec.legacyId,legacyId);assert.ok(spec.minimumWidth>=1600&&spec.minimumHeight>=1000);}
  const historical=JSON.parse(readFileSync(new URL('../../docs/artwork-inventory.json',import.meta.url),'utf8'));
  assert.equal(historical.length,21);assert.ok(!historical.some((row:{id:string})=>row.id===cleanId));
});

test('final stage contract references authoritative geometry and preserves the complete 2G layout/framing/CSS',()=>{
  assert.equal(CLASSIC_STAGE_CONTRACT.width,600);assert.equal(CLASSIC_STAGE_CONTRACT.height,440);
  assert.equal(CLASSIC_STAGE_CONTRACT.zones.bartender,stage.BARTENDER_BOUNDS);assert.equal(CLASSIC_STAGE_CONTRACT.controls,stage.PRIMARY_BUTTON_BOUNDS);assert.equal(CLASSIC_STAGE_CONTRACT.layers,stage.STAGE_LAYERS);
  const expected=JSON.parse(readFileSync(new URL('../ui/classicSceneLock.fixture.json',import.meta.url),'utf8'));
  for(const [path,hash]of Object.entries(expected)){const source=readFileSync(new URL('../../'+path,import.meta.url),'utf8').replaceAll('\r\n','\n');assert.equal(createHash('sha256').update(source).digest('hex'),hash,path);}
});


test('Collection environment artwork follows clean preference while retaining content and ownership identity',()=>{
 const item=publicContentItem('environment.e01');
 assert.equal(contentPortrait(item,cleanCatalog),cleanId);assert.equal(item.id,'environment.e01');
 const missing={...catalog,assets:{...catalog.assets,[cleanId]:undefined}};assert.equal(contentPortrait(item,missing),legacyId);
});
