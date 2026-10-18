import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { createPlayerController } from '../application/playerController.ts';
import { testRepository,newTestProfile } from '../platform/profileTestFixtures.ts';
import { playerHudView,collectionCard,profileWarning,equipmentFeedback } from './progressionPresentation.ts';
import { publicContentItem } from '../content/publicContentCatalog.ts';
import { freeGrantTuning } from '../application/progressionTestFixtures.ts';
import { evaluateProgressionUnlocks } from '../domain/progression.ts';
import { ownershipPolicy } from '../application/playerContent.ts';
import { progressionFromLifetime } from '../domain/playerProfile.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { publicVisualCatalog } from '../content/publicVisualCatalog.ts';
const server=await createServer({configFile:false,server:{middlewareMode:true,watch:null},appType:'custom'});
const ui=await server.ssrLoadModule('/src/ui/PlayerProgression.tsx') as typeof import('./PlayerProgression.tsx');
const assets=await server.ssrLoadModule('/src/ui/AssetVisual.tsx') as typeof import('./AssetVisual.tsx');
const render=(node: Parameters<typeof renderToStaticMarkup>[0])=>renderToStaticMarkup(createElement(assets.VisualAssetsProvider,{catalog:publicVisualCatalog,children:node}));
test.after(async()=>{await server.close();});
test('real progression HUD renders readable level, XP/coins and meaningful progressbar labels',()=>{
  const player=createPlayerController(testRepository(),'ui-synthetic',()=>2000);player.bindAttempt(0);
  player.settle(Object.freeze({totalScore:10000,failed:false,mechanicalReactionTierId:'legendary'}),0);
  const html=render(createElement(ui.PlayerHUD,{snapshot:player.snapshot()}));
  assert.match(html,/Livello 2/);assert.match(html,/20 \/ 150 XP/);assert.match(html,/45 monete/);
  assert.match(html,/aria-valuenow="20"/);assert.match(html,/aria-valuemax="150"/);assert.match(html,/aria-label="Esperienza verso il prossimo livello"/);
  const memory=render(createElement(ui.PlayerHUD,{snapshot:{...player.snapshot(),status:'memory'}}));assert.match(memory,/questa sessione.*non riesce a salvarli/);
});
test('real reward card renders XP/coins, level-up and canonical unlocked display name',()=>{
  const player=createPlayerController(testRepository(),'ui-synthetic',()=>2000);player.bindAttempt(0);
  player.settle(Object.freeze({totalScore:10000,failed:false,mechanicalReactionTierId:'legendary'}),0);
  const reward=player.snapshot().reward!;
  assert.deepEqual(reward.unlockedContentIds,[],'production level-up grants no coin cosmetic');
  const free=evaluateProgressionUnlocks(player.snapshot().profile,freeGrantTuning,ownershipPolicy,2000);
  const html=render(createElement(ui.RewardPresentation,{reward:{...reward,unlockedContentIds:free.unlockedContentIds},visuals:publicVisualCatalog}));
  assert.match(html,/\+120 XP/);assert.match(html,/\+45 monete/);assert.match(html,/Nuovo livello! 1 → 2/);assert.match(html,/Bartender 02/);
  assert.doesNotMatch(html.replace(/<[^>]+>/g,' '),/bartender\.b02|settlementId|schemaVersion/);
});
test('real Collection marks owned/equipped/locked states, denies locked actions and loads no locked portrait',()=>{
  const html=render(createElement(ui.Collection,{profile:newTestProfile(),visuals:publicVisualCatalog,onEquip(){},onClose(){}}));
  assert.match(html,/aria-labelledby="collection-title"/);assert.match(html,/aria-label="Chiudi collezione"/);
  assert.match(html,/Bartender 01, equipaggiato/);assert.match(html,/Bartender 02, bloccato/);assert.match(html,/Acquistabile dal livello 3 · 300 monete/);
  assert.match(html,/disabled=""[^>]*aria-label="Acquistabile dal livello 3 · 300 monete"/);assert.doesNotMatch(html,/art\/bartenders\/b02/);
  assert.equal(collectionCard(newTestProfile(),publicContentItem('bartender.b02')).owned,false);
});
test('capped XP bar stays bounded and displays a friendly maximum label',()=>{
  const profile={...newTestProfile(),progression:progressionFromLifetime(Number.MAX_SAFE_INTEGER,progressionTuning)};
  const view=playerHudView(profile);assert.equal(view.value,view.maximum);assert.equal(view.xp,'Livello massimo');
});

const help=await server.ssrLoadModule('/src/ui/PlayerHelp.tsx') as typeof import('./PlayerHelp.tsx');
test('light help exposes commands, recipe/progression and local/offline disclosures with an explicit guide replay action',()=>{
  const html=renderToStaticMarkup(createElement(help.PlayerHelp,{onGuide(){}}));
  assert.match(html,/aria-labelledby="help-title"/);assert.equal((html.match(/<details/g)||[]).length,2);
  assert.match(html,/Rivedi la guida/);assert.match(html,/Spazio o Invio/);assert.match(html,/una sola volta/);
  assert.doesNotMatch(html,/schemaVersion|localStorage|VolumeUnit|Runtime|profileId/);
});
test('contextual first-drink guide stays skippable through mixing and explains progression only at the result',()=>{
  for(const phase of ['mix','shake','serve','result'] as const){const html=renderToStaticMarkup(createElement(help.FirstDrinkGuide,{phase,hasLiquid:phase!=='mix'}));
    assert.match(html,/aria-label="Guida del primo drink"/);assert.match(renderToStaticMarkup(createElement(help.GuideDismiss,{phase,onDismiss(){}})),/<button/);assert.doesNotMatch(html,/role="dialog"/);
    if(phase==='result')assert.match(html,/XP.*monete/);else assert.doesNotMatch(html,/Gli XP/);}
});
test('recovery, conflicts and temporary saves have readable copy while diagnostic payloads stay private to DEV',()=>{
  const c=createPlayerController(testRepository(),'copy',()=>2000),base=c.snapshot();
  for(const status of ['memory','conflict','unsupported','recovered'] as const){const text=profileWarning({...base,status,diagnostics:[{kind:'corrupt',detail:'INTERNAL_DETAIL',rawPreview:'PRIVATE_RAW'}]});
    assert.ok(text.length>20);assert.doesNotMatch(text,/INTERNAL_DETAIL|PRIVATE_RAW|schemaVersion|JSON/);}
  assert.equal(profileWarning(base),'');assert.equal(equipmentFeedback(base.profile.equippedLoadout,base.profile.equippedLoadout),'');
  assert.match(equipmentFeedback(base.profile.equippedLoadout,{...base.profile.equippedLoadout,bartenderId:'bartender.b02'}),/Equipaggiato/);
});
