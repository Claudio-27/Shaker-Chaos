# Ricette, obiettivi e mastery — Phase 2O

Sette ricette pubblicate, ownership/gate reali. Tuning corrente: [V1_BALANCE](V1_BALANCE.md). Verde e Petali 18/36; Brace 15/36; le quattro legacy 12/30. Goal storico goal.three-recipes ora cinque ricette distinte, vecchi claim mantenuti e premi invariati. Le sezioni sotto descrivono il catalogo iniziale e il contratto di valutazione; le tabelle di tuning v1 hanno precedenza sui valori storici.


Il punteggio del drink e il risultato della ricetta rispondono a domande diverse. Lo scorer classico continua a produrre RoundResult 0–10000, con le stesse regole e soglie. La ricetta interpreta la proiezione della storia canonica: ingredienti, ghiaccio, agrume, numero di agitazioni completate e durata cumulativa. Nessuna informazione di profilo, ricetta, monete o mastery entra nello scorer.

## Catalogo iniziale

Fonte unica: src/content/recipeCatalog.ts. Le quantità sono VolumeUnit intere; nella UI si usa la scala del mix, senza conversione fisica. Capacità 240, startup/tick del pour e ingredienti invariati. Ingredienti non elencati hanno target zero.

| ID | Nome | Livello | Frutteto / Agrumi / Bollicine | Requisiti aggiuntivi |
| --- | --- | --- | --- | --- |
| recipe.first-ray | Primo raggio | 1 | 120 / 0 / 0 | Nessuno oltre al normale agita/servi |
| recipe.counter-harmony | Intesa del banco | 2 | 120 / 60 / 60 | 1–2 agitazioni completate; 200–2000 ms cumulativi |
| recipe.lantern-breeze | Fresco di lanterna | 3 | 60 / 60 / 120 | Esattamente 2 aggiunte di ghiaccio |
| recipe.last-flash | Ultimo lampo | 4 | 90 / 120 / 30 | Ruota di agrume; esattamente 2 agitazioni completate; 500–2000 ms cumulativi |

availableFromLevel apre un obiettivo gratuito, senza concedere o vendere un cosmetico. Le ricette non sono StoreOffer/ContentItem acquistabili. Le quattro descrizioni sono originali. garden-demo nel catalogo storico resta la definizione della vecchia demo, fuori dal ricettario di produzione2L.

## Valutazione deterministica

Dominio puro: src/domain/recipes.ts. evaluateRecipe consuma ClassicSessionView, ricostruibile con replayClassicHistory dalla storia accettata. Non cambia o aggiunge eventi. Un risultato finale viene valutato soltanto sul tentativo congelato; l'anteprima durante il giro usa gli stessi criteri senza assegnare premi.

Scarto totale D = somma, su tutti gli ingredienti presenti o richiesti, di abs(quantità effettiva − target). Gli ingredienti inattesi contano integralmente. Le quattro ricette iniziali usano:

| Condizione | Esito |
| --- | --- |
| Fallimento meccanico oppure D > 30 | Non riuscita (FAILED) |
| D ≤ 30 ma manca un requisito aggiuntivo | Vicina (CLOSE) |
| D = 0 e tutti i requisiti rispettati | Perfetta (PERFECT) |
| 0 < D ≤ 12 e requisiti rispettati | Riuscita (SUCCESS) |
| 12 < D ≤ 30 e requisiti rispettati | Vicina (CLOSE) |

Confini inclusivi. Un requisito mancante non viene compensato da quantità esatte. Una ricetta vicina non conta come completamento. La precisione visualizzata riguarda **gli ingredienti**, non l'esito complessivo: max(0, 10000 − floor(D×10000/somma target)) basis point, con BigInt/interi e clamp prima della conversione. Una ricetta senza ghiaccio richiesto può quindi mostrare ingredienti100% ma essere soltanto Vicina. La UI indica il requisito mancante.

La perfezione richiede quantità esatte: tutti i target correnti sono multipli del tick produttivo da3 e sono raggiungibili. Il catalogo valida ID, ingredienti/garnish esistenti, capacità, quantità/tolleranze/bonus interi sicuri, livelli raggiungibili, requisiti inferiori alle soglie di fallimento e obiettivi non impossibili.

## Selezione e risultato

Collezione → Ricette apre il selettore nel dialogo esistente. Il trigger Collezione, il palco e le sue coordinate rimangono identici. Ricette bloccate mostrano il livello. Gioco libero rimuove il target prima del primo fatto di gameplay.

La scelta è locale alla scheda, mantenuta tra Reset/Nuovo drink, catturata al primo evento accettato e bloccata per tutto il tentativo. Non si può scegliere dopo aver visto il risultato o tra due pour. Reset apre un nuovo tentativo e rimuove il feedback precedente. Reload ricomincia una partita libera, conservando mastery e premi; la selezione e la sessione cocktail non sono nuovi dati persistenti.

A ricetta selezionata, nome/target/requisiti e precisione provvisoria vivono nel pannello di istruzioni esistente; Dettagli ricetta apre direttamente il ricettario. A Serve, il normale reveal resta immutato e il breakdown aggiunge l'esito ricetta, record e bonus espliciti. Il pannello resta nella posizione originale con il suo scroll interno; su quello spazio compatto alcune informazioni richiedono scorrimento. Nessuna checklist sul palco, nuovo HUD o spostamento di bottiglie/host/shaker/controlli.

## Mastery e premi

Per ogni recipeId: completed, perfect, bestStatus, bestPrecisionBps. Il miglior risultato usa prima il rango dell'esito e poi la precisione ingredienti; i tentativi peggiori non lo abbassano. Tutte le ricette assegnano:

- Prima Riuscita o Perfetta: +15 XP e +5 monete.
- Prima Perfetta: altri +10 XP e +5 monete.
- Tentativi successivi: solo il normale premio del drink, salvo un obiettivo distinto appena completato.

Una prima Perfetta assegna entrambi i bonus ricetta nella stessa transizione. I bonus non alterano il ProgressionReward base o la sua formula; vengono mostrati separatamente e usano gainXp/earnCoins. Eventuali livelli aggiuntivi si riflettono nel profilo/HUD.

| ID obiettivo | Nome | Condizione | Premio una tantum |
| --- | --- | --- | --- |
| goal.first-recipe | Il primo segno | 1 ricetta completata | 5 XP / 3 monete |
| goal.three-recipes | Tre firme sul banco | 3 ricette diverse completate | 10 XP / 5 monete |
| goal.first-perfect | Al punto giusto | 1 ricetta perfetta | 5 XP / 3 monete |
| goal.high-recipe | Firma applaudita | Ricetta Riuscita/Perfetta e score drink ≥8500 nello stesso giro | 10 XP / 4 monete |

Budget massimo dell'intero catalogo: **130 XP e 55 monete**, sommando ricette e obiettivi, non ripetibili.55 monete sono meno del primo cosmetico da150; prezzi, gate e sconti2K non cambiano. I bonus possono anticipare un acquisto, intenzionalmente, senza modificare la fonte normale di guadagno. Gli ID di ricetta/obiettivo sono chiavi persistenti: non riutilizzarli per resettare premi o per un obiettivo diverso.

## Profilo V3 e migrazione

V2 non aveva un contenitore estensibile tipizzato per questa struttura. Si introduce PlayerProfileV3, schemaVersion3, aggiungendo soltanto recipeProgress:

- mastery: array di record unici per recipeId;
- claimedGoalIds: ID unici dei premi obiettivo assegnati;
- lastSettledOrdinal: watermark ricette, distinto dal ledger base limitato a128.

Migrazione V2→V3: conserva tutti i campi, XP/livello, wallet, ownership/fonti, loadout, stats, revision, receipt/shop ledger, ordinal, ledger base e timestamp; aggiunge mastery/goal vuoti e watermark uguale al lastSettledOrdinal storico. Nessuna rivalutazione o premio retroattivo. V1 segue V1→V2→V3. I validatori storici restano disponibili. Versioni future>3 sono conservate senza sovrascrittura; corruzione mantiene backup/recovery e fallback precedenti. ID mastery/goal non più nel catalogo restano conservati come dati inattivi.

Il validatoreV3 verifica anche precisione intera0–10000, coerenza completata/perfetta/bestStatus, unicità e watermark non futuro. Il negozio è tipizzato genericamente per conservare i nuovi campi mentre continua a supportare fixture V2: nessuna nuova regola di acquisto.

## Transazione, idempotenza, offline e schede

Il controller cattura recipeId e identità del tentativo. Sotto il ProfileWriteCoordinator esistente rilegge il profilo, emette ordinal, liquida il premio base, valuta la storia finale e applica ricette/obiettivi, poi salva **un solo JSON** con tutto lo stato. Il livello prima del premio base decide l'idoneità della ricetta; guadagnare un livello con quel drink non permette di scegliere retroattivamente un target bloccato.

settleRecipeRound richiede un round base emesso/liquidato corrispondente. Il watermark avanza anche nel gioco libero; un vecchio round non può ricevere una ricetta dopo. Retry vecchi, anche dopo l'evizione del ledger base, sono no-op. completed/perfect e claimedGoalIds impediscono altri bonus nei round nuovi. Non si usano animazioni, timer di reveal o callback React per pagare.

Web Locks, coda locale, refresh raw/revision, storage events e BroadcastChannel restano gli stessi. Due schede possono ricevere entrambi i premi normali ma un solo primo bonus condiviso. Un feedback tardivo non appare sul nuovo giro. Un errore di salvataggio mantiene insieme premio base/bonus/mastery in memoria, con l'avviso già esistente. Restano i limiti del fallback senza Web Locks: conflitti noti rilevati, non atomicità garantita tra processi simultanei. Storage locale non è anti-cheat.

Tutte le definizioni sono nella shell, nessun servizio esterno. Il ricettario non carica nuovi artwork. Funziona offline dopo il caching della shell; l'aggiornamento della PWA segue la policy precedente.

## DEV e simulazione

/?recipeLab=1 apre il Lab solo in sviluppo: catalogo completo, scelta nel gioco, target/tolleranze, esempi canonici, score separato, mastery e goal state. Esempi: exact, within, outside, far, no-ice, no-garnish, wrong-shake. Applica esempio al profilo DEV passa dal controller/coordinatore e dichiara l'aggiunta di premio base/statistiche oltre ai bonus dovuti. Richiede il livello appropriato.

Il reset DEV richiede la checkbox esplicita e azzera soltanto recipeProgress, seminando il watermark al round corrente. Mantiene XP, saldo, proprietà, equip e ledger shop. I bonus già guadagnati non sono sottratti; dopo il reset è intenzionalmente possibile riprovare i premi in nuovi round DEV. Nessun reset ricette è esposto in produzione.

npm run recipes:simulate genera28 esempi deterministici, sette per ricetta. Usa il vero dispatcher/cronologia/scorer per i drink di prova e verifica un esito atteso indipendente. Quantità esatte, −12, −15 e −33 sul primo ingrediente illustrano Perfetta/Riuscita/Vicina/Non riuscita; requisiti mancanti producono Vicina solo per le ricette che li richiedono. Aggiungere una ricetta con target incompatibile con questi esempi richiederà aggiornare deliberatamente il tooling, non il dominio.

Marker DEV e script sono respinti dall'audit sugli output di produzione. Non sono importati dalla UI normale. La vecchia simulazione economy:simulate resta disponibile e non include bonus ricette: è il confronto del percorso base2K.
