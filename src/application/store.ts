import type { ContentCatalog, ContentItem } from '../content/contentModel.ts';
import type { PlayerProfile, EconomyPlayerProfile, PurchaseReceipt } from '../domain/playerProfile.ts';
import { addInteger, identifier, immutable, integer, spendCoins } from '../domain/playerProfile.ts';
import { PURCHASE_LEDGER_LIMIT, purchaseTransactionId, validPurchaseTransactionId } from '../domain/playerProfileV2.ts';
interface OfferBase { readonly id: string; readonly order: number; readonly availability: { readonly published: boolean; readonly minimumLevel?: number } }
export type StoreOffer = OfferBase & (
  { readonly kind: 'ITEM'; readonly contentItemId: string } |
  { readonly kind: 'BUNDLE'; readonly bundleId: string; readonly pricing: { readonly kind: 'remaining-items'; readonly payPercent: number } | { readonly kind: 'catalog-prorated' } }
);
export interface StoreCatalog { readonly offers: readonly StoreOffer[] }
export interface StoreQuote {
  readonly offerId: string; readonly name: string; readonly kind: StoreOffer['kind']; readonly category: string;
  readonly state: 'AVAILABLE' | 'OWNED' | 'LOCKED' | 'UNAVAILABLE'; readonly minimumLevel: number;
  readonly includedIds: readonly string[]; readonly remainingIds: readonly string[]; readonly alreadyOwnedIds: readonly string[];
  readonly priceCoins: number; readonly remainingSubtotal: number; readonly savings: number; readonly missingCoins: number; readonly token: string;
}
const cosmeticKinds = new Set(['bartender','environment','counter','effect','bottle-set','reaction-set']);
export function sellableContent(item: ContentItem): boolean {
  return item.visibility === 'public' && (cosmeticKinds.has(item.kind)||(item.kind==='ingredient'&&!!item.ingredientId&&item.id==='ingredient.'+item.ingredientId)) && !item.unlock.some(u=>u.kind==='default'||u.kind==='development'||u.kind==='private-entitlement') &&
    item.unlock.some(u=>u.kind==='currency'&&u.currencyId==='coins') && item.price?.currency === 'coins';
}
/** Availability grants no ownership. Omitted level means an ungated coin purchase. */
export function coinPurchaseMinimumLevel(item: ContentItem): number {
  const rules=item.unlock.filter(u=>u.kind==='currency'&&u.currencyId==='coins');
  if(rules.length>1)throw new RangeError('Duplicate coin purchase rule');
  const rule=rules[0], level=rule?.kind==='currency' ? rule.availableFromLevel??1 : 1;
  integer(level,1);return level;
}
function price(item: ContentItem): number { coinPurchaseMinimumLevel(item); if (!sellableContent(item)) throw new RangeError('Not optional public sellable cosmetic: '+item.id);integer(item.price!.amount);return item.price!.amount; }
export function validateStore(store: StoreCatalog, catalog: ContentCatalog): void {
  const ids = new Set<string>();
  if (new Set(catalog.items.map(i=>i.id)).size!==catalog.items.length || new Set(catalog.bundles.map(b=>b.id)).size!==catalog.bundles.length) throw new RangeError('Duplicate content definition');
  for (const offer of store.offers) {
    identifier(offer.id);integer(offer.order);if(ids.has(offer.id))throw new RangeError('Duplicate offer ID');ids.add(offer.id);
    if (typeof offer.availability.published!=='boolean')throw new RangeError('Invalid availability');
    if (offer.availability.minimumLevel!==undefined)integer(offer.availability.minimumLevel,1);
    if (offer.kind==='ITEM') { const item=catalog.items.find(i=>i.id===offer.contentItemId);if(!item)throw new RangeError('Unknown content');price(item); }
    else if(offer.kind==='BUNDLE') {
      const bundle=catalog.bundles.find(b=>b.id===offer.bundleId);
      if(!bundle||bundle.visibility!=='public'||!bundle.includedContentIds.length||new Set(bundle.includedContentIds).size!==bundle.includedContentIds.length)throw new RangeError('Invalid bundle');
      for(const id of bundle.includedContentIds){const item=catalog.items.find(i=>i.id===id);if(!item)throw new RangeError('Unknown bundle content');price(item);}
      if(offer.pricing.kind==='remaining-items'){integer(offer.pricing.payPercent);if(offer.pricing.payPercent>100||bundle.price)throw new RangeError('Invalid discount or ignored catalog price');}
      else if(offer.pricing.kind==='catalog-prorated'){if(bundle.price?.currency!=='coins')throw new RangeError('Missing explicit bundle price');integer(bundle.price.amount);}
      else throw new RangeError('Unknown bundle pricing');
    } else throw new RangeError('Unknown offer kind');
  }
}
const safeNumber=(n:bigint)=>{const result=Number(n);integer(result);return result;};
export function quoteStoreOffer(profile: PlayerProfile, store: StoreCatalog, catalog: ContentCatalog, offerId: string): StoreQuote | undefined {
  const offer=store.offers.find(o=>o.id===offerId);if(!offer)return;
  const bundle=offer.kind==='BUNDLE'?catalog.bundles.find(b=>b.id===offer.bundleId)!:undefined;
  const item=offer.kind==='ITEM'?catalog.items.find(i=>i.id===offer.contentItemId)!:undefined;
  const includedIds=bundle?.includedContentIds??[item!.id], owned=new Set(profile.ownership.map(i=>i.contentId));
  const remainingIds=includedIds.filter(id=>!owned.has(id)), alreadyOwnedIds=includedIds.filter(id=>owned.has(id));
  const subtotal=(ids:readonly string[])=>safeNumber(ids.reduce((sum,id)=>sum+BigInt(price(catalog.items.find(i=>i.id===id)!)),0n));
  // A bundle cannot bypass purchase gates of its unowned members. Owned entitlements stay valid.
  const remainingSubtotal=subtotal(remainingIds), minimumLevel=Math.max(offer.availability.minimumLevel??1,
    ...remainingIds.map(id=>coinPurchaseMinimumLevel(catalog.items.find(i=>i.id===id)!)));
  let priceCoins=remainingSubtotal;
  if(offer.kind==='BUNDLE')priceCoins=offer.pricing.kind==='remaining-items'?safeNumber(BigInt(remainingSubtotal)*BigInt(offer.pricing.payPercent)/100n):
    remainingSubtotal===0?0:safeNumber(BigInt(bundle!.price!.amount)*BigInt(remainingSubtotal)/BigInt(subtotal(includedIds)));
  const state=(!offer.availability.published||includedIds.some(id=>catalog.items.find(i=>i.id===id)!.publication==='unpublished'))?'UNAVAILABLE':!remainingIds.length?'OWNED':profile.progression.level<minimumLevel?'LOCKED':'AVAILABLE';
  const token=JSON.stringify([offer.id,includedIds,remainingIds,priceCoins,state]);
  return immutable({offerId,name:bundle?.displayName??item!.displayName,kind:offer.kind,category:item?.kind??'bundle',state,minimumLevel,includedIds,remainingIds,alreadyOwnedIds,
    priceCoins,remainingSubtotal,savings:Math.max(0,remainingSubtotal-priceCoins),missingCoins:Math.max(0,priceCoins-profile.wallet.coins),token});
}
export interface PurchaseIntent { readonly transactionId: string; readonly profileId: string; readonly ordinal: number; readonly offerId: string; readonly quoteToken: string }
export function createPurchaseIntent(profile:EconomyPlayerProfile,quote:StoreQuote,nonce:string):PurchaseIntent {
  identifier(nonce);
  return immutable({profileId:profile.profileId,ordinal:profile.nextPurchaseOrdinal,offerId:quote.offerId,quoteToken:quote.token,transactionId:purchaseTransactionId(profile.profileId,profile.nextPurchaseOrdinal)+':'+nonce});
}
export type PurchaseStatus = 'SUCCESS' | 'ALREADY_PROCESSED' | 'ALREADY_OWNED' | 'INSUFFICIENT_FUNDS' | 'OFFER_UNAVAILABLE' | 'PROFILE_CONFLICT' | 'OFFER_CHANGED' | 'INVALID_CONFIGURATION';
export interface PurchaseResult<P extends EconomyPlayerProfile=EconomyPlayerProfile> { readonly status: PurchaseStatus; readonly profile: P; readonly receipt?: PurchaseReceipt; readonly quote?: StoreQuote }
/** Pure immutable spend + entitlement + receipt transition. No browser, score or XP operations. */
export function purchaseOffer<P extends EconomyPlayerProfile>(profile: P, intent: PurchaseIntent, store: StoreCatalog, catalog: ContentCatalog, timestamp: number): PurchaseResult<P> {
  const result=(status:PurchaseStatus,extra:Partial<PurchaseResult<P>>={}):PurchaseResult<P>=>immutable({status,profile,...extra});
  try {
    validateStore(store,catalog);integer(intent.ordinal,1);integer(timestamp,profile.updatedAt);
    if(intent.profileId!==profile.profileId)return result('PROFILE_CONFLICT');
    if(!validPurchaseTransactionId(intent.transactionId,profile.profileId,intent.ordinal))return result('INVALID_CONFIGURATION');
    if(intent.ordinal<profile.nextPurchaseOrdinal){const receipt=profile.purchaseTransactionLedger.find(r=>r.ordinal===intent.ordinal);
      if(receipt&&(receipt.offerId!==intent.offerId||receipt.transactionId!==intent.transactionId))return result('PROFILE_CONFLICT');
      return result('ALREADY_PROCESSED',receipt?{receipt}:{});
    }
    if(intent.ordinal!==profile.nextPurchaseOrdinal)return result('PROFILE_CONFLICT');
    const quote=quoteStoreOffer(profile,store,catalog,intent.offerId);if(!quote)return result('OFFER_UNAVAILABLE');
    if(quote.state==='OWNED')return result('ALREADY_OWNED',{quote});
    if(quote.state!=='AVAILABLE')return result('OFFER_UNAVAILABLE',{quote});
    if(quote.token!==intent.quoteToken)return result('OFFER_CHANGED',{quote});
    if(quote.priceCoins>profile.wallet.coins)return result('INSUFFICIENT_FUNDS',{quote});
    const wallet=spendCoins(profile.wallet,quote.priceCoins);
    const receipt:PurchaseReceipt={transactionId:intent.transactionId,ordinal:intent.ordinal,offerId:intent.offerId,profileId:profile.profileId,
      coinsBefore:profile.wallet.coins,coinsSpent:quote.priceCoins,coinsAfter:wallet.coins,newlyGrantedContentIds:quote.remainingIds,alreadyOwnedIncludedIds:quote.alreadyOwnedIds,timestamp};
    const next=immutable({...profile,wallet,updatedAt:timestamp,nextPurchaseOrdinal:addInteger(profile.nextPurchaseOrdinal,1),
      ownership:[...profile.ownership,...quote.remainingIds.map(contentId=>({contentId,source:quote.kind==='BUNDLE'?'bundle-granted' as const:'currency-purchased' as const,grantedAt:timestamp}))],
      purchaseTransactionLedger:[...profile.purchaseTransactionLedger,receipt].slice(-PURCHASE_LEDGER_LIMIT)});
    return result('SUCCESS',{profile:next,receipt,quote});
  } catch { return result('INVALID_CONFIGURATION'); }
}
