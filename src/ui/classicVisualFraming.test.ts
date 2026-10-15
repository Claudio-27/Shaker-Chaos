import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { VISUAL_SAMPLES, BACKGROUND_FRAMING, visualPlacement, visualFramingStyle } from './classicVisualFraming.ts';
import { BARTENDER_BOUNDS, BOTTLE_SHELF_BOUNDS, HUD_BOUNDS, LEVEL_BOUNDS, XP_BOUNDS, COINS_BOUNDS, COLLECTION_BOUNDS, COUNTER_BOUNDS, GLASS_BOUNDS, SHAKER_BOUNDS, bottleSlot } from './classicStageLayout.ts';
import { publicVisualCatalog } from '../content/publicVisualCatalog.ts';
import { gameDependencies, gamePresentation } from '../application/productionBootstrap.ts';
import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import type { ClassicGameAction } from '../application/classicGame.ts';
import { createPlayerController } from '../application/playerController.ts';
import { testRepository } from '../platform/profileTestFixtures.ts';
import { emptyMix } from '../domain/mix.ts';
import type { AssetId } from '../content/visualModel.ts';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('alpha measurements match catalog canvases and stay finite, positive, immutable and inside each source',()=>{
  assert.equal(Object.keys(VISUAL_SAMPLES).length,16);
  for(const [id,s] of Object.entries(VISUAL_SAMPLES)){
    const asset=publicVisualCatalog.assets[id as AssetId]!;assert.deepEqual(s.source,{width:asset.width,height:asset.height});
    assert.ok(Object.isFrozen(s)&&Object.isFrozen(s.opaque));
    for(const n of Object.values(s.opaque))assert.ok(Number.isSafeInteger(n)&&n>=0);
    assert.ok(s.opaque.width>0&&s.opaque.height>0);assert.ok(s.opaque.x+s.opaque.width<=s.source.width);assert.ok(s.opaque.y+s.opaque.height<=s.source.height);
  }
});
test('all ten bartender silhouettes share a 292px height, x495 anchor and y348 baseline without stretching',()=>{
  for(const host of ['b01','b02'])for(const pose of ['idle','tasting','rough','balanced','excellent']){
    const p=visualPlacement(`bartender.${host}.${pose}`,'bartender')!;
    near(p.visible.height,292);near(p.visible.y+BARTENDER_BOUNDS.y,56);near(p.centerX+BARTENDER_BOUNDS.x,495);near(p.baseline+BARTENDER_BOUNDS.y,348);
    near(p.canvas.width/p.source.width,p.canvas.height/p.source.height);assert.ok(p.canvas.width<p.source.width);assert.ok(p.visible.width>150&&p.visible.width<211);
  }
});
test('all four bottle slots retain their pitch and shelf bounds after opaque framing and selection lift',()=>{
  for(let slot=0;slot<4;slot++)for(const id of ['ingredient.bottle01','ingredient.bottle02','ingredient.bottle03']){
    const {visual}=bottleSlot(slot),p=visualPlacement(id,'bottle')!;
    assert.ok(p.visible.width>=30&&p.visible.width<=48);assert.ok(p.visible.height>=110&&p.visible.height<=130);
    const x=visual.x+p.visible.x,y=visual.y+p.visible.y;
    assert.ok(x>=BOTTLE_SHELF_BOUNDS.x&&x+p.visible.width<=BOTTLE_SHELF_BOUNDS.x+BOTTLE_SHELF_BOUNDS.width);
    assert.ok(y-3>=BOTTLE_SHELF_BOUNDS.y);near(y+p.visible.height,208);near(visual.x+p.centerX,bottleSlot(slot).centerX);
    assert.match(JSON.stringify(visualFramingStyle(id,'bottle')),/var\(--bottle-art-x\)/);assert.match(JSON.stringify(visualFramingStyle(id,'bottle')),/var\(--bottle-art-y\)/);
  }
});
test('foreground counter spans all 600px; shaker/glass keep physical size and source aspect ratio',()=>{
  const counter=visualPlacement('counter.c01.surface','counter')!;
  near(counter.visible.x,0);near(counter.visible.width,600);near(COUNTER_BOUNDS.y+counter.visible.y,292);
  const shaker=visualPlacement('gameplay.chrome-shaker','shaker')!,glass=visualPlacement('gameplay.martini-glass','glass')!;
  near(shaker.visible.height,108);near(SHAKER_BOUNDS.x+shaker.centerX,283);near(SHAKER_BOUNDS.y+shaker.visible.y+54,278);
  near(glass.visible.height,62);near(GLASS_BOUNDS.y+glass.baseline,332);
  for(const p of [shaker,glass,counter])near(p.canvas.width/p.canvas.height,p.source.width/p.source.height);
});
test('background crop ends before the baked counter; unknown artwork keeps its regular fallback layout',()=>{
  assert.ok(580*BACKGROUND_FRAMING.height/BACKGROUND_FRAMING.source.height>BACKGROUND_FRAMING.clipBottom);
  assert.equal(visualPlacement('gameplay.shaker','shaker'),null);assert.equal(visualFramingStyle('bartender.milo.idle','bartender'),undefined);
  assert.equal(visualFramingStyle('bartender.b01.idle'),undefined);
  assert.deepEqual(Object.keys(visualFramingStyle('bartender.b01.idle','bartender')!).sort(),['--art-height','--art-left','--art-top','--art-width']);
});
test('production domain/application imports cannot acquire UI crop or scale dependencies',()=>{
  for(const dir of ['../domain/','../application/'])for(const file of readdirSync(new URL(dir,import.meta.url)))if(file.endsWith('.ts')&&!file.endsWith('.test.ts')){
    const source=readFileSync(new URL(dir+file,import.meta.url),'utf8');assert.doesNotMatch(source,/(?:from\s*|import\s*\()["'][^"']*(?:ui\/|classicVisualFraming|classicStageLayout)/,file);
  }
});
const goldens=JSON.parse(readFileSync(new URL('./classicVisualRegression.fixture.json',import.meta.url),'utf8')) as {name:string;actions:ClassicGameAction[];expected:{history:string;result:string;reward:string;score:number}}[];
const sha=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
for(const fixture of goldens)test(`2E regression: ${fixture.name} retains the exact canonical history, RoundResult and reward`,()=>{
  let game=newClassicGame(gameDependencies);for(const action of fixture.actions)game=transitionClassicGame(game,action,gameDependencies);
  const player=createPlayerController(testRepository(),'2e-golden',()=>2000);player.bindAttempt(0);player.settle(game.result!,0);
  assert.equal(sha(game.session.history),fixture.expected.history);assert.equal(sha(game.result),fixture.expected.result);assert.equal(game.result!.totalScore,fixture.expected.score);assert.equal(sha(player.snapshot().reward),fixture.expected.reward);
});
const server=await createServer({configFile:false,server:{middlewareMode:true,watch:null},appType:'custom'});
const assets=await server.ssrLoadModule('/src/ui/AssetVisual.tsx') as typeof import('./AssetVisual.tsx');
const stage=await server.ssrLoadModule('/src/ui/GameStage.tsx') as typeof import('./GameStage.tsx');
test.after(async()=>{await server.close();});
const render=(node:Parameters<typeof renderToStaticMarkup>[0])=>renderToStaticMarkup(createElement(assets.VisualAssetsProvider,{catalog:publicVisualCatalog,children:node}));
test('real AssetImage applies framing to the resolved fallback and retains original dimensions and alt text',()=>{
  const html=render(createElement(assets.AssetImage,{assetId:'bartender.missing',fallback:'bartender.b01.idle',framing:'bartender',alt:'Bartender di prova'}));
  assert.match(html,/data-resolved-asset="bartender.b01.idle"/);assert.match(html,/data-visual-framing="bartender"/);assert.match(html,/width="1086" height="1448"/);assert.match(html,/aria-label="Bartender di prova"/);assert.match(html,/--art-width:/);
});
test('real framed bottle shelf preserves accessible selection, canonical quantities and independent hitboxes',()=>{
  const html=render(createElement(stage.BottleShelf,{loadout:gamePresentation.scene,ingredients:gamePresentation.catalog.ingredients,visuals:publicVisualCatalog,mix:emptyMix(),selectedId:'orchard',disabled:false,pourFeedback:'idle',onSelect(){},formatVolume:String}));
  assert.match(html,/aria-pressed="true"/);assert.match(html,/aria-label="Infuso del frutteto, 0 nel mix"/);assert.equal((html.match(/data-visual-framing="bottle"/g)??[]).length,3);assert.match(html,/data-hitbox="bottle"/);assert.match(html,/role="group" aria-label="Mensola 1"/);
});

test('result typography formats 9550 as 9.550 without changing the canonical score',()=>{
  let game=newClassicGame(gameDependencies);for(const action of goldens.find(item=>item.name==='excellent')!.actions)game=transitionClassicGame(game,action,gameDependencies);
  const html=render(createElement(stage.ScoreHUD,{result:game.result,stage:'breakdown',title:'Un brindisi!',line:'Ottimo mix',ingredients:gamePresentation.catalog.ingredients,profile:gameDependencies.profile,titleRef:{current:null},skipRef:{current:null},onSkip(){},onNewDrink(){}}));
  assert.match(html,/>9\.550<\/strong>/);assert.match(html,/\/ 10\.000/);assert.equal(game.result!.totalScore,9550);
});

test('secondary HUD visual children stay inside the unchanged 30px canonical strip',()=>{
  for(const b of [LEVEL_BOUNDS,XP_BOUNDS,COINS_BOUNDS,COLLECTION_BOUNDS]){
    assert.ok(b.x>=HUD_BOUNDS.x&&b.x+b.width<=HUD_BOUNDS.x+HUD_BOUNDS.width);
    assert.ok(b.y>=HUD_BOUNDS.y&&b.y+b.height<=HUD_BOUNDS.y+HUD_BOUNDS.height);
  }
});

test('runtime raster uses the original SVG viewBox and registered crop coordinates without moving its frame',()=>{
 const asset=publicVisualCatalog.assets['ingredient.bottle01']!,crop=asset.runtime!.crop;
 const html=render(createElement(assets.AssetImage,{assetId:'ingredient.bottle01',framing:'bottle'}));
 assert.match(html,/viewBox="0 0 1024 1536"/);assert.ok(html.includes('x="'+crop.x+'" y="'+crop.y+'" width="'+crop.width+'" height="'+crop.height+'"'));
 assert.ok(html.includes(asset.runtime!.variants['1x'].path));assert.doesNotMatch(html,/art-source|__art-source/);assert.match(html,/aria-hidden="true"/);
});
test('2G changes only image-type selectors in the three locked 2F stylesheets, with identical specificity',()=>{
 const baseline=JSON.parse(readFileSync(new URL('./runtimeStyleRegression.fixture.json',import.meta.url),'utf8')) as Record<string,string>;
 for(const [path,expected] of Object.entries(baseline)){
  const source=readFileSync(new URL('../../'+path,import.meta.url),'utf8').replaceAll('\r\n','\n').replaceAll(':is(img, svg)','img');
  assert.equal(createHash('sha256').update(source).digest('hex'),expected,path);
 }
});

test('environment renderer gracefully chooses legacy when clean art is unregistered, without a technical player message',()=>{
 const missing={...publicVisualCatalog,assets:{...publicVisualCatalog.assets,'environment.e01.background.clean':undefined}};
 const html=renderToStaticMarkup(createElement(assets.VisualAssetsProvider,{catalog:missing,children:createElement(assets.EnvironmentArt,{environment:missing.environments['environment.e01']!})}));
 assert.match(html,/environment-background/);assert.match(html,/data-resolved-asset="environment.e01.background"/);assert.doesNotMatch(html,/Artwork non disponibile|art-source|test-clean/);
});
