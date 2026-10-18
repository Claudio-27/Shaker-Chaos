import test from 'node:test';import assert from 'node:assert/strict';
import { fundedProfile,intentFor,fakeWebLocks } from '../application/shopTestFixtures.ts';
import { purchaseOffer } from '../application/store.ts';
import { productionStore } from '../content/storeCatalog.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { migrateV1ToV2,validatePlayerProfileV2 } from '../domain/playerProfileV2.ts';
import { earnCoins,immutable } from '../domain/playerProfile.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { memoryProfileStorage,newTestProfile,testRepository } from './profileTestFixtures.ts';
import { createLocalPlayerProfileRepository,migratePlayerProfile,profileStorageKey as key } from './localPlayerProfileRepository.ts';
import { issueRoundIdentity,settleRoundReward } from '../domain/progression.ts';
import { ownershipPolicy,reconcilePlayerProfile } from '../application/playerContent.ts';
import { createProfileWriteCoordinator } from './profileWriteCoordinator.ts';
import { createPlayerController } from '../application/playerController.ts';
const success={totalScore:9550,failed:false,mechanicalReactionTierId:'excellent'};
function fundedRepository(){return testRepository(memoryProfileStorage({[key]:JSON.stringify(fundedProfile())}));}

test('V1→V2 migration preserves every original field and adds only explicit versioned economy metadata',()=>{
  const issued=issueRoundIdentity(newTestProfile(),'migrated-round',0,1200),settled=settleRoundReward(issued.profile,success,issued.round,tuning,ownershipPolicy,1300);
  const original=immutable({...settled.profile,wallet:earnCoins(settled.profile.wallet,32)}),before=JSON.stringify(original),next=migrateV1ToV2(original,tuning);
  const {schemaVersion,revision,nextPurchaseOrdinal,purchaseTransactionLedger,...rest}=next;
  assert.equal(schemaVersion,2);assert.equal(revision,0);assert.equal(nextPurchaseOrdinal,1);assert.deepEqual(purchaseTransactionLedger,[]);assert.deepEqual({...rest,schemaVersion:1},original);
  assert.equal(JSON.stringify(original),before);
});
test('repository migrates and persists V1 once; future schemas remain protected',()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(newTestProfile())}),repo=testRepository(storage);const p=repo.load().profile;
  assert.equal(p.schemaVersion,3);assert.equal(JSON.parse(storage.values.get(key)!).schemaVersion,3);const raw=storage.values.get(key);
  assert.deepEqual(testRepository(storage).load().profile,p);assert.equal(storage.values.get(key),raw);
  assert.equal(migratePlayerProfile(JSON.stringify({schemaVersion:4}),tuning).kind,'future-unsupported');
});
test('V2 validation rejects malformed receipts, spent totals, revisions and watermarks',()=>{
  const p=fundedProfile(),bought=purchaseOffer(p,intentFor(p),productionStore,publicContentCatalog,2000).profile;
  for(const bad of [{...bought,revision:-1},{...bought,nextPurchaseOrdinal:99},{...bought,purchaseTransactionLedger:[]},{...bought,purchaseTransactionLedger:[{...bought.purchaseTransactionLedger[0]!,coinsAfter:999}]}])assert.throws(()=>validatePlayerProfileV2(bad,tuning));
});
test('purchase persisted in one coherent JSON write survives reload with receipt and unchanged equip',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(fundedProfile())});let writes=0;const repo=testRepository({...storage,setItem(k:string,v:string){writes++;storage.setItem(k,v);}} as ReturnType<typeof memoryProfileStorage>);
  const controller=createPlayerController(repo,'local-test',()=>2000),intent=intentFor(controller.snapshot().profile);writes=0;const result=await controller.purchase(intent);
  assert.equal(result.status,'SUCCESS');assert.equal(result.persistence,'saved');assert.equal(writes,1);
  const restored=testRepository(storage).load().profile;assert.equal(restored.wallet.coins,700);assert.equal(restored.equippedLoadout.bartenderId,'bartender.b01');assert.equal(restored.purchaseTransactionLedger.length,1);
  assert.equal((await createPlayerController(testRepository(storage),'reload',()=>3000).purchase(intent)).status,'ALREADY_PROCESSED');
});
test('write failure retains spend and grant together only in memory, reports it and can recover',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(fundedProfile())}),repo=testRepository(storage),controller=createPlayerController(repo,'quota',()=>2000),intent=intentFor(controller.snapshot().profile);
  storage.failWrite(true);const result=await controller.purchase(intent);assert.equal(result.status,'SUCCESS');assert.equal(result.persistence,'memory');assert.equal(controller.snapshot().profile.wallet.coins,700);
  assert.ok(controller.snapshot().profile.ownership.some(i=>i.contentId==='bartender.b02'));assert.equal(JSON.parse(storage.values.get(key)!).wallet.coins,1000);
  storage.failWrite(false);const duplicate=await controller.purchase(intent);assert.equal(duplicate.status,'ALREADY_PROCESSED');assert.equal(duplicate.persistence,'saved');assert.equal(testRepository(storage).load().profile.wallet.coins,700);
});
test('controller duplicate concurrent confirm calls reuse one identity and one debit',async()=>{
  const repo=fundedRepository(),coordinator=createProfileWriteCoordinator({listen:()=>()=>{},broadcast(){}}),c=createPlayerController(repo,'repeat',()=>2000,coordinator),intent=intentFor(c.snapshot().profile);
  const results=await Promise.all([c.purchase(intent),c.purchase(intent),c.purchase(intent)]);assert.deepEqual(results.map(r=>r.status),['SUCCESS','ALREADY_PROCESSED','ALREADY_PROCESSED']);assert.equal(c.snapshot().profile.wallet.coins,700);
});
test('mock Web Locks serialize different coordinators; pending purchase revalidates changed wallet',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(fundedProfile(300))}),locks=fakeWebLocks(),make=(id:string)=>createPlayerController(testRepository(storage),id,()=>2000,createProfileWriteCoordinator({requestLock:locks.request,listen:()=>()=>{},broadcast(){}}));
  const a=make('a'),b=make('b');const item=intentFor(a.snapshot().profile),effect=intentFor(b.snapshot().profile,'offer.ice-blue');
  const results=await Promise.all([a.purchase(item),b.purchase(effect)]);assert.equal(results[0]!.status,'SUCCESS');assert.equal(results[1]!.status,'PROFILE_CONFLICT');assert.equal(testRepository(storage).load().profile.wallet.coins,0);
  assert.equal(a.snapshot().coordinationMode,'WEB_LOCKS');
});
test('fresh profile conflict can never spend a known-stale quote and fallback advertises its limits',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(fundedProfile(300))}),a=createPlayerController(testRepository(storage),'a',()=>2000),intent=intentFor(a.snapshot().profile);
  const other=createPlayerController(testRepository(storage),'b',()=>2000);await other.purchase(intentFor(other.snapshot().profile,'offer.ice-blue'));
  const r=await a.purchase(intent);assert.equal(r.status,'PROFILE_CONFLICT');assert.equal(testRepository(storage).load().profile.wallet.coins,150);
  const fallback=createProfileWriteCoordinator({listen:()=>()=>{},broadcast(){}});assert.equal(fallback.mode,'FALLBACK');
});
test('broadcast/storage adapter refreshes other subscriber coins, ownership and loadout without reload',async()=>{
  const storage=memoryProfileStorage({[key]:JSON.stringify(fundedProfile())}),locks=fakeWebLocks(),listeners=new Set<()=>void>();
  const make=(id:string)=>createPlayerController(testRepository(storage),id,()=>2000,createProfileWriteCoordinator({requestLock:locks.request,listen(fn){listeners.add(fn);return()=>listeners.delete(fn);},broadcast(){for(const fn of listeners)fn();}}));
  const a=make('a'),b=make('b'),off=a.subscribe(()=>{}),offB=b.subscribe(()=>{});
  await a.purchase(intentFor(a.snapshot().profile));await a.equip('bartender.b02');await b.purchase({...intentFor(b.snapshot().profile,'offer.ice-blue'),profileId:'invalid'});
  assert.equal(b.snapshot().profile.equippedLoadout.bartenderId,'bartender.b02');assert.equal(b.snapshot().profile.wallet.coins,700);assert.ok(b.snapshot().profile.ownership.some(i=>i.contentId==='bartender.b02'));off();offB();assert.equal(listeners.size,0);
});
test('reverse completion across two tabs settles both rewards through same lock; shop never changes reward amounts',async()=>{
  const storage=memoryProfileStorage(),locks=fakeWebLocks(),make=(id:string)=>createPlayerController(testRepository(storage),id,()=>2000,createProfileWriteCoordinator({requestLock:locks.request,listen:()=>()=>{},broadcast(){}}));
  const a=make('a'),b=make('b');a.bindAttempt(0);b.bindAttempt(0);b.settle(success,0);a.settle(success,0);a.bindAttempt(10);
  await a.purchase({profileId:'invalid',ordinal:1,offerId:'offer.b02',quoteToken:'',transactionId:'invalid'});
  const p=testRepository(storage).load().profile;assert.equal(p.wallet.coins,86);assert.equal(p.stats.roundsPlayed,2);assert.equal(p.progression.lifetimeXp,230);assert.equal(p.rewardSettlementLedger.length,2);assert.equal(a.snapshot().reward,null,'late reward persists but does not appear on the next drink');
});
test('browser-style deferred bootstrap performs no main-profile write before coordinator work',()=>{
  const storage=memoryProfileStorage(),repo=createLocalPlayerProfileRepository(storage,newTestProfile,tuning,p=>reconcilePlayerProfile(p,2000),{deferInitialWrites:true});
  repo.load();assert.equal(storage.values.has(key),false);repo.flush();assert.equal(JSON.parse(storage.values.get(key)!).schemaVersion,3);
});
