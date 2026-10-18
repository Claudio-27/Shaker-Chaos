import { createPurchaseIntent } from '../application/store.ts';
import { newPurchaseNonce } from '../platform/purchaseIdentity.ts';
import { useEffect, useRef, useState } from 'react';
import type { PlayerController, PlayerSnapshot, PurchaseOutcome } from '../application/playerController.ts';
import type { PurchaseIntent, StoreQuote } from '../application/store.ts';
import type { VisualCatalog } from '../content/visualModel.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { canEquip } from '../application/playerContent.ts';
import { contentPortrait, collectionCard, equipmentFeedback } from './progressionPresentation.ts';
import { progressionAlternative, purchaseFeedback, shopCategories, storefront } from './shopPresentation.ts';
import { AssetImage } from './AssetVisual.tsx';
import './Shop.css';
/** On-demand artwork, never a startup preload or a condition for purchase eligibility. */
export function ShopPreview({contentId,visuals}:{readonly contentId:string;readonly visuals:VisualCatalog}){
  const ref=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false);
  const item=publicContentCatalog.items.find(i=>i.id===contentId),asset=item&&contentPortrait(item,visuals);
  useEffect(()=>{const target=ref.current;if(!target)return;
    if(typeof IntersectionObserver==='undefined'){setVisible(true);return;}
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{root:target.closest('dialog'),rootMargin:'60px'});
    observer.observe(target);return ()=>observer.disconnect();
  },[]);
  return <div ref={ref} className="shop-preview" aria-hidden="true">{visible&&asset?<AssetImage assetId={asset} optional priority="low"/>:<span>✦</span>}</div>;
}
export function PurchaseConfirmation({quote,onConfirm,onCancel}:{readonly quote:StoreQuote;readonly onConfirm:()=>Promise<PurchaseOutcome>;readonly onCancel:()=>void}){
  const [error,setError]=useState('');
  const ref=useRef<HTMLDialogElement>(null),title=useRef<HTMLHeadingElement>(null),inFlight=useRef(false),[busy,setBusy]=useState(false);
  useEffect(()=>{const target=ref.current,previous=document.activeElement instanceof HTMLElement?document.activeElement:null;target?.showModal();title.current?.focus();
    return ()=>{target?.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
  const confirm=()=>{if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');void onConfirm().catch(()=>setError('L’acquisto non è stato confermato. Controlla saldo e collezione prima di riprovare.')).finally(()=>{inFlight.current=false;setBusy(false);});};
  return <dialog ref={ref} className="shop-confirmation" aria-labelledby="purchase-title" aria-describedby="purchase-description" onCancel={e=>{e.preventDefault();e.stopPropagation();if(!inFlight.current)onCancel();}}>
    <h3 ref={title} tabIndex={-1} id="purchase-title">Acquistare {quote.name}?</h3>
    <p id="purchase-description">{quote.priceCoins} monete del gioco. Gli ingredienti acquistati sono subito sulla mensola; i cosmetici si equipaggiano dalla Collezione.</p>
    {quote.kind==='BUNDLE'&&<ul aria-label="Contenuti del bundle">{quote.includedIds.map(id=><li key={id}>{publicContentCatalog.items.find(i=>i.id===id)!.displayName} — {quote.alreadyOwnedIds.includes(id)?'già posseduto':'da ottenere'}</li>)}</ul>}
    {quote.savings>0&&<p>Risparmi {quote.savings} monete sui contenuti ancora da ottenere.</p>}
    {error&&<p role="alert">{error}</p>}
    <div className="shop-confirm-actions"><button type="button" disabled={busy} onClick={onCancel}>Annulla</button><button type="button" disabled={busy} onClick={confirm}>{busy?'Acquisto in corso…':'Conferma acquisto'}</button></div>
  </dialog>;
}
export function Storefront({snapshot,controller,visuals,onCollection}:{readonly snapshot:PlayerSnapshot;readonly controller:PlayerController;readonly visuals:VisualCatalog;readonly onCollection:()=>void}){
  const [category,setCategory]=useState('all'),[pending,setPending]=useState<{quote:StoreQuote;intent:PurchaseIntent}|null>(null),[message,setMessage]=useState('');
  const feedback=useRef<HTMLParagraphElement>(null),profile=snapshot.profile,quotes=storefront(profile);
  useEffect(()=>{if(message)feedback.current?.focus({preventScroll:true});},[message]);
  const previousEquip=useRef(profile.equippedLoadout);
  useEffect(()=>{const text=equipmentFeedback(previousEquip.current,profile.equippedLoadout);previousEquip.current=profile.equippedLoadout;if(text)setMessage(text);},[profile.equippedLoadout]);
  const categories=shopCategories.filter(c=>c.id==='all'||quotes.some(q=>q.category===c.id));
  const open=(quote:StoreQuote)=>{setMessage('');setPending({quote,intent:createPurchaseIntent(profile,quote,newPurchaseNonce())});};
  const confirm=async()=>{const outcome=await controller.purchase(pending!.intent);setPending(null);setMessage(purchaseFeedback(outcome));return outcome;};
  return <section className="shop-surface" aria-label="Offerte del bar">
    <div className="shop-wallet"><strong aria-label={'Saldo: '+profile.wallet.coins+' monete'}>{profile.wallet.coins} monete</strong><span>Un tocco nuovo per il tuo bar.</span></div>
    <p className="shop-intro">Solo monete del gioco, guadagnate preparando drink. Il negozio propone cosmetici e ingredienti. I livelli aprono nuove offerte: scegli come spendere le monete.</p>
    <div className="shop-filters" role="group" aria-label="Categorie negozio">{categories.map(c=><button key={c.id} type="button" aria-pressed={category===c.id} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</div>
    <p ref={feedback} className="shop-feedback" role="status" tabIndex={-1}>{message}</p>
    <div className="shop-grid">{quotes.filter(q=>category==='all'||q.category===category).map(quote=>{
      const item=quote.kind==='ITEM'?publicContentCatalog.items.find(i=>i.id===quote.includedIds[0]):undefined;
      const card=item?collectionCard(profile,item):undefined,alternative=item&&progressionAlternative(item.id);
      const purchasable=quote.state==='AVAILABLE'&&!quote.missingCoins;
      return <article className="shop-card" key={quote.offerId} aria-label={quote.name+', '+(quote.state==='OWNED'?'posseduto':quote.state==='LOCKED'?'acquistabile dal livello '+quote.minimumLevel:quote.state==='UNAVAILABLE'?'non disponibile':quote.missingCoins?'monete insufficienti':'disponibile')}>
        <ShopPreview contentId={quote.includedIds[0]!} visuals={visuals}/><small>{shopCategories.find(c=>c.id===quote.category)?.name??'Cosmetici'}</small><h4>{quote.name}</h4>
        {quote.kind==='BUNDLE'&&<ul aria-label={'Contenuti di '+quote.name}>{quote.includedIds.map(id=><li key={id}>{publicContentCatalog.items.find(i=>i.id===id)!.displayName}<span>{quote.alreadyOwnedIds.includes(id)?'Già posseduto':'Da ottenere'}</span></li>)}</ul>}
        {quote.state==='OWNED'?<><strong className="shop-owned">✓ Posseduto</strong>{item&&canEquip(profile,item)?<button type="button" disabled={card?.equipped} onClick={()=>controller.equip(item.id)}>{card?.equipped?'Equipaggiato':'Equipaggia '+item.displayName}</button>:item?.kind==='ingredient'?<span>Disponibile sulla mensola</span>:<button type="button" onClick={onCollection}>Apri Collezione</button>}</>:
          <><strong className="shop-price">{quote.priceCoins} monete</strong>{quote.savings>0&&<p className="shop-saving">Risparmi {quote.savings} monete</p>}{alternative&&<p>{alternative}</p>}
            {quote.minimumLevel>1&&<p>Acquistabile dal livello {quote.minimumLevel}</p>}{quote.state==='UNAVAILABLE'?<p>Non disponibile</p>:quote.state==='AVAILABLE'&&quote.missingCoins>0&&<p>Ti servono altre {quote.missingCoins} monete</p>}
            <button type="button" disabled={!purchasable} aria-label={'Acquista '+quote.name+' per '+quote.priceCoins+' monete'} onClick={()=>open(quote)}>Acquista</button></>}
      </article>;
    })}</div>
    {!quotes.length&&<p>Non ci sono offerte disponibili in questa categoria. Puoi continuare a preparare drink.</p>}
    {pending&&<PurchaseConfirmation quote={pending.quote} onConfirm={confirm} onCancel={()=>setPending(null)}/>}
  </section>;
}
