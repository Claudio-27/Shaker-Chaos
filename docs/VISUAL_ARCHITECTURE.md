# Architettura visiva

## Presentazione attiva: fase 2B

GameStage e i suoi slot/grid rimangono quelli della fase 0.2/0.3. Tutti gli artwork sono intatti. Il bartender resta centrale, con idle durante la preparazione, tasting dopo Serve e rough/balanced/excellent al reveal; failure usa rough. Tasting facoltativo ripiega su idle; varianti non visitate possono ripiegare su idle offline.

Selezione con bordo interno marcato e ✓, hover più leggero. Solo l’immagine della bottiglia ruota durante Pour: la hitbox resta ferma. Preparazione immediata, stream CSS dopo tick canonici, gauge esterno a target canonico, ice-dock 0/1/2 e pop dell’agrume. Shaker oscilla solo durante hold; ring/burst originale sul fallimento. Nessun masking del liquido nel PNG, nuova immagine o libreria animazioni.

Result card: numero prominente /10000, titolo, contributi secondari e Nuovo drink. Il reveal dura 1050ms al massimo nominale: 650ms assaggio, 180ms score, 220ms reazione; breakdown finale. Mostra il risultato salta la sequenza. Le latenze browser possono ritardare la presentazione, mai lo score. Reset annulla i timer; focus su Agita al pieno, Servi dopo agrume, skip durante tasting, poi titolo finale, e su Versa al nuovo giro.

Una preferenza condivisa prefers-reduced-motion disattiva oscillazioni/transizioni, salta il reveal e gli effetti decorativi; fallimento e informazioni restano visibili. Diagnostica DEV include fase, Pour, rischio, result-stage e reduced, con checkbox di anteprima. Non cambia la preferenza OS.

Landscape 1024×768 /1280×800: distanze e altezza bottiglie rese più compatte conservando target minimi di 46px; portrait 768×1024 e mobile 390×844 /320×640 scorrono. Nessun overflow orizzontale osservato, target mobile minimi 48px. Numeri tabulari, wrapping dei titoli, etichette e indicatore corrente oltre al colore; focus ben visibile.

Animazione CSS, tre timer di reveal e frame decorativi esistenti. BottleShelf e MixingStation confrontano soltanto cambiamenti visibili; bartender, overlay e HUD sono memoizzati. Il dominio mantiene i campioni necessari (25ms durante Shake), senza un nuovo loop RAF/React per animare. Nessuna dipendenza aggiunta.

Cache selettiva invariata: 7 file shell, 42 path pubblici ammessi on demand, zero artwork precache; 14 path critici della scena attuale. Reaction/effect/tasting scaricati quando visitati. Smoke con preview spento: reload e giro funzionano. La UI non promette disponibilità offline di pose mai caricate.

[Rapporto e prove 2B](PHASE_2B_REPORT.md). Le note seguenti descrivono l’integrazione originale 0.3, con i suoi conteggi storici.


Aggiornamento 2026-10-06. Artwork forniti e catalogo modulare integrati dopo la composizione 0.2. Nessuna fase 1. Scoring demo UNVERIFIED / NOT YET COMPATIBILITY-VERIFIED.

## Flusso e gerarchia

~~~text
storia canonica → replay → MixState / ScoreResult
                               ↓ soli dati di presentazione
VisualLoadout → VisualCatalog → GameStage
                ↓                ├─ EnvironmentLayers
            planner              ├─ BottleShelf
                ↓                ├─ BartenderArea / SequenceArt
       scena pubblica attiva     ├─ ReactionOverlay
                                 ├─ CounterArea
                                 │    ├─ MixingStation
                                 │    └─ ControlsArea
                                 └─ ScoreHUD
~~~

Il dominio non importa contenuti o loadout. I timer di SequenceArt sono decorativi: non generano eventi, modificano score o ritardano Servi. La degustazione precede visivamente la reazione; il risultato applicativo è già calcolato. prefers-reduced-motion sceglie subito il frame finale.

VisualLoadout mantiene bartenderId/environmentId/counterId indipendenti, effectOverride e bottleSetId opzionali. Environment non possiede più un banco. Bundle e unlock restano metadati separati, documentati in CONTENT_CATALOG.md. Il legacy milo/studio conserva gli ID originali; l'asset environment.studio.counter è ora referenziato da counter.studio.

## Registro e integrazione

42 immagini pubbliche registrate: 21 SVG geometrici conservati e 21 PNG forniti, copiati senza ricampionamento, crop o conversione. Le copie sono verificate per hash; inventario completo, alpha bounds e limiti in ASSET_INGEST_REPORT.md e artwork-inventory.json.

AssetId risolve path, formato, dimensioni e delivery pubblica. React non conosce nomi di file. Due bartender completi: bartender.b01 e bartender.b02; un ambiente e un banco forniti, oltre ai segnaposto selezionabili in sviluppo; due effetti indipendenti e due set bottiglie.

La copertura minima di un nuovo bartender resta idle e sequenze per welcome/rough/balanced/excellent. Tasting e portrait sono facoltativi; welcome può riusare idle. Le categorie sono tier demo e non evidenza sul riferimento.

## Safe area e fitting

La scena usa grid responsive, z-order e safe area separate dalle hitbox. Landscape ≥960 px mantiene bottiglie/barista/reazione sopra banco/HUD; portrait e larghezze inferiori usano due colonne con righe aggiuntive; <600 px usa una colonna con scorrimento verticale. Nessuna interazione dipende da coordinate fisse del disegno.

I PNG dei bartender hanno canvas 1086×1448 comune e baseline alpha y=1447. contain conserva tutta la silhouette originale; un margine superiore di 12 px lascia spazio al movimento decorativo. Teste e mani si spostano tra pose: non è una registrazione anatomica perfetta. Non è stato forzato un allineamento distruttivo. I ritratti mantengono il crop fornito, senza ulteriori ritagli circolari.

Il fondale tiki usa cover centrato: in portrait/narrow i lati vengono ritagliati a runtime, mentre il centro resta dietro al bartender. Scaffali e un banco sono già dipinti nel fondale. Il banco equipaggiato è indipendente nel modello, ma quel banco dipinto non si può rimuovere con un cambio di slot; per libertà artistica completa serve un futuro fondale senza foreground incorporato.

counter.c01 usa contain, preservando il rapporto 3:1 e l'alpha superiore/inferiore. Sta dietro station e comandi, con pannelli chiari per leggibilità. In narrow occupa una striscia più piccola: non viene stirato o tagliato per riempire il pannello verticale. counter.studio conserva cover.

Bottiglie a contain in canvas allargato per i margini alpha; selezione resta bordo/indicatore del pulsante. I target conservano le dimensioni CSS indipendentemente dalla silhouette. Le descrizioni si riducono in portrait/narrow come nel layout precedente.

## Shaker, vetro e liquidi

Lo shaker cromato è chiuso e il calice ha vetro/riflessi dipinti. Le precedenti finestre rettangolari non rappresentano in modo affidabile il loro interno. gameplay.liquidMode: meter evita che barre rettangolari o cubetti emergano fuori dalla silhouette. Volume/capacità, barra e piccola composizione cromatica esterna restano aggiornati dal MixState; ghiaccio e guarnizione conservano i rispettivi comandi e conteggi. I metadati window legacy sono conservati nel catalogo; la stazione corrente usa sempre il gauge esterno.

Per un riempimento nel calice servono una maschera della coppa e riflessi/bordi separati, registrati sul canvas 1024×1536. Per lo shaker chiuso usare il gauge esterno o richiedere una variante appositamente progettata; non aprire una falsa finestra nell'art originale. Nessuna scelta di fitting modifica capacità, quantità, tempi o score.

## Fallback e diagnosi

Required: idle, sequenze registrate, background/backBar se dichiarato, surface del banco, bottiglie, oggetti gameplay e icone. Riferimenti mancanti o delivery errata falliscono nella validazione prima del rendering; errori di rete di un required asset mostrano un errore esplicito, mantenendo il resto della demo.

Optional: portrait→idle; selectedBottle→bottle/bordo selezione; effetto mancante→nessun effetto; liquid overlay opzionale→colore base. Per un frame di reazione non disponibile offline, AssetImage riusa idle, mentre titolo/score restano leggibili. I fallimenti runtime sono registrati nel DOM e mostrati dall'Asset Lab. Un optional non trasforma un required rotto in un successo silenzioso.

Le varianti caricano quando sono richieste: la prima reazione può attendere la decodifica/rete senza bloccare il servizio. Non si dichiara offline una variante mai richiesta.

## Planner e cache PWA

planSceneAssets considera solo slot attivi, idle/portrait attuali, bottiglie visibili, oggetti gameplay necessari anche a Servi offline e comandi. Effetti, degustazione, reazioni e altri slot non entrano nel warm di idle. selectedBottle carica quando si seleziona e può ripiegare sulla bottiglia base offline. Nessun idle callback scalda il catalogo.

Install precache: solo 7 file della shell (HTML, JS/CSS con hash, manifest, icone). Il service worker ammette 42 path pubblici esatti per runtime cache, senza scaricarli all'installazione. CACHE_SCENE valida e riscalda i 15 asset della scena predefinita; l'ACK positivo abilita “Pronto anche offline”, anche sulla prima visita non ancora controllata dal worker.

Runtime: cache-first per GET same-origin esatti, nessun API/vault/query/URL esterno. Solo risposte riuscite non opaque vengono salvate. Cache artwork separata con massimo 32 elementi, rimozione dei più vecchi non appartenenti alla scena attiva; non è un budget di byte/memoria. La scena attiva è fissata da messaggio a ogni avvio. Un reload mantiene il loadout predefinito, perché le scelte di laboratorio non persistono.

Le cache sono versionate per contenuto; l'attivazione pulisce solo versioni del progetto. L'update attende la chiusura delle vecchie schede. La build rifiuta asset pubblici non registrati/output non classificati. Un futuro catalogo molto più grande o più schede con loadout diversi richiederà una policy di pinning e quote per client, senza trasferire asset privati in questa cache.

## Controlli

I 53 test precedenti sono conservati nei loro intenti, aggiornando la verifica SVG per supportare PNG e la policy cache. Nuovi test verificano cataloghi/bundle/ID, indipendenza, score invariato, selettività, delivery, hash e cache. Le verifiche UI e le misure reali sono nel rapporto di ingest; i test del progetto non verificano la compatibilità del riferimento.
