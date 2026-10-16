import test from 'node:test';import assert from 'node:assert/strict';
import { createElement } from 'react';import { renderToStaticMarkup } from 'react-dom/server';import { createServer } from 'vite';
import { fundedProfile,intentFor } from '../application/shopTestFixtures.ts';
import { createPlayerController } from '../application/playerController.ts';
import { testRepository,memoryProfileStorage } from '../platform/profileTestFixtures.ts';
import { profileStorageKey } from '../platform/localPlayerProfileRepository.ts';
import { publicVisualCatalog as visuals } from '../content/publicVisualCatalog.ts';
import { storefront,purchaseFeedback } from './shopPresentation.ts';
import { purchaseOffer } from '../application/store.ts';
import { productionStore } from '../content/storeCatalog.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { CLASSIC_STAGE_CONTRACT } from './classicStageContract.ts';
import { newClassicGame,transitionClassicGame } from '../application/classicGame.ts';
import { gameDependencies } from '../application/productionBootstrap.ts';
import { createCompatibilityInput } from '../domain/session.ts';
const server=await createServer({configFile:false,server:{middlewareMode:true,watch:null,hmr:false},appType:'custom'});
const shop=await server.ssrLoadModule('/src/ui/Shop.tsx') as typeof import('./Shop.tsx');
const collection=await server.ssrLoadModule('/src/ui/PlayerProgression.tsx') as typeof import('./PlayerProgression.tsx');
const assets=await server.ssrLoadModule('/src/ui/AssetVisual.tsx') as typeof import('./AssetVisual.tsx');
const controller=(coins=1000)=>createPlayerController(testRepository(memoryProfileStorage({[profileStorageKey]:JSON.stringify(fundedProfile(coins))})),'ui-shop',()=>2000);
const render=(node:Parameters<typeof renderToStaticMarkup>[0])=>renderToStaticMarkup(createElement(assets.VisualAssetsProvider,{catalog:visuals,children:node}));
test.after(()=>server.close());

test('Collection starts on owned/equip surface; Shop tab exists but its acquisition cards stay unmounted',()=>{
  const c=controller(),html=render(createElement(collection.Collection,{profile:c.snapshot().profile,visuals,onEquip(){},onClose(){},shop:{snapshot:c.snapshot(),controller:c}}));
  assert.match(html,/role="tablist"/);assert.match(html,/id="collection-tab"[^>]*aria-selected="true"/);assert.match(html,/>Negozio</);assert.doesNotMatch(html,/Negozio cosmetici|shop-grid|shop-preview/);
});
test('real storefront renders prices, purchase levels, insufficiency and explicit category filters',()=>{
  const c=controller(0),html=render(createElement(shop.Storefront,{snapshot:c.snapshot(),controller:c,visuals,onCollection(){}}));
  assert.match(html,/300 monete/);assert.match(html,/150 monete/);assert.match(html,/Ti servono altre 300 monete/);assert.match(html,/Acquistabile dal livello 3/);assert.doesNotMatch(html,/Oppure sblocca|Gratis al livello/);assert.match(html,/disabled=""[^>]*aria-label="Acquista Bartender 02 per 300 monete"/);
  assert.match(html,/Categorie negozio/);assert.match(html,/Solo monete del gioco/);assert.doesNotMatch(html,/__art-source|src=".*b02|href=".*b02/,'previews are intersection-deferred');
});
test('owned item purchase is replaced by equip, bundle completion and savings use only remaining items',async()=>{
  const c=controller();await c.purchase(intentFor(c.snapshot().profile));const quotes=storefront(c.snapshot().profile),q=quotes.find(q=>q.kind==='BUNDLE')!;
  assert.equal(q.priceCoins,127);assert.equal(q.savings,23);
  const html=render(createElement(shop.Storefront,{snapshot:c.snapshot(),controller:c,visuals,onCollection(){}}));
  assert.match(html,/✓ Posseduto/);assert.match(html,/Equipaggia Bartender 02/);assert.match(html,/Risparmi 23 monete/);assert.match(html,/Già posseduto/);assert.match(html,/Da ottenere/);assert.doesNotMatch(html,/aria-label="Acquista Bartender 02/);
});
test('confirmation exposes final price, explicit confirm/cancel and screen-readable partial bundle contents',()=>{
  const p=purchaseOffer(fundedProfile(),intentFor(fundedProfile()),productionStore,publicContentCatalog,2000).profile,q=storefront(p).find(q=>q.kind==='BUNDLE')!;
  const html=render(createElement(shop.PurchaseConfirmation,{quote:q,onConfirm:async()=>({status:'PROFILE_CONFLICT',profile:p,persistence:'saved'} as const),onCancel(){}}));
  assert.match(html,/aria-labelledby="purchase-title"/);assert.match(html,/127 monete del gioco/);assert.match(html,/Bartender 02.*già posseduto/);assert.match(html,/Scia azzurra.*da ottenere/);assert.match(html,/Conferma acquisto/);assert.match(html,/Annulla/);
});
test('purchase feedback distinguishes durable and session-only grants; store sorting is explicit and stable',()=>{
  const r=purchaseOffer(fundedProfile(),intentFor(fundedProfile()),productionStore,publicContentCatalog,2000);
  assert.match(purchaseFeedback({...r,persistence:'saved'}),/Acquistato! Bartender 02/);assert.doesNotMatch(purchaseFeedback({...r,persistence:'saved'}),/sessione/);
  assert.match(purchaseFeedback({...r,persistence:'memory'}),/Solo per questa sessione/);assert.match(purchaseFeedback({...r,status:'PROFILE_CONFLICT',persistence:'conflict'}),/un’altra scheda/);
  assert.equal(storefront(r.profile).at(-1)!.offerId,'offer.b02');
});
test('shop render, purchase, equip and close preserve frozen cocktail score/history and the complete stage contract',()=>{
  const geometry=JSON.stringify(CLASSIC_STAGE_CONTRACT);let game=newClassicGame(gameDependencies);
  for(const action of [{type:'PourStarted',ingredientId:'orchard',operationId:0,atMs:0},{type:'PourEnded',operationId:0,reason:'completed',atMs:10800},{type:'IceAdded',requestedUnits:1,atMs:10800},{type:'IceAdded',requestedUnits:1,atMs:10800},{type:'ShakeStarted',operationId:1,atMs:10800},{type:'ShakeEnded',operationId:1,reason:'completed',atMs:11000},{type:'GarnishChanged',garnishId:gameDependencies.profile.garnish.id,atMs:11000},{type:'Served',atMs:11000}] as const)game=transitionClassicGame(game,action,gameDependencies);
  const frozen=JSON.stringify(game),c=controller();render(createElement(shop.Storefront,{snapshot:c.snapshot(),controller:c,visuals,onCollection(){}}));
  const r=purchaseOffer(c.snapshot().profile,intentFor(c.snapshot().profile),productionStore,publicContentCatalog,2000);c.update(()=>r.profile);c.equip('bartender.b02');
  render(createElement(collection.Collection,{profile:c.snapshot().profile,visuals,onEquip(){},onClose(){}}));
  assert.equal(JSON.stringify(CLASSIC_STAGE_CONTRACT),geometry);assert.equal(JSON.stringify(game),frozen);assert.deepEqual(gameDependencies.scoringEngine.evaluate(createCompatibilityInput(game.session)),game.result);assert.equal(game.result!.totalScore,9550);
});
