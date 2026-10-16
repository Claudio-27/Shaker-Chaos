# Negozio locale — fase 2J

Il negozio usa solo monete fittizie guadagnate dai cocktail e cosmetici pubblici già esistenti. Non introduce pagamenti reali, backend, account o consegna privata. Si apre dalla scheda **Negozio** del dialogo Collezione. Il palco600×440 e tutti i suoi artwork/layout restano bloccati.

## Catalogo e prezzi

StoreOffer è un modello dichiarativo ITEM/BUNDLE; availability separa pubblicazione e un eventuale livello minimo del negozio. I prezzi singoli hanno un'unica fonte: PriceMetadata nel catalogo canonico, currency=coins e amount intero sicuro≥0. La UI visualizza quote, non calcola prezzi o transazioni. I quattro bundle storici di esempio rimangono definizioni non vendute. L'unico nuovo bundle raggruppa due ContentItem esistenti, senza duplicare ID o immagini.

| Offerta | Contenuto canonico | Prezzo | Alternativa |
| --- | --- | --- | --- |
| offer.b02 | bartender.b02 — Bartender 02 | 300 | Progressione al livello2 |
| offer.ice-blue | effect.ice-blue — Scia azzurra | 150 | Progressione al livello3 |
| offer.new-shift | bundle.b02-ice-blue — Un nuovo turno | Dinamico, massimo382 | Concessione dei due ID canonici |

Bartender02 ed effetto sono **progressione OR acquisto**, senza requisiti di livello per comprare. Lo starter conserva tutti e cinque gli entitlements precedenti. Nessun segnaposto DEV, asset tecnico, ingrediente, meccanica obbligatoria o contenuto privato è vendibile.

validateStore respinge prezzi negativi/frazionari/unsafe, ID mancanti/duplicati, bundle vuoti o con contenuti duplicati/inesistenti/privati, asset tecnici, starter e segnaposto marcati development. Un'offerta richiede cosmetico pubblico opzionale, unlock currency coins e PriceMetadata valido. Audit esplicito con npm run shop:audit, eseguito anche dalla build prima della generazione SW. La configurazione corrente ha3 offerte su2 cosmetici e1 bundle.

## Bundle e proprietà parziale

La regola corrente è floor(somma prezzi singoli NON posseduti ×85/100), calcolata con BigInt e risultato limitato agli interi sicuri. Il risparmio è riferito soltanto a quel subtotale. Nessun costo o grant duplicato per gli elementi già posseduti. Contenuti tutti posseduti ⇒ OWNED, acquisto disabilitato e nessun prezzo significativo.

| Proprietà precedente | Da acquisire | Subtotale | Prezzo bundle | Risparmio |
| --- | --- | --- | --- | --- |
| Nessuna | B02 + Scia azzurra | 450 | 382 | 68 |
| B02 | Scia azzurra | 150 | 127 | 23 |
| Scia azzurra | B02 | 300 | 255 | 45 |
| Entrambi | Nulla | 0 | Non acquistabile | 0 |

Se un futuro BundleDefinition ha un prezzo coins esplicito, la regola catalog-prorated lo mantiene e proporziona al costo singolo residuo con divisione intera. La validazione impedisce di ignorarlo applicando lo sconto implicito. Esempio di test: prezzo esplicito360 su totale450, B02 già posseduto ⇒120 per l'effetto residuo. Non è un'ulteriore offerta di produzione.

## Transazione e conferma

1. La superficie risolve StoreQuote con prezzo finale, stato AVAILABLE/OWNED/LOCKED/UNAVAILABLE, contenuti inclusi/residui/posseduti e monete mancanti. Un token descrive esattamente l'offerta confermata.
2. Aprire conferma genera PurchaseIntent prima dell'esecuzione: profilo, ordinal corrente, offerta, token e transactionId con namespace purchase/ordinal/nonce. Ogni nuova apertura deliberata riceve un nonce diverso; i retry pendenti conservano l'intenzione catturata.
3. Conferma mostra nome, prezzo, inclusioni già possedute/nuove e risparmio. Il ref inFlight blocca subito doppio tap/Enter, oltre al disabled React. Annulla/Escape non spendono nulla.
4. Il controller entra nel coordinatore, rilegge il save valido e rivalida identità, ordinal, offerta corrente, token, proprietà e saldo. Una variazione di prezzo/contenuto non viene addebitata silenziosamente: OFFER_CHANGED richiede nuova conferma.
5. purchaseOffer è una transizione pura nel livello application. Produce un solo oggetto immutabile con wallet, ownership e ricevuta. Non legge o modifica XP, stats, gameplay, evento cocktail o score.
6. Il repository salva UN JSON coerente. SUCCESS è accompagnato da persistence: saved oppure memory/unsupported. La UI distingue “Acquistato!” da “Solo per questa sessione: non riusciamo a salvare i progressi”. Un conflitto non installa uno spend fittizio nel profilo corrente.
7. La UI aggiorna stato e saldo. Nessun auto-equip: Equipaggia richiama lo stesso equipContent/controller della Collezione e cambia un solo slot.

Esiti espliciti: SUCCESS, ALREADY_PROCESSED, ALREADY_OWNED, INSUFFICIENT_FUNDS, OFFER_UNAVAILABLE, PROFILE_CONFLICT, OFFER_CHANGED, INVALID_CONFIGURATION. INSUFFICIENT_FUNDS mostra esattamente le monete mancanti e mantiene il wallet non negativo. Un contenuto comprato prima del livello non riceve un doppio entitlement o una nuova card di sblocco quando la progressione lo raggiunge.

## Profilo V2 e registro

V1 possedeva già lifetimeCoinsSpent, ma non un registro acquisti. Il formato distribuito diventa PlayerProfileV2/schemaVersion2 con tre aggiunte: revision, nextPurchaseOrdinal, purchaseTransactionLedger. V1→V2 è una migrazione esplicita: tutti i campi originari, ID, timestamp, XP, wallet, ownership, loadout, stats, ordinal e reward ledger sono preservati. Le aggiunte partono da0/1/array vuoto. Il validatore V1 storico resta disponibile; V2 ha un validatore esplicito. Versioni future>2 sono conservate senza sovrascrittura. La copia recovery esatta del save corrotto rimane la policy precedente.

Ledger acquisti: **ultime64 ricevute**, separato dai128 reward settlement. Una ricevuta contiene transactionId, ordinal, offerId, profileId, coinsBefore/coinsSpent/coinsAfter, newlyGrantedContentIds, alreadyOwnedIncludedIds e timestamp. nextPurchaseOrdinal è il watermark permanente: un ordinal già consumato non può spendere nuovamente anche dopo l'evizione. Un ID non può essere riutilizzato con ordinal nuovo perché il namespace deve corrispondere; collisione con altra azione ancora nel registro ⇒ conflitto. I retry identici restituiscono ricevuta/no-op. Nessuna schermata cronologia, rimborso o rivendita.

Invarianti: coins≥0, lifetimeCoinsSpent≥0, coins+spent=earned; una spesa incrementa soltanto spent e decrementa coins, mai earned. Timestamp e contatori sono interi sicuri; overflow viene rifiutato prima di persistere. Prezzo zero è valido e testato, benché non esista un'offerta gratuita corrente.

## Coordinamento fra schede

ProfileWriteCoordinator è un confine applicativo con adapter browser. Tutte le scritture di produzione — bootstrap/migrazione, acquisto, equip, progressione — passano per una coda locale e, se disponibile, Web Locks con nome shaker-chaos.player-profile.write. Bootstrap differisce le scritture del profilo principale finché possiede il lock. Anche il controllo raw/revision del repository rimane attivo, con verifica prima e dopo setItem. La revisione cresce per le transizioni salvate/in memoria; migrazione iniziale aggiunge revision0.

Lo scorer continua a produrre il RoundResult sincrono. Solo il salvataggio dei progressi attende il lock. Per evitare che un round più lento perda il premio dopo il completamento di un'altra scheda, il controller ora emette l'ordinal reward e liquida insieme nello stesso commit coordinato. Le formule e i128 record/watermark del servizio puro non cambiano. Un premio completato in coda resta associato al tentativo originario e non viene mostrato sul Nuovo drink.

BroadcastChannel shaker-chaos.profile-changes e storage events della sola chiave del profilo aggiornano saldo, ownership e loadout nelle altre schede. I listener/channels si aprono con la sottoscrizione e si chiudono all'ultimo unsubscribe, anche con StrictMode. La modalità SYNCHRONOUS_TEST esiste solo per le fixture applicative isolate; l'entrypoint browser passa sempre l'adapter reale.

**FALLBACK senza Web Locks non garantisce atomicità completa fra processi simultanei.** Conserva coda per client, rilettura e confronto raw/revision; un cambiamento rilevato restituisce PROFILE_CONFLICT e richiede riapertura/conferma. Non si spende da un profilo noto obsoleto. Non è anti-cheat: un utente controlla lo storage locale e writer esterni al coordinatore possono aggirarne le garanzie. Nessun lease localStorage viene presentato come transazione atomica.

## UI, accessibilità e offline

Collezione resta la superficie di equip, con le sue anteprime di unlock precedenti; Negozio gestisce esclusivamente acquisizione. Tabs con aria-selected, frecce e focus visibile; categorie vuote omesse, ordine esplicito: disponibili/affordabili, non affordabili o bloccati, posseduti. Conferma è un dialogo nativo annidato con nome/descritto, focus iniziale, Escape isolato dal dialogo padre e ritorno al pulsante originario. Esito è un messaggio di stato focalizzabile. Le proprietà non sono comunicate solo dal colore. Pulsanti nuovi≥48px. Nessuna animazione di acquisto: reduced-motion non cambia la matematica. Nessun file audio o cue aggiunto.

A negozio chiuso non sono montate card/anteprime. Aprendolo, IntersectionObserver carica le immagini visibili o prossime al viewport; nessun catalogo riscaldato all'avvio. Metadati pubblici già nel JS permettono acquisto offline anche senza immagine: AssetImage usa il fallback opzionale già esistente. Restano7 file shell precache,64 path art ammessi a richiesta,zero art precached e limite32. Non vengono aggiunti asset o URL protetti.

Prova reale su origine isolata127.0.0.1:5185: profilo DEV500monete, acquisto B02=300/equip; produzione round9550 ⇒243monete. Stop preview, reload offline, bundle residuo127 ⇒116, grant solo Scia azzurra, equip esplicito/reload e round offline9550 ⇒159monete. Anche i progressi restano115→230XP, senza duplicazioni da reload. Su5187 il bundle totalmente non posseduto382 lascia118 e due grant. Vedere [rapporto](PHASE_2J_REPORT.md) e [prove UI](phase2j-smoke/manifest.json).

## Pacing attuale

| Prezzo | Score1500:11monete/round | Score5000:25 | Score9550:43 |
| --- | --- | --- | --- |
| B02=300 | 28 round | 12 | 7 |
| Scia=150 | 14 | 6 | 4 |
| Bundle=382 | 35 | 16 | 9 |

Si tratta di arrotondamento per eccesso da saldo zero, senza spese precedenti. Gli unlock gratuiti dei livelli2/3 arrivano prima dei saldi necessari nel normale percorso: il primo negozio ha quindi un'utilità commerciale limitata con questi soli due contenuti. I prezzi rispettano la guida300–600/100–250 senza modificare le ricompense approvate. Per una vetrina più ricca servono nuovi cosmetici reali con politica di acquisizione deliberata; nessun prodotto fittizio è stato aggiunto. Questa è una raccomandazione futura, non lavoro avviato.
