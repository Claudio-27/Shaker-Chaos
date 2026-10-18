# Phase 2O — Final Balance & Content Pass

17 ottobre 2026. Balance pass v1 concluso; stop dopo2O. Ramo main, HEAD iniziale/finale a0f8b21 (checkpoint2K). Le fasi2L–2N erano ancora locali non committate, diversamente dallo stato atteso: conservate integralmente, senza creare branch, commit, push, PR o collegamenti GitHub.2O resta non committata per revisione.

## Risultato

Sei ingredienti, sette ricette e sei offerte restano il catalogo completo. Source of truth leggibile: [V1_BALANCE](V1_BALANCE.md); [dataset finale](balance-v1-simulation.json) e [baseline sullo stesso modello](balance-v1-before.json). Nessuna feature o infrastruttura aggiunta. Esteso il tooling DEV di economia già esistente con analisi del percorso completo, senza dipendenze nuove.

## Problemi trovati e cambiamenti applicati

| Configurazione | Prima2N | Finale 2O | Motivo |
| --- | --- | --- | --- |
| Verde: scarto riuscita/vicina |12/30|18/36|Primo cambio mensola/nuova bottiglia, maggiore margine per imparare|
| Petali: scarto riuscita/vicina |9/24|18/36|Evitare quantità punitive sommate a Ice2 e shake esatto200–1000ms|
| Goal storico goal.three-recipes |3ricette, Tre firme|5ricette, Cinque firme|Spostare un obiettivo oltre il primo gruppo legacy, mantenendo ID/premio/claim precedenti|

Le quattro ricette legacy restano identiche alla fixture; target, extra, ID e livelli di tutte le ricette invariati. Perfect richiede ancora scarto 0. Premi one-shot/globali, prezzi, gate ingredienti/cosmetici e bundle invariati. Nessun intervento allo scoring o alle regole Pour/Shake/Ice/Garnish. SchemaV3, shop/coordinatore/persistenza e asset pipeline intatti.

Il primo candidato Petali12/30 non bastava:3/120completamenti casual contro2/120iniziali. Con18/36 arrivano13/120; medi82/120 contro41/120; perfect invariati1/120 e3/120. Verde casual19/120 contro8/120, medi94/120 contro78/120, perfect2/120 e6/120 invariati. Frequenze del modello, non dati di utenti. La tolleranza18 corrisponde a sei tick complessivi da 3 unità, non sei errori concessi per ingrediente.

## Percorsi completi

Comando npm run economy:simulate -- --journey --json.144 percorsi di60 round:3abilità×4priorità di spesa×12seed,8.640 round con scorer/settlement/acquisti reali. Survey separata2.520 tentativi.12 tracce rappresentative contengono720 righe con tutte le metriche richieste: score,XP/livello,monete guadagnate/spese/saldo,ingredienti disponibili/acquistabili,ricette,mastery,goal,offerte,bundle. Il vecchio simulatore2K a score costante rimane disponibile invariato. Marker DEV respinto dalla build.

Errori interi riproducibili, omissioni indipendenti diIce/Garnish/Shake, sotto-versamenti e fallimenti; nessun random, clock reale, storage o rete. Scelta di ricette disponibili da completare/perfezionare e wish-list di acquisti dichiarate. Questo descrive un giocatore che usa il ricettario; non campiona la creatività del gioco libero o l’apprendimento umano.

Priorità ingredienti: tutti i beni posseduti mediamente al round28,2casual /24,8medio /22,8esperto. Across tutte le priorità, acquisti completati entro22–31round. Spese finali882ingredienti+bundle,905Scia+ingredienti+residuo,950duecosmetici singoli+ingredienti. Saldi sempre non negativi, nessun grant o doppio addebito. Il prezzo più basso è100 contro150Scia: la prima decisione ha utilità e costo distinti.

Seed0 ingredienti-prima: acquisti Sottobosco/Brace/Petali ai round4/9/16casual,4/8/13medio,3/7/12esperto. Scia-prima li rinvia a8/14/20,7/12/18,7/11/17. Il denaro, non un aumento artificiale del gate XP, separa le nuove bottiglie. Le opportunità si aprono presto ma non regalano tutto. Singoli cosmetici anticipano utilità estetica, bundle richiede attesa e riduce il residuo.

L’obiettivo dei cinque completamenti richiede almeno una ricetta acquistata. Seed0 medio lo ottiene al9anziché5, esperto al6anziché4; con cosmetici prima arriva più tardi. Due goal iniziali possono ancora coincidere nel primo perfect, intenzionalmente. Il casual fisso può non ottenere tutte le medaglie entro60 round: nessuna è richiesta per accedere ai contenuti. Il budget massimo resta205XP/85monete; non basta per comprare nemmeno Sottobosco e non è ripetibile.

Il maggiore intervallo osservato fra nuovi record/goal/acquisti nel piano ingredienti è10round, soprattutto nel risparmio per l’ultimo cosmetico dopo aver già aperto tutte le ricette. Rimangono obiettivi di abilità e una spesa desiderata, senza blocchi meccanici. Dopo il completamento del catalogo il denaro si accumula: limite normale del contenuto finito, senza inventare nuovi sink.

## Bundle e salvataggi preesistenti

Controllata policy reale floor(residuo×85/100):zeroownership382 su 450,Sciaowned255 su 300,Bartenderowned127 su 150,entrambiownednessun acquisto. Due elementi: parziale e quasi completo coincidono. Comprare un solo articolo resta meno costoso del bundle completo; dopoL6 il residuo scontato è una scelta intenzionale. Architettura e guard transazionali intatti.

Il goal mantiene ID storico goal.three-recipes: claim già assegnati con tre completamenti restano validi, senza reset, migrazione, revoca o ulteriore premio. Nuovo test specifico di compatibilità. Stessi ID e requisiti delle quattro mastery legacy.

## Playtest reale

Chrome su origine isolata127.0.0.1:5205. Primo giro manuale da nuovo profilo:123frutteto,score4330,Riuscita97,5%,83XP/30monete complessive con primo goal. Un exact tramite RecipeLab dimostra il primo perfect e il premio una tantum; non viene dichiarato perfect manuale.

Con i soli controlli DEV esistenti si porta il saldo a100/livello3: Sottobosco costa100, Scia manca50,Bartendermanca200,Brace/Petaliancoraoltreilgate. Acquisto Sottobosco100→0 apre Verde; nessun auto-grant/equip. Round manuale Verde120/54/60,Ice1/unaagitazione:8863,Riuscita97,5%,133XP/49monete con goal score.

Checkpoint avanzati accelerati viaLab: proprietà sempre comprata dal normale shop, mai inserita nel save; exact Intesa/Fresco/UltimoLampo premiano il quinto completamento, exactBrace aggiunge mastery. Raggiunti6ingredienti/7ricette; Scia150,Brace175,Petali225; bundle residuo255conrisparmio45. Accelerazione esplicitamente separata dalla stima di pacing.

Passaggio a produzione, due schede reali, preview fermata e fetch locale fallita. Acquisto bundle255offline:699→444, altra scheda aggiornata senza reload. Poi round manuale Petali27/agrumi57/soda147,Ice2/unaagitazione:score6742,Riuscita96,25%,+87XP/31monete base e15XP/5monete completion;444→480, stessa sincronizzazione. Reload offline conserva480,lvl7/366XP,7completate,5perfect e4goal; nessun bonus duplicato.

Il round offline usa build intermedia Petali12/30, con scarto9: stesso esito e score nella finale18/36. Dopo normale aggiornamento della shell chiudendo le sole schede di prova, verificata la UI18/36 e un ulteriore reload offline della build definitiva con lo stesso profilo. [Evidenze e manifest](phase2o-smoke/README.md). Nessun reset del profilo abituale o scrittura console/storage.

## Verifiche

- **375 test passati**,371 del checkpoint 2N più4necessari: tre sul percorso completo/determinismo/conservazione/gate/limitebonus/difficoltà, uno sui goal storici. Test del goal esistente aggiornato a cinque; confini delle tolleranze già verificati dalla suite data-driven. Nessun test eliminato o skipped.
- TypeScript strict, lint, suite completa, productionbuild e boundaryaudit passati. Il primo tentativo era fallito per conflitto cacheVite con serverDEV acceso; risolto fermandolo, senza modificare l’infrastruttura dei test.
- art:verify25master/49runtime,shop:audit,ingredients:audit,recipes:simulate49casi ed economy:simulate passati. Nessuna dipendenza nuova.
- **269 file protetti byte-identici** rispetto all’inizio2O: tutti i precedenti master/pubblici e tutto src eccetto recipeCatalog e relativo test di progressione. Comprende scena/CSS, motore,input,domini,scoring,repository/coordinamento,profiloV3,manifest e pipeline assets.
- **3.361 confronti full RoundResult legacy,zero drift**, digest e tuning fixture invariati; quattro ricette legacy identiche. Prezzi/gate/reward XP e monete,storeCatalog e servizi shop byte-identici.
- Build finale88moduli:JS371,44KB/gzip116,24;CSS66,34KB/gzip14,30,stesso hashCSS2N. index-BP_0-iF_.js/index-B_CcBPhk.css,cache34d3a74d0862ed2e;7shell/70URLart/zeroartprecache/cap32 invariati.

## Limiti rimasti

Simulazioni sintetiche deterministiche, non telemetria né prova definitiva del divertimento. Abilità casual a errori costanti non assume apprendimento; le medaglie esatte restano facoltative. Le quattro ricette legacy possono risultare impegnative per quel modello, ma restano compatibili per richiesta. Nessun collo di bottiglia economico impedisce comunque l’acquisto dell’intero catalogo. Chrome desktop, non tablet fisico.

Offline richiede artwork prima cacheati. Shell esistenti possono mantenere la build precedente finché le schede non si chiudono, policy preesistente non modificata. Test WebLocks/fallback,conflitti,quota,idempotenza e reload conservati; senza WebLocks non si promette atomicità fra writer simultanei. Nessuna pretesa di riproduzione esatta del gioco di riferimento. Nessuna nuova fase avviata.
