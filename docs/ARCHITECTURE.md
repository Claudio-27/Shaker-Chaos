# Architettura

Aggiornamento 2026-10-06: fase **0.3**, artwork forniti e catalogo modulare dopo il rafforzamento di dominio 0.1 e la composizione 0.2. Nessuna ricerca o implementazione di fase 1.

> **Preserve information until research proves it irrelevant.**

Il mix finale è una proiezione, non la fonte canonica. Ordine, quantità richieste, singoli tick e limiti delle operazioni devono restare disponibili finché non sappiamo quali informazioni contano per la compatibilità.

## Flusso attuale

```text
Pointer Events / tastiera → adapter UI: start, tick, end, tempo intero esplicito
                                     ↓
                              transitionGame
                                     ↓
                CocktailSession.history: readonly MixEvent[]
                          ↓ replay puro e sostituibile
                DerivedSession → MixState → UI attuale
                          ↓ createCompatibilityInput
           history completa + history del tentativo + proiezione demo
                          ↓ ScoringEngine.evaluate(CompatibilityInput)
                     ScoreResult → UI
                          ↓ solo in futuro
                progressione / premi / profilo
```

`CocktailSession` contiene schema v1, snapshot delle regole dimostrative e cronologia immutabile. Gli eventi hanno `sequence` contiguo e `atMs` relativo, intero e non decrescente. A parità di timestamp decide l'ordine della sequenza; il dominio non ordina automaticamente eventi, non legge clock, non usa casualità o browser API. Snapshot di sessione, eventi, regole e proiezioni isolano la storia da mutazioni successive del chiamante.

## Eventi e operazioni

Eventi attuali: `PourStarted`, `PourTick`, `PourEnded`, `ShakeStarted`, `ShakeTick`, `ShakeEnded`, `IceAdded`, `GarnishChanged`, `Served`, `Reset`. Gli ID delle operazioni collegano i tick e la fine al proprio inizio e sono unici nella sessione. Non vengono registrati coordinate, schede selezionate, hover, focus o stato del rendering.

Il replay conserva per ogni versamento ingrediente iniziale, inizio/fine, durata trascorsa, motivo della fine e tick con identità del singolo ingrediente e quantità **richiesta** e **aggiunta dalla proiezione**. Un tick oltre capacità, o che aggiunge zero, resta nella storia. Per ogni agitazione conserva tick, durata richiesta, durata applicata dalla demo, inizio/fine e durata trascorsa. Numero di agitazioni e durata cumulativa si ricavano senza confonderli con una sola durata finale.

Il tempo effettivamente trascorso è distinto dal credito temporaneo di un tick: un'attivazione breve può generare 100 ms di credito demo, ma la sua durata reale start/end resta un dato diverso. Il tempo relativo viene letto da `platform/sessionClock.ts` e quantizzato a ms interi prima dell'ingresso nel dominio. I tick conservano anche il proprio timestamp.

La proiezione rappresenta `mixing`, `pouring`, `shaking`, operazioni contemporanee e `served`. L'ordine e il timing di ghiaccio e guarnizione restano espliciti. La storia canonica non proibisce operazioni contemporanee o fatti dopo il servizio; la UI demo mantiene il precedente blocco dopo Servi. Quella policy locale non restringe i dati che un futuro engine può analizzare.

## Reset senza cancellazione delle evidenze

Il reset termina le operazioni attive con motivo `reset`, registra `Reset` e avvia un tentativo vuoto, senza score o tick residui. Mantiene il prefisso della cronologia per analizzare eventuali effetti del reset. Servi termina analogamente gli hold attivi e aggiunge `Served` prima di chiamare lo scorer.

`currentAttemptStart` e `currentAttemptHistory` delimitano il tentativo corrente. Quest'ultimo è una vista della cronologia: conserva sequence e timestamp globali, senza ribasarli. `replayMixEvents` riceve la storia completa, compresi i reset. Il nuovo `newSession` crea invece una sessione completamente nuova. Non c'è persistenza automatica: il reload della pagina perde la sessione in memoria, come prima; una futura acquisizione di ricerca dovrà conservare le tracce esplicitamente.

Il livello applicativo aggiorna la view solo mediante replay degli eventi. Tick e chiusure tardive di hold già terminati vengono ignorati dalla policy demo, così non contaminano il tentativo dopo un reset. Non sono nuove operazioni di dominio.

## Quantità canoniche e presentazione

`VolumeUnit` è un tipo nominale che accetta soltanto interi non negativi entro `Number.MAX_SAFE_INTEGER`. Somme non rappresentabili e valori frazionari/NaN/infiniti sono rifiutati, non arrotondati. `MixState.quantities`, capacità e tick sono espressi in queste unità canoniche.

**Una VolumeUnit non equivale a un millilitro.** Non conosciamo ancora unità native, capacità o granulosità del riferimento. I precedenti numeri della demo restano scelte temporanee: capacità 240 u, scatto 15 u; nessun fattore di conversione fisico è stato inventato. La UI mostra `u`; la composizione visiva della fase 0.2 è descritta in VISUAL_ARCHITECTURE.md.

`ui/volumePresentation.ts` può formattare una futura mappatura esplicita. La configurazione di produzione non contiene alcuna scala o conversione in ml. Le scale nei test sono esclusivamente sintetiche, per provare l'isolamento. Una mappatura futura cambierà soltanto la presentazione, mai i tick, le quantità canoniche o lo score. Nessun numero formattato viene letto nuovamente dal dominio.

## Scoring sostituibile

Contratto: `ScoringEngine.evaluate(CompatibilityInput) -> ScoreResult`. L'input contiene l'intera cronologia, la vista del tentativo e una proiezione identificata/versionata con regole e stato derivato. Un engine futuro può leggere la cronologia direttamente o costruire ulteriori input meccanici verificati; non è obbligato a usare i totali della proiezione demo.

L'adattatore corrente è **NOT YET COMPATIBILITY-VERIFIED**. Solo la sua formula demo sceglie di ignorare ordine e durate effettive. Questo non è un principio dell'interfaccia di scoring. L'adattatore ricalcola dal log autorevole, quindi una view derivata alterata non cambia il risultato.

Coefficienti di composizione come parti intere (2:1:1), rapporti e arrotondamento half-up sono calcolati con aritmetica razionale `BigInt`; nessuna divisione floating-point entra nello scoring. Il risultato demo resta un numero intero sicuro per mantenere la UI. Capacità, tempi, pesi e soglie restano non verificati; un'etichetta del dataset non può promuovere la formula inventata.

Per adottare la compatibilità futura: collegare ogni dato al registro; versionare schema/dataset/proiezione e fixture; implementare un adattatore puro che consumi history o un input derivato verificato; sostituirlo nel composition root. Una formula diversa non si ottiene promuovendo le costanti demo. Progressione e premi continuano a consumare il risultato senza influenzarlo.

## Assunzioni ancora aperte

- Unità canoniche di riferimento e mappatura fisica sconosciute; le quantità 240/15 sono solo della demo.
- Clock adapter a ms interi e setInterval del prototipo: non sono un modello dei frame o del timing originale. Eventuali quanta più fini, frame IDs o altre variabili richiederanno un'estensione documentata.
- Eventi attuali descrivono le operazioni note del prototipo, con inizio obbligatorio e ID unici; storia di ricerca incompleta, stato iniziale non vuoto o nuove meccaniche richiederanno uno schema/seed esplicito.
- Clamp della capacità, ghiaccio senza spostamento di volume, credito shake limitato e nessun credito a vuoto sono scelte della **proiezione demo**. Le richieste originali restano tutte disponibili per una diversa proiezione.
- Breakdown a quattro componenti e tier tipizzati sono ancora forma della demo, non struttura verificata delle reazioni del riferimento.
- La storia completa cresce in memoria e viene rigiocata a ogni azione. Nessun cap, campionamento o compattazione nascosta. Ottimizzazioni future dovranno mantenere le evidenze originali.
## Domini futuri e direzione delle dipendenze

Nessuna funzionalità seguente è implementata. `src/boundaries/README.md` conserva i confini senza introdurre servizi vuoti o schema persistente prematuro.

| Dominio futuro | Responsabilità | Confine previsto |
| --- | --- | --- |
| Progressione | XP, livelli e ricompense | Consuma un risultato già calcolato e identificato; non viene importata dallo scoring |
| Profilo giocatore | Stato persistente e preferenze | Adapter di storage dietro il livello applicativo; nessun accesso dal dominio di miscelazione |
| Economia | Saldo e operazioni sulla valuta | Politiche premio e registro di operazioni separati dal punteggio; idempotenza prima dei premi persistenti |
| Sblocco ingredienti | Stabilire quali ID sono disponibili | Filtra il catalogo pubblico prima delle azioni; non modifica quantità o coefficienti |
| Sblocco bartender | Selezione dei personaggi disponibili | Accesso al contenuto separato dalla presentazione e dallo scoring |
| Scoperta ricette | Confrontare risultati/mix e registrare scoperte | Osserva un cocktail servito; non riscrive il suo risultato |
| Vault | Contenuti e autorizzazione realmente privati | Catalogo separato ottenuto da endpoint server autorizzati; escluso da bundle e cache pubblici |

Flusso futuro: `risultato cocktail -> score compatibile -> policy premio -> profilo/economia/sblocchi`. Il calcolo compatibile non riceverà livello, XP, saldo, acquisti o unlock. Una modalità alternativa dovrà avere un ID e regole distinti. Nessuna dipendenza di runtime è stata aggiunta per questi domini.

## Area privata: confine di sicurezza

Il client è ispezionabile. Una password verificata in JavaScript, una route nascosta, un flag o la cifratura con chiave nel bundle non proteggono contenuti. Non spedire in anticipo asset o cataloghi privati e poi nasconderli nella UI.

Per una web app distribuita serviranno autenticazione, sessioni e autorizzazione **lato server**, con controlli su ogni richiesta e consegna protetta degli asset. Il backend dovrà definire revoca, scadenza, policy di cache e isolamento dal catalogo pubblico. Le risposte protette non devono passare nella precache pubblica; anche storage locale e disponibilità offline andranno valutati espressamente. Non è implementata alcuna autenticazione in fase 0.

## PWA minima

La build genera una precache minima di 7 file della shell, senza artwork. Il registro pubblico validato genera una allowlist esatta di 42 immagini ammesse solo per runtime cache; non equivale a un download anticipato. La build fallisce per riferimenti mancanti, contenuti dichiarati privati o file pubblici non classificati.

planSceneAssets e CACHE_SCENE riscaldano soltanto la scena attiva, includendo il bicchiere necessario per Servi offline. Il worker risponde con un ACK dopo il caricamento riuscito prima che la UI dichiari disponibilità offline. Reazioni/effetti arrivano su richiesta; quando non disponibili il renderer usa idle/nessun effetto mantenendo score e testo.

Cache artwork separata, massimo 32 elementi, conservazione delle immagini fissate per la scena attiva. Solo GET same-origin presenti nell'allowlist esatta vengono intercettate: nessuna API, route vault, URL esterno o richiesta con query. Per risorse statiche pubbliche si ignora Vary nel lookup, mantenendo l'offline dei moduli con header Origin. La pulizia rimuove solo vecchie versioni del progetto; aggiornamenti attendono la chiusura delle vecchie schede.

Manifest/URL restano relativi allo scope e supportano sottocartelle. Nessun router o persistenza del profilo. Un futuro catalogo esteso richiederà quote in byte e gestione delle scene di più client; asset protetti avranno delivery e cache separate. Vedi VISUAL_ARCHITECTURE.md.

## Decisioni che potrebbero costare da cambiare

| Decisione | Costo potenziale e limite |
| --- | --- |
| VolumeUnit interi sicuri, ghiaccio in unità, tempi relativi in ms | Il quantum canonico non è ancora quello del riferimento. Risoluzione temporale più fine, altri tipi di ghiaccio o numeri oltre MAX_SAFE_INTEGER richiederebbero migrazione dello schema. Nessuna conversione in ml è stabilita. |
| Cronologia immutabile, schema v1 e replay da stato vuoto | Nuove meccaniche possono richiedere altri eventi o un seed iniziale. Non eliminare o aggregare eventi prima che la ricerca ne provi l'irrilevanza. Il replay completo cresce linearmente con la cronologia. |
| Score intero e quattro componenti di breakdown | Frazioni, valori negativi o componenti diversi richiederanno evoluzione del contratto; la UI presenta i dati ma i nomi dei componenti sono oggi tipizzati. |
| ID stringa stabili e metadato unlock opzionale | Rinominare ID dopo salvataggi o fixture richiederà migrazioni. Nessun formato di salvataggio è stato adottato ora. |
| Separazione score/premi | È una scelta intenzionale e vincolante: premiare un giocatore non cambia il risultato compatibile. Un cambio di prodotto richiederebbe un'altra modalità. |
| Pubblico/vault separati dalla distribuzione degli asset | Un futuro vault richiede infrastruttura server. Mettere contenuti nel bundle pubblico ora impedirebbe una protezione reale successiva. |
| Node 24 e runner nativo TS | Riduce le dipendenze di test, ma fissa il runtime minimo; passare a un altro runner richiederà aggiornare comandi e fixture. |
| Cache PWA limitata a una shell senza router | Deep-link, aggiornamenti immediati, persistenza e offline privato richiederanno nuove policy e test. |

Le decisioni restano documentate e versionabili. React e CSS appartengono esclusivamente alla presentazione: sostituirli non deve cambiare la formula.




## Presentazione e catalogo (fase 0.3)

VisualCatalog associa ID stabili a immagini e definizioni indipendenti di bartender, environment, counter, effect e bottle-set. VisualLoadout seleziona slot di sola presentazione, con effetti sostituibili. Gli ID legacy restano validi; i due bartender forniti usano bartender.b01 e bartender.b02 e nomi modificabili dal catalogo canonico.

ContentItem e BundleDefinition descrivono contenuti/prodotti senza transazioni o proprietà del giocatore. Un bundle riferisce elementi canonici riutilizzabili senza duplicare file e senza equipaggiare automaticamente un tema. UnlockMetadata e PriceMetadata sono solo descrizioni per sistemi futuri separati. ProtectedContentDelivery è un contratto non implementato; il catalogo pubblico non contiene URL privati.

Asset Lab è solo sviluppo e tiene le selezioni in memoria React, fuori dal reducer di gioco. Nessun evento o score cambia per un cambio di slot. Animazioni, fitting e liquidMode appartengono solo alla UI. I PNG forniti sono copie identiche, con provenienza e limiti in ASSET_INGEST_REPORT.md. CONTENT_CATALOG.md documenta tutte le identità, i bundle e i confini.

Decisioni nuove da rivedere prima di scalare: riferimenti stringa e default di equipaggiamento non persistenti; bundle di esempio senza grant; categorizzazione manuale pubblico/privato; fondale con banco incorporato; variante di liquido a indicatore esterno; cache per numero di elementi e pinning di una sola scena per worker. I confini del dominio restano quelli documentati sopra: non è iniziata la fase 1.
