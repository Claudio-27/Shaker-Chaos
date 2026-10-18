import { useEffect, useMemo, useState } from 'react';
import type { PlayerProfile } from '../domain/playerProfile.ts';
import { browserProfileStorage } from '../platform/localPlayerProfileRepository.ts';
import { dismissPlayerGuide, guidePreferenceKey, shouldOfferGuide } from '../platform/playerGuide.ts';
import type { PlayerPhase } from './gameplayPresentation.ts';
export function usePlayerGuide(profile:PlayerProfile){
  const storage=useMemo(browserProfileStorage,[]);
  const [active,setActive]=useState(()=>shouldOfferGuide(profile,storage));
  // Round updates must not dismiss the guide before the first reward can be explained.
  useEffect(()=>{setActive(shouldOfferGuide(profile,storage));},[profile.profileId,storage]);
  useEffect(()=>{const changed=(e:StorageEvent)=>{if(e.key===guidePreferenceKey&&e.newValue===profile.profileId)setActive(false);};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[profile.profileId]);
  return {active,dismiss(){dismissPlayerGuide(profile.profileId,storage);setActive(false);},reopen(){setActive(true);}};
}
export function FirstDrinkGuide({phase,hasLiquid}:{readonly phase:PlayerPhase;readonly hasLiquid:boolean}){
  const text=phase==='result'?'Gli XP fanno salire di livello; spendi le monete nel Negozio. Ricette e Aiuto sono in Collezione.':
    phase==='serve'?'Ora premi Servi. Se vuoi, aggiungi prima l’agrume: è il tocco finale.':
    phase==='shake'?'Rilascia Agita, poi premi Servi. Non esagerare: lo shaker scalpita!':
    hasLiquid?'Versa ancora o aggiungi ghiaccio. Quando sei pronto, tieni premuto Agita.':
    'Scegli una bottiglia. Tieni premuto Versa, poi Agita. Rilascia e premi Servi.';
  return <aside className="first-drink-guide" aria-label="Guida del primo drink"><h3 id="guide-title" tabIndex={-1}>Il tuo primo drink</h3><p>{text}</p>
    <span className="control-reason">Puoi rileggere tutto in Collezione → Aiuto.</span></aside>;
}
export function GuideDismiss({phase,onDismiss}:{readonly phase:PlayerPhase;readonly onDismiss:()=>void}){
  return <button type="button" className="skip-result guide-dismiss" onClick={onDismiss}>{phase==='result'?'Ho capito':'Salta guida'}</button>;
}
export function PlayerHelp({onGuide}:{readonly onGuide?:()=>void}){
  return <section className="player-help" aria-labelledby="help-title"><h3 id="help-title">Un giro al banco</h3>
    <ol><li><strong>Scegli una bottiglia.</strong> La spunta mostra quale userai. Le frecce cambiano mensola.</li>
      <li><strong>Tieni premuto Versa.</strong> Ogni versamento ha un breve avvio. Rilascia per fermarti; puoi cambiare bottiglia finché non agiti.</li>
      <li><strong>Tieni premuto Agita, poi rilascia.</strong> Serve prima un po’ di mix. Dopo non puoi più versare o aggiungere ghiaccio.</li>
      <li><strong>Premi Servi.</strong> Il bartender assaggia. Nuovo drink svuota solo il bicchiere: progressi e acquisti restano.</li></ol>
    <p><strong>Ghiaccio</strong> prima di Agita, fino a due aggiunte. <strong>Agrume</strong> dopo Agita, prima di Servi. Sono facoltativi nel gioco libero; una ricetta può richiederli.</p>
    <p>Mouse e touch: tieni premuto e rilascia. Tastiera: Tab per muoverti, Spazio o Invio per i comandi. Nei dialoghi: Esc per chiudere, frecce e Home/Fine per le schede.</p>
    <details><summary>Ricette, XP e monete</summary><p>Il punteggio valuta il drink. Gli XP fanno salire di livello; le monete servono nel Negozio. Il livello apre un acquisto, le monete ti danno la proprietà.</p>
      <p>Scegli una ricetta prima di iniziare: è un obiettivo gratuito. Occorrono il livello e gli ingredienti indicati. Un buon punteggio non garantisce una ricetta riuscita.</p>
      <p>Completata indica una ricetta riuscita almeno una volta. Perfetta richiede quantità esatte e tutti i requisiti. Il tuo miglior risultato resta nel ricettario: questa è la mastery. I bonus della prima riuscita, della prima perfetta e degli obiettivi si ricevono una sola volta.</p>
      <p>Posseduto significa che il contenuto è tuo. Equipaggiato indica il cosmetico in uso. Gli ingredienti acquistati sono subito disponibili sulla mensola. Un bundle sconta solo ciò che ti manca.</p></details>
    <details><summary>Salvataggio e gioco offline</summary><p>I progressi sono salvati in questo browser, senza account. Per ritrovarli usa lo stesso browser e lo stesso indirizzo del gioco.</p>
      <p>Se il salvataggio non riesce, un messaggio ti avvisa: evita di chiudere o ricaricare prima di aver riprovato. Un’altra scheda può aggiornare saldo e acquisti.</p>
      <p>Dopo il primo caricamento puoi giocare offline. Le immagini già visitate restano disponibili; quelle mai caricate possono mancare. Una figura assente non blocca i comandi. Per aggiornare una versione già aperta, chiudi le schede del gioco e riaprilo quando sei connesso.</p></details>
    {onGuide&&<button type="button" onClick={onGuide}>Rivedi la guida del primo drink</button>}
  </section>;
}
