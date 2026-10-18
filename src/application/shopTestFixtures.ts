/** Isolated test data only. Never imported by browser production code. */
import { migrateV1ToV2 } from '../domain/playerProfileV2.ts';
import { earnCoins, immutable, gainXp, levelThreshold } from '../domain/playerProfile.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { newTestProfile } from '../platform/profileTestFixtures.ts';
import { quoteStoreOffer,createPurchaseIntent } from '../application/store.ts';
import { productionStore } from '../content/storeCatalog.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import type { EconomyPlayerProfile } from '../domain/playerProfile.ts';
import type { StoreCatalog } from '../application/store.ts';
import type { ContentCatalog } from '../content/contentModel.ts';
/** Level 6 makes all production offers available; ownership stays starter-only. */
export function fundedProfile(coins=1000,level=6){const p=gainXp(migrateV1ToV2(newTestProfile(),progressionTuning),levelThreshold(level,progressionTuning),progressionTuning);return immutable({...p,wallet:earnCoins(p.wallet,coins)});}
export function intentFor(p:EconomyPlayerProfile,id='offer.b02',store:StoreCatalog=productionStore,catalog:ContentCatalog=publicContentCatalog){return createPurchaseIntent(p,quoteStoreOffer(p,store,catalog,id)!,'synthetic-intent');}
export function fakeWebLocks(){let tail:Promise<unknown>=Promise.resolve();return {request:<T>(_name:string,work:()=>T):Promise<T>=>{const next=tail.then(work);tail=next.catch(()=>{});return next;}};}
