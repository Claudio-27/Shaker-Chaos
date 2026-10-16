import test from 'node:test';
import assert from 'node:assert/strict';
import { fundedProfile, intentFor } from './shopTestFixtures.ts';
import { freeGrantTuning, withFreeGrants } from './progressionTestFixtures.ts';
import { coinPurchaseMinimumLevel, purchaseOffer, quoteStoreOffer, validateStore } from './store.ts';
import { productionStore as store } from '../content/storeCatalog.ts';
import { publicContentCatalog as catalog, publicContentItem } from '../content/publicContentCatalog.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { gainXp, immutable } from '../domain/playerProfile.ts';
import { migrateV1ToV2, validatePlayerProfileV2 } from '../domain/playerProfileV2.ts';
import { evaluateProgressionUnlocks } from '../domain/progression.ts';
import { canEquip, ownershipPolicy, reconcilePlayerProfile } from './playerContent.ts';
import { memoryProfileStorage, newTestProfile, testRepository } from '../platform/profileTestFixtures.ts';
import { profileStorageKey as key } from '../platform/localPlayerProfileRepository.ts';
const quote=(p= fundedProfile(),id='offer.b02')=>quoteStoreOffer(p,store,catalog,id)!;
const buy=(p=fundedProfile(),id='offer.b02')=>purchaseOffer(p,intentFor(p,id),store,catalog,2000);

test('production levels open purchase availability without granting a cosmetic or spending coins',()=>{
  const start=fundedProfile(1000,1),level2=reconcilePlayerProfile(gainXp(start,100,tuning),2000),level3=reconcilePlayerProfile(gainXp(start,250,tuning),2000);
  assert.equal(quote(start,'offer.ice-blue').state,'LOCKED');assert.equal(quote(level2,'offer.ice-blue').state,'AVAILABLE');
  assert.equal(quote(level2).state,'LOCKED');assert.equal(quote(level3).state,'AVAILABLE');
  for(const p of [start,level2,level3]){assert.equal(p.ownership.length,5);assert.equal(p.wallet,start.wallet);assert.equal(p.purchaseTransactionLedger.length,0);}
  assert.deepEqual(tuning.unlocks,[]);
});
test('a funded purchase is refused before the gate, requires a fresh confirmation after it, then succeeds once',()=>{
  for(const [id,level] of [['offer.ice-blue',2],['offer.b02',3]] as const){
    const before=fundedProfile(1000,level-1),intent=intentFor(before,id),refused=purchaseOffer(before,intent,store,catalog,2000);
    assert.equal(refused.status,'OFFER_UNAVAILABLE');assert.equal(refused.profile,before);
    const after=fundedProfile(1000,level);assert.equal(purchaseOffer(after,intent,store,catalog,2000).status,'OFFER_CHANGED');
    const bought=buy(after,id);assert.equal(bought.status,'SUCCESS');assert.equal(bought.profile.progression,after.progression);
    assert.equal(purchaseOffer(bought.profile,intentFor(after,id),store,catalog,2000).status,'ALREADY_PROCESSED');
  }
});
test('gates are canonical validated metadata, optional for ungated coins, and bundles cannot bypass unowned members',()=>{
  const first=fundedProfile(1000,1),loose={offers:store.offers.map(o=>({...o,availability:{published:true}}))};
  for(const level of [0,-1,1.5,Number.MAX_SAFE_INTEGER+1]){
    const bad={...catalog,items:catalog.items.map(i=>i.id==='bartender.b02'?{...i,unlock:[{kind:'currency' as const,currencyId:'coins',availableFromLevel:level}]}:i)};
    assert.throws(()=>validateStore(store,bad));
  }
  const ungated={...catalog,items:catalog.items.map(i=>({...i,unlock:i.unlock.map(u=>u.kind==='currency'?{kind:u.kind,currencyId:u.currencyId}:u)}))};
  validateStore(store,ungated);assert.equal(quoteStoreOffer(first,store,ungated,'offer.b02')!.state,'AVAILABLE');
  assert.equal(coinPurchaseMinimumLevel(ungated.items.find(i=>i.id==='bartender.b02')!),1);
  const q=quoteStoreOffer(fundedProfile(1000,2),loose,catalog,'offer.new-shift')!;assert.equal(q.minimumLevel,3);assert.equal(q.state,'LOCKED');
  const owned=immutable({...first,ownership:[...first.ownership,{contentId:'bartender.b02',source:'progression' as const,grantedAt:1000}]});
  assert.equal(quoteStoreOffer(owned,loose,catalog,'offer.new-shift')!.minimumLevel,2);
  assert.equal(quote(owned).state,'OWNED');assert.ok(canEquip(owned,publicContentItem('bartender.b02')));
});
test('intentional free grants still cross levels, are idempotent and never overwrite purchased ownership',()=>{
  const p=fundedProfile(1000,1),leveled=gainXp(p,700,tuning),granted=evaluateProgressionUnlocks(leveled,freeGrantTuning,ownershipPolicy,2000);
  assert.deepEqual(granted.unlockedContentIds,['bartender.b02','effect.ice-blue']);assert.equal(granted.profile.wallet,p.wallet);
  assert.deepEqual(evaluateProgressionUnlocks(granted.profile,freeGrantTuning,ownershipPolicy,2000).unlockedContentIds,[]);
  const purchased=buy().profile,again=evaluateProgressionUnlocks(purchased,freeGrantTuning,ownershipPolicy,2000);
  assert.deepEqual(again.unlockedContentIds,['effect.ice-blue']);assert.equal(again.profile.ownership.filter(i=>i.contentId==='bartender.b02').length,1);
  assert.equal(again.profile.ownership.find(i=>i.contentId==='bartender.b02')!.source,'currency-purchased');
});
test('bundle level is a real wait-versus-early-ownership choice, including partial ownership',()=>{
  const early=buy(fundedProfile(450,3),'offer.ice-blue').profile;
  assert.equal(early.wallet.coins,300);assert.equal(quote(early,'offer.new-shift').state,'LOCKED');assert.equal(buy(early,'offer.new-shift').status,'OFFER_UNAVAILABLE');
  const later=gainXp(early,750,tuning),bundle=buy(later,'offer.new-shift');
  assert.equal(bundle.status,'SUCCESS');assert.equal(bundle.receipt!.coinsSpent,255);assert.deepEqual(bundle.receipt!.newlyGrantedContentIds,['bartender.b02']);
  assert.deepEqual(bundle.receipt!.alreadyOwnedIncludedIds,['effect.ice-blue']);assert.equal(bundle.profile.ownership.length,7);
  assert.equal(bundle.profile.wallet.lifetimeCoinsSpent,405);assert.equal(buy(bundle.profile,'offer.new-shift').status,'ALREADY_OWNED');
});
test('old V2 free entitlements and pre-gate purchases reload intact without a schema change or retroactive charge',()=>{
  const oldFree=migrateV1ToV2(withFreeGrants(newTestProfile(),250),tuning);
  const oldCatalog={...catalog,items:catalog.items.map(i=>({...i,unlock:i.unlock.map(u=>u.kind==='currency'?{kind:u.kind,currencyId:u.currencyId}:u)}))};
  const old=fundedProfile(1000,1),oldPaid=purchaseOffer(old,intentFor(old,'offer.b02',store,oldCatalog),store,oldCatalog,2000).profile;
  assert.equal(oldPaid.purchaseTransactionLedger.length,1);
  for(const p of [oldFree,oldPaid]){
    validatePlayerProfileV2(p,tuning);const raw=JSON.stringify(p),storage=memoryProfileStorage({[key]:raw}),restored=testRepository(storage).load().profile;
    assert.equal(restored.schemaVersion,2);assert.deepEqual(restored,p);assert.equal(storage.values.get(key),raw);
    assert.equal(reconcilePlayerProfile(restored,3000),restored);assert.ok(canEquip(restored,publicContentItem('bartender.b02')));
  }
});
