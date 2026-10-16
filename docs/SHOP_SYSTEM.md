# Negozio locale — fase 2K

Il negozio vende cosmetici pubblici esistenti con monete fittizie guadagnate dai cocktail. Collezione/Negozio restano nel dialogo secondario; palco600×440, artwork e CSS sono bloccati. La2K corregge l'alternativa gratuita che nella2J anticipava qualsiasi acquisto normale.

## Livello, proprietà e prezzo

| Offerta | ID canonico | Acquistabile dal livello | Prezzo |
| --- | --- | --- | --- |
| Bartender02 | bartender.b02 | 3 | 300monete |
| Scia azzurra | effect.ice-blue | 2 | 150monete |
| Un nuovo turno | bundle.b02-ice-blue | 6 | 382monete completo |

**Raggiungere il livello rende acquistabile, senza concedere proprietà.** Nessuno dei due cosmetici è ora un grant gratuito. Lo starter conserva i cinque oggetti originali. Le formule di ricompensa, la curva XP e i prezzi2J sono conservati. Il bundle mantiene floor(costo residuo×85/100).

Fonti di configurazione:

- ContentItem.unlock/default e starterContentIds: starter gratuito.
- progressionTuning.unlocks: solo grant gratuiti intenzionali, con minimumLevel e requirementId. Attualmente vuoto; il servizio continua a supportare attraversamenti multipli e idempotenza.
- ContentItem.unlock/currency: currencyId coins e availableFromLevel opzionale; assenza significa livello1. PriceMetadata è l'unica fonte del prezzo.
- StoreOffer.availability: pubblicazione e minimo eventuale dell'offerta. Quote ITEM usa il massimo tra offerta e gate canonico; BUNDLE usa anche i gate di tutti gli elementi ancora non posseduti. Un bundle non può aggirarli.

Progression e currency possono coesistere solo se si vuole deliberatamente una vera alternativa gratuita: non sono sinonimi. Una nuova offerta senza gate non richiede nuovo codice; un grant gratuito richiede una regola intenzionale e metadati progression coerenti. I quattro bundle storici di esempio rimangono non venduti. Nessun prodotto segnaposto, tecnico o privato è vendibile.

validateStore verifica riferimenti e unicità, prezzi interi sicuri, livelli interi≥1, una sola regola coins per articolo e inclusioni pubbliche opzionali. L'audit npm run shop:audit include livello effettivo e round necessari sia per XP sia per saldo. La build valida il catalogo prima del service worker.

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

Esiti espliciti: SUCCESS, ALREADY_PROCESSED, ALREADY_OWNED, INSUFFICIENT_FUNDS, OFFER_UNAVAILABLE, PROFILE_CONFLICT, OFFER_CHANGED, INVALID_CONFIGURATION. INSUFFICIENT_FUNDS mostra esattamente le monete mancanti e mantiene il wallet non negativo. Le proprietà storiche ottenute prima dei nuovi requisiti restano valide ed equipaggiabili. I livelli non generano un secondo entitlement o un addebito retroattivo.

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

Collezione resta la superficie di equip. Per gli articoli non posseduti mostra “Acquistabile dal livello N · prezzo” oppure “Acquista nel Negozio · prezzo”; i veri premi gratuiti mostrano “Gratis al livello N”. Negozio gestisce acquisizione e mostra il requisito anche prima di avere fondi. Nessun testo “Sblocca” promette una concessione gratuita per gli acquisti. Tabs con aria-selected, frecce e focus visibile; categorie vuote omesse, ordine esplicito: disponibili/affordabili, non affordabili o bloccati, posseduti. Conferma è un dialogo nativo annidato con nome/descritto, focus iniziale, Escape isolato dal dialogo padre e ritorno al pulsante originario. Esito è un messaggio di stato focalizzabile. Le proprietà non sono comunicate solo dal colore. Pulsanti nuovi≥48px. Nessuna animazione di acquisto: reduced-motion non cambia la matematica. Nessun file audio o cue aggiunto.

A negozio chiuso non sono montate card/anteprime. Aprendolo, IntersectionObserver carica le immagini visibili o prossime al viewport; nessun catalogo riscaldato all'avvio. Metadati pubblici già nel JS permettono acquisto offline anche senza immagine: AssetImage usa il fallback opzionale già esistente. Restano7 file shell precache,64 path art ammessi a richiesta,zero art precached e limite32. Non vengono aggiunti asset o URL protetti.

Prove storiche2J: [rapporto](PHASE_2J_REPORT.md). Prove2K sulla nuova configurazione: [rapporto corrente](PHASE_2K_REPORT.md), inclusi gate, doppio clic, due schede e bundle parziale dopo stop reale del server/reload offline.

## Pacing e scelta

A score5000 si ricevono70XP/25monete. Scia acquistabile dal round2, con fondi al6; Bartender02 dal4, con fondi al12; bundle dal15, con fondi al16, senza spese precedenti. La scelta è acquistare prima il singolo desiderato oppure attendere e risparmiare. Chi desidera solo un cosmetico spende150 o300, meno del bundle completo. Dopo il livello6 il bundle residuo è intenzionalmente conveniente: non aggiungiamo malus o urgenza artificiale.

Esempio medio: Scia al6 + bundle residuo255 al17 =405monete; risparmiare per il bundle completo al16 =382; Bartender al12 + bundle residuo127 al18 =427. I due singoli costano450 e si completano al18. Il vantaggio del bundle non annulla il valore dell'equip anticipato.

## Simulatore e futuri contenuti

npm run economy:simulate produce quattro scenari deterministici (basso, medio, alto, misto) e cinque casi di reward. Opzioni: --rounds=60 e --strategy=save|effect-first|bartender-first|bundle, dopo il separatore npm --. Il report per round mostra livello, XP lifetime/corrente, monete del giro, saldo, offerte appena disponibili, acquisti possibili e acquisti effettuati. Una lista di desideri ordinata aspetta il prossimo articolo senza sostituirlo con acquisti diversi. L'API simulateEconomy accetta anche piani come Scia→bundle per analizzare la proprietà parziale.

Usa gli stessi servizi di reward, quote, grant e purchase del gioco, con timestamp/identità sintetici espliciti e profilo isolato. Non scrive storage, non equipaggia e non entra nella UI di produzione; il marker ECONOMY_SIMULATION_DEV_ONLY è respinto dall'audit del bundle. Le sequenze ripetute sono ipotesi di analisi, senza telemetria o stime in minuti.

| Contenuto futuro | Configurazione |
| --- | --- |
| Starter | starterContentIds + default |
| Premio gratuito | progressionTuning.unlocks + progression |
| Acquisto per livello | currency.availableFromLevel + PriceMetadata + ITEM |
| Acquisto senza gate | currency senza availableFromLevel + PriceMetadata + ITEM |
| Bundle | riferimenti canonici + BUNDLE/pricing/availability |

## Profili esistenti

Resta PlayerProfileV2, senza nuovi campi e senza V3. V1→V2 continua invariata. Reconcile conserva tutti gli entitlements: starter, vecchi grant gratuiti, acquisti e bundle; conserva wallet, XP, receipt, watermark e loadout valido. Nessun costo retroattivo e nessuna compensazione inventata. Un livello già raggiunto ma privo di entitlement effettivo non diventa una promessa di grant storico: si applica la disponibilità corrente. Le ricevute di acquisti pre-gate restano valide. Anche un cosmetico posseduto sotto il nuovo gate rimane equipaggiabile.
