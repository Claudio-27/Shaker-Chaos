import { createPurchaseIntent } from '../application/store.ts';
import { useState } from 'react';
import type { PlayerController, PlayerSnapshot } from '../application/playerController.ts';
import { earnCoins, immutable } from '../domain/playerProfile.ts';
import { productionStore } from '../content/storeCatalog.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { purchaseOffer } from '../application/store.ts';
import { storefront } from './shopPresentation.ts';
export default function ShopLab({controller,snapshot}:{readonly controller:PlayerController;readonly snapshot:PlayerSnapshot}){
  const [simulation,setSimulation]=useState(''),p=snapshot.profile,quotes=storefront(p);
  return <details className="asset-lab" data-shop-lab="SHOP_LAB_DEV_ONLY"><summary>Shop Lab · solo sviluppo</summary>
    <p>Monete {p.wallet.coins} · Revisione {p.revision} · Coordinamento {snapshot.coordinationMode} · Salvataggio {snapshot.status}</p>
    <button type="button" onClick={()=>controller.update(profile=>immutable({...profile,wallet:earnCoins(profile.wallet,500),updatedAt:Math.max(Date.now(),profile.updatedAt)}))}>Aggiungi 500 monete di test</button>
    <button type="button" onClick={()=>{const quote=quotes.find(q=>q.state==='AVAILABLE');if(!quote){setSimulation('Tutti i contenuti sono già posseduti');return;}
      const result=purchaseOffer({...p,wallet:{coins:0,lifetimeCoinsEarned:p.wallet.lifetimeCoinsEarned,lifetimeCoinsSpent:p.wallet.lifetimeCoinsEarned}},
        createPurchaseIntent(p,quote,'dev-simulation'),productionStore,publicContentCatalog,Math.max(Date.now(),p.updatedAt));setSimulation('Simulazione senza scritture: '+result.status);}}>Simula monete insufficienti</button>
    <p role="status">{simulation}</p><pre>{JSON.stringify({offers:quotes,ledger:p.purchaseTransactionLedger,diagnostics:snapshot.diagnostics},null,2)}</pre>
  </details>;
}
