import type { PlayerProfileV2 } from '../domain/playerProfile.ts';
import type { StoreCatalog, StoreQuote } from '../application/store.ts';
import { quoteStoreOffer, validateStore } from '../application/store.ts';
import type { ContentCatalog } from '../content/contentModel.ts';
import { productionStore } from '../content/storeCatalog.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import type { PurchaseOutcome } from '../application/playerController.ts';
export const shopCategories=[{id:'all',name:'Tutti'},{id:'bartender',name:'Bartender'},{id:'environment',name:'Ambienti'},{id:'counter',name:'Banchi'},{id:'effect',name:'Effetti'},{id:'bottle-set',name:'Bottiglie'},{id:'bundle',name:'Bundle'}];
export function storefront(profile:PlayerProfileV2,store:StoreCatalog=productionStore,catalog:ContentCatalog=publicContentCatalog):readonly StoreQuote[]{
  validateStore(store,catalog);
  const rank=(q:StoreQuote)=>q.state==='AVAILABLE'?(q.missingCoins?1:0):q.state==='LOCKED'?1:q.state==='OWNED'?2:3;
  return store.offers.map(o=>({quote:quoteStoreOffer(profile,store,catalog,o.id)!,order:o.order})).sort((a,b)=>rank(a.quote)-rank(b.quote)||a.order-b.order||(a.quote.offerId<b.quote.offerId?-1:a.quote.offerId>b.quote.offerId?1:0)).map(o=>o.quote);
}
export function progressionAlternative(id:string,catalog:ContentCatalog=publicContentCatalog):string|null{
  const item=catalog.items.find(i=>i.id===id),rule=progressionTuning.unlocks.find(r=>r.contentId===id);
  return item?.unlock.some(u=>u.kind==='progression')&&item.unlock.some(u=>u.kind==='currency'&&u.currencyId==='coins')&&rule?'Oppure sblocca al livello '+rule.minimumLevel:null;
}
export function purchaseFeedback(outcome:PurchaseOutcome):string{
  if(outcome.status==='SUCCESS')return 'Acquistato! '+outcome.receipt!.newlyGrantedContentIds.map(id=>publicContentCatalog.items.find(i=>i.id===id)?.displayName??'Contenuto').join(' · ')+(outcome.persistence==='saved'?'':' — Solo per questa sessione: non riusciamo a salvare i progressi.');
  if(outcome.status==='ALREADY_OWNED'||outcome.status==='ALREADY_PROCESSED')return 'È già nella tua collezione. Nessun altro addebito.';
  if(outcome.status==='INSUFFICIENT_FUNDS')return 'Ti servono altre '+outcome.quote!.missingCoins+' monete.';
  if(outcome.status==='OFFER_CHANGED')return 'L’offerta è cambiata. Controlla il nuovo prezzo e conferma di nuovo.';
  if(outcome.status==='PROFILE_CONFLICT')return 'I progressi sono cambiati in un’altra scheda. Controlla il saldo e riprova.';
  return 'Questo acquisto non è disponibile. Nessuna moneta spesa.';
}
