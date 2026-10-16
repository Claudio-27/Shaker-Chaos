import test from 'node:test';import assert from 'node:assert/strict';
import { purchaseOffer,quoteStoreOffer,validateStore,createPurchaseIntent } from './store.ts';
import type { StoreCatalog } from './store.ts';
import { fundedProfile,intentFor } from '../application/shopTestFixtures.ts';
import { productionStore as store } from '../content/storeCatalog.ts';
import { publicContentCatalog as catalog } from '../content/publicContentCatalog.ts';
import { immutable,gainXp } from '../domain/playerProfile.ts';
import { PURCHASE_LEDGER_LIMIT,validatePlayerProfileV2 } from '../domain/playerProfileV2.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { reconcilePlayerProfile,equipContent } from '../application/playerContent.ts';
const buy=(p=fundedProfile(),id='offer.b02')=>purchaseOffer(p,intentFor(p,id),store,catalog,2000);

test('production shop offers only two existing optional public cosmetics and one canonical bundle',()=>{
  validateStore(store,catalog);assert.equal(store.offers.length,3);
  assert.equal(catalog.items.find(i=>i.id==='bartender.b02')!.price!.amount,300);assert.equal(catalog.items.find(i=>i.id==='effect.ice-blue')!.price!.amount,150);
  for(const id of ['bartender.b02','effect.ice-blue'])assert.ok(catalog.items.find(i=>i.id===id)!.unlock.some(u=>u.kind==='progression'));
  const owned=fundedProfile().ownership.map(i=>i.contentId);assert.equal(owned.length,5);assert.ok(owned.includes('environment.e01'));
});
test('store rejects negative, fractional, overflowing, private, technical, missing and duplicate configuration',()=>{
  const offer=store.offers[0]!;
  for(const amount of [-1,0.5,Number.MAX_SAFE_INTEGER+1,NaN])assert.throws(()=>validateStore(store,{...catalog,items:catalog.items.map(i=>i.id==='bartender.b02'?{...i,price:{currency:'coins',amount}}:i)}));
  for(const patch of [{visibility:'private' as const},{kind:'ingredient' as const},{unlock:[{kind:'default' as const}]},{unlock:[{kind:'development' as const,entitlementId:'test'}]}])assert.throws(()=>validateStore(store,{...catalog,items:catalog.items.map(i=>i.id==='bartender.b02'?{...i,...patch}:i)}));
  assert.throws(()=>validateStore({...store,offers:[offer,offer]},catalog));
  assert.throws(()=>validateStore({offers:[{id:'missing',kind:'ITEM',contentItemId:'absent',order:0,availability:{published:true}}]},catalog));
  assert.throws(()=>validateStore({offers:[{...store.offers[2]!,kind:'BUNDLE',bundleId:'absent',pricing:{kind:'remaining-items',payPercent:85}}]},catalog));
});
test('bundle validation rejects empty/duplicate/missing/private contents and unsafe discount',()=>{
  for(const ids of [[],['absent'],['bartender.b02','bartender.b02'],['counter.c01']])assert.throws(()=>validateStore(store,{...catalog,bundles:catalog.bundles.map(b=>b.id==='bundle.b02-ice-blue'?{...b,includedContentIds:ids}:b)}));
  for(const payPercent of [-1,100.5,101])assert.throws(()=>validateStore({offers:[{id:'bad',kind:'BUNDLE',bundleId:'bundle.b02-ice-blue',pricing:{kind:'remaining-items',payPercent},order:1,availability:{published:true}}]},catalog));
});
test('item transaction charges exact balance, grants once, preserves XP/stats and never auto-equips',()=>{
  const p=fundedProfile(300),result=buy(p);assert.equal(result.status,'SUCCESS');
  assert.deepEqual(result.profile.wallet,{coins:0,lifetimeCoinsEarned:300,lifetimeCoinsSpent:300});
  assert.equal(result.profile.progression,p.progression);assert.equal(result.profile.stats,p.stats);assert.equal(result.profile.equippedLoadout,p.equippedLoadout);
  assert.equal(result.profile.ownership.at(-1)?.source,'currency-purchased');assert.deepEqual(result.receipt?.newlyGrantedContentIds,['bartender.b02']);
  assert.equal(p.wallet.coins,300);assert.equal(validatePlayerProfileV2(result.profile,progressionTuning),result.profile);
  const freeCatalog={...catalog,items:catalog.items.map(i=>i.id==='bartender.b02'?{...i,price:{currency:'coins',amount:0}}:i)},empty=fundedProfile(0);
  const free=purchaseOffer(empty,intentFor(empty,'offer.b02',store,freeCatalog),store,freeCatalog,2000);assert.equal(free.status,'SUCCESS');assert.equal(free.receipt!.coinsSpent,0);validatePlayerProfileV2(free.profile,progressionTuning);
  const equipped=equipContent(result.profile,'bartender.b02',2000);assert.equal(equipped.equippedLoadout.environmentId,p.equippedLoadout.environmentId);assert.equal(equipped.equippedLoadout.counterId,p.equippedLoadout.counterId);
});
test('insufficient/owned/unavailable/config-invalid purchases never mutate wallet or entitlement',()=>{
  const p=fundedProfile(299),r=buy(p);assert.equal(r.status,'INSUFFICIENT_FUNDS');assert.equal(r.profile,p);assert.equal(r.quote!.missingCoins,1);
  const owned=buy(fundedProfile()).profile;assert.equal(buy(owned).status,'ALREADY_OWNED');assert.equal(buy(owned).profile,owned);
  for(const availability of [{published:false},{published:true,minimumLevel:10}]){
    const custom={offers:[{...store.offers[0]!,availability}]};const q=quoteStoreOffer(p,custom,catalog,'offer.b02')!;
    assert.equal(purchaseOffer(p,{...intentFor(p),quoteToken:q.token},custom,catalog,2000).status,'OFFER_UNAVAILABLE');
  }
  assert.equal(purchaseOffer(p,intentFor(p),store,{...catalog,items:[]},2000).status,'INVALID_CONFIGURATION');
});
test('same purchase identity returns the receipt; new identity for owned item cannot charge',()=>{
  const p=fundedProfile(),intent=intentFor(p),one=purchaseOffer(p,intent,store,catalog,2000),two=purchaseOffer(one.profile,intent,store,catalog,3000);
  assert.equal(two.status,'ALREADY_PROCESSED');assert.equal(two.receipt,one.receipt);assert.equal(two.profile,one.profile);assert.equal(buy(one.profile).status,'ALREADY_OWNED');
  assert.equal(purchaseOffer(one.profile,{...intent,offerId:'offer.ice-blue'},store,catalog,3000).status,'PROFILE_CONFLICT');
});
test('full and partial bundles charge remaining standalone cost less 15 percent, with exact grants',()=>{
  const full=buy(fundedProfile(),'offer.new-shift');assert.equal(full.receipt!.coinsSpent,382);assert.deepEqual(full.receipt!.newlyGrantedContentIds,['bartender.b02','effect.ice-blue']);assert.equal(full.profile.ownership.length,7);
  for(const [first,price,saving,remaining]of [['offer.b02',127,23,'effect.ice-blue'],['offer.ice-blue',255,45,'bartender.b02']] as const){
    const owned=buy(fundedProfile(),first).profile,q=quoteStoreOffer(owned,store,catalog,'offer.new-shift')!,partial=buy(owned,'offer.new-shift');
    assert.equal(q.priceCoins,price);assert.equal(q.savings,saving);assert.equal(partial.receipt!.coinsSpent,price);assert.deepEqual(partial.receipt!.newlyGrantedContentIds,[remaining]);assert.equal(partial.receipt!.alreadyOwnedIncludedIds.length,1);
  }
  const complete=buy(full.profile,'offer.new-shift');assert.equal(complete.status,'ALREADY_OWNED');assert.equal(complete.profile,full.profile);
});
test('explicit bundle PriceMetadata is preserved with deterministic remaining-cost proration',()=>{
  const priced={...catalog,bundles:catalog.bundles.map(b=>b.id==='bundle.b02-ice-blue'?{...b,price:{currency:'coins',amount:360}}:b)};
  const explicit:StoreCatalog={offers:[{id:'explicit',kind:'BUNDLE',bundleId:'bundle.b02-ice-blue',pricing:{kind:'catalog-prorated'},order:0,availability:{published:true}}]};validateStore(explicit,priced);
  assert.equal(quoteStoreOffer(fundedProfile(),explicit,priced,'explicit')!.priceCoins,360);
  assert.equal(quoteStoreOffer(buy().profile,explicit,priced,'explicit')!.priceCoins,120);
  assert.throws(()=>validateStore(store,priced),'implicit discount must not override an intentional catalog bundle price');
});
test('changed quote, profile identity, ordinal and overflow fail before spending',()=>{
  const p=fundedProfile();for(const patch of [{profileId:'other'},{ordinal:7},{quoteToken:'stale'}])assert.notEqual(purchaseOffer(p,{...intentFor(p),...patch},store,catalog,2000).status,'SUCCESS');
  const changed={...catalog,items:catalog.items.map(i=>i.id==='bartender.b02'?{...i,price:{currency:'coins',amount:301}}:i)};
  assert.equal(purchaseOffer(p,intentFor(p),store,changed,2000).status,'OFFER_CHANGED');
  const max=immutable({...p,nextPurchaseOrdinal:Number.MAX_SAFE_INTEGER});assert.equal(purchaseOffer(max,intentFor(max),store,catalog,2000).status,'INVALID_CONFIGURATION');
  assert.equal(p.wallet.lifetimeCoinsSpent,0);
});
test('purchased-before-level ownership is retained and later progression produces no duplicate unlock',()=>{
  const purchased=buy().profile,leveled=reconcilePlayerProfile(gainXp(purchased,100,progressionTuning),2000);
  assert.equal(leveled.ownership.filter(i=>i.contentId==='bartender.b02').length,1);assert.equal(leveled.ownership.find(i=>i.contentId==='bartender.b02')!.source,'currency-purchased');
  assert.equal(reconcilePlayerProfile(gainXp(fundedProfile(),100,progressionTuning),2000).ownership.at(-1)!.source,'progression');
});
test('bounded ledger evicts receipts but watermark prevents old identities from spending again',()=>{
  const items=Array.from({length:PURCHASE_LEDGER_LIMIT+2},(_,n)=>({id:'test-cosmetic-'+n,displayName:'Synthetic '+n,kind:'effect' as const,visibility:'public' as const,visualDefinitionId:'test',unlock:[{kind:'currency' as const,currencyId:'coins'}],price:{currency:'coins',amount:1}}));
  const testCatalog={items,bundles:[]},testStore:StoreCatalog={offers:items.map((i,n)=>({id:'offer-'+n,kind:'ITEM',contentItemId:i.id,order:n,availability:{published:true}}))};
  let p=fundedProfile(1000);const old=intentFor(p,'offer-0',testStore,testCatalog);
  for(let n=0;n<PURCHASE_LEDGER_LIMIT+1;n++){const r=purchaseOffer(p,intentFor(p,'offer-'+n,testStore,testCatalog),testStore,testCatalog,2000+n);assert.equal(r.status,'SUCCESS');p=r.profile;}
  assert.equal(p.purchaseTransactionLedger.length,PURCHASE_LEDGER_LIMIT);assert.equal(p.purchaseTransactionLedger[0]!.ordinal,2);validatePlayerProfileV2(p,progressionTuning);
  p=validatePlayerProfileV2(JSON.parse(JSON.stringify(p)),progressionTuning);
  const replay=purchaseOffer(p,{...old,offerId:'offer-'+(PURCHASE_LEDGER_LIMIT+1)},testStore,testCatalog,4000);assert.equal(replay.status,'ALREADY_PROCESSED');assert.equal(replay.profile,p);
});

test('new deliberate actions get different IDs; pending retries reuse identity and cannot forge a new ordinal',()=>{
  const p=fundedProfile(),q=quoteStoreOffer(p,store,catalog,'offer.b02')!,a=createPurchaseIntent(p,q,'action-a'),b=createPurchaseIntent(p,q,'action-b');
  assert.notEqual(a.transactionId,b.transactionId);const done=purchaseOffer(p,a,store,catalog,2000);
  assert.equal(purchaseOffer(done.profile,a,store,catalog,2000).status,'ALREADY_PROCESSED');
  const fresh=intentFor(done.profile,'offer.ice-blue');assert.equal(purchaseOffer(done.profile,{...fresh,transactionId:a.transactionId},store,catalog,2000).status,'INVALID_CONFIGURATION');
});
