# Architettura

Aggiornamento 2026-10-06: fase **0.2**, composizione e asset dopo il rafforzamento di dominio 0.1. Nessuna ricerca o implementazione di fase 1.

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

Vite produce risorse con hash. Lo script di build genera una allowlist dei soli file pubblici e una cache con versione derivata dal contenuto. Il service worker intercetta esclusivamente GET same-origin per file presenti nella lista e le due navigazioni della shell (radice dello scope e index.html). Non intercetta route vault, API, altri percorsi o domini. Per questi soli asset statici pubblici, ignora Vary durante il lookup: gli header Origin aggiunti alle richieste di moduli non devono impedire il riuso offline della stessa risorsa precached. La pulizia rimuove solo vecchie cache con il prefisso del progetto. L'update attende la chiusura delle precedenti schede.

Manifest e URL relativi consentono hosting statico anche in sottocartella; nessun router o deep-link è implementato. La cache pubblica non sarà riutilizzata come meccanismo di protezione o di persistenza del profilo.

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




## Presentazione e asset (fase 0.2)

Vedi [VISUAL_ARCHITECTURE.md](VISUAL_ARCHITECTURE.md) per gerarchia della scena, ID/registro degli asset, safe area, responsive, debug solo sviluppo e requisiti dell’artwork. ScoreResult seleziona un ReactionId tramite un mapping di presentazione; il player decorativo non emette MixEvent e non ritarda lo scoring. Personaggi/ambienti si associano nel composition root, senza implementare selezione o sblocchi. Il codice di dominio e tutti i 49 test precedenti restano invariati. Il preload client pianifica la scena attiva; la PWA precachea ancora l’intera piccola build pubblica dei placeholder.
