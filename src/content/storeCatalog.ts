import { barIngredients } from './ingredientCatalog.ts';
import type { StoreCatalog } from '../application/store.ts';
import { validateStore } from '../application/store.ts';
import { immutable } from '../domain/playerProfile.ts';
import { publicContentCatalog } from './publicContentCatalog.ts';
/** Prices live in canonical PriceMetadata, not in components or copied offer metadata. */
export const productionStore: StoreCatalog = immutable({ offers: [
  { id:'offer.b02',kind:'ITEM',contentItemId:'bartender.b02',order:10,availability:{published:true} },
  { id:'offer.ice-blue',kind:'ITEM',contentItemId:'effect.ice-blue',order:20,availability:{published:true} },
  { id:'offer.new-shift',kind:'BUNDLE',bundleId:'bundle.b02-ice-blue',pricing:{kind:'remaining-items',payPercent:85},order:30,availability:{published:true,minimumLevel:6} },
  ...barIngredients.filter(i=>i.acquisition.kind==='coins').map((i,n)=>({id:'offer.'+i.contentId,kind:'ITEM' as const,contentItemId:i.contentId,order:40+n,availability:{published:i.published}})),
] });
validateStore(productionStore,publicContentCatalog);
