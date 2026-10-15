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


## Fase 2F — sagoma visibile e geometria separata

classicStageLayout.ts resta la fonte immutata delle regioni/hitbox600×440 della2E. classicVisualFraming.ts descrive invece canvas sorgente, bounding box alpha≥8 e piazzamento della sagoma: scala uniforme, centro e baseline. AssetImage applica i CSS custom properties al vero asset risolto, quindi anche i fallback offline restano coerenti. Le origini della vecchia immagine delle bottiglie sono sommate esplicitamente, senza spostare il pulsante. Fuori dal landscape canonico rimane il fitting responsive2E.

Bartender: dieci pose, altezza292, centrox495, baseline348. Bottiglie: sagome alte111–118 e baseline208 su mensola CSS. Banco: sagoma larga600 da y292; sfondo ritagliato prima dei due piani incorporati. Shaker108, calice62, gauge esterno invariato. Le misure non entrano negli eventi, nel MixState, nel CompatibilityInput, nello scoring o nei premi. PNG e catalogo sono immutati. Il loadout di produzione posseduto/equipaggiato continua a persistere come dalla2C; solo l’anteprima DEV non persiste.

Parametri DEV classicExact=1 e classicPose=b01.idle permettono calibrazione1:1 e posa ferma senza eventi di gioco; vengono eliminati dalla produzione e controllati dall’audit. Visual Debug mostra anche sagome, ancore, sorgente/canvas/scala. Per misure, verifiche e export futuri necessari vedere PHASE_2F_REPORT.md.

## Fase 2G — raster runtime e PWA

La geometria 2E/2F rimane bloccata. I 21 master PNG sono ora in **art-source/art/**, fuori dal web root; 41 derivati PNG con hash nel nome sono in **public/art/runtime/**. I 21 SVG di icone/fallback restano invariati. L’inventario storico conserva i vecchi path come provenienza; non è più l’elenco degli URL di produzione.

RuntimeAssetDefinition descrive canvas sorgente, alpha, crop, margini e varianti 1x/2x con dimensioni native. ImageAssetDefinition.width/height restano dimensioni logiche del sorgente. AssetImage usa un SVG con viewBox originale e colloca il raster derivato al crop originario: anchor, baseline, scala e selezione 2F non si spostano. I fogli CSS cambiano solo img in :is(img, svg), conservando la specificità; un test golden verifica integralmente i tre fogli normalizzati. La diagnostica DEV legge anche i raster dentro SVG.

Renderer, preload e warm PWA condividono la selezione: scala stage × DPR, 1x fino a 1,8 e 2x oltre, senza 3x e senza scaricare entrambi nel normale avvio. Fallback prima all’altra risoluzione, poi all’asset di riserva già previsto. Background intero alla risoluzione originale per entrambi i tier: composizione invariata e nessun upscale artificiale.

La policy PWA corrente sostituisce i numeri storici della sezione precedente: **62 path pubblici esatti**, 7 file shell, zero artwork precached, limite 32 elementi artwork invariato. CACHE_SCENE accetta alternative di risoluzione validate dalla stessa allowlist e le tenta solo dopo il fallimento del path preferito; fissa in cache la variante riuscita. Reazioni, effetti e contenuti non attivi rimangono differiti. Cache versionata per contenuto; attivazione dopo chiusura dei vecchi client, pulizia delle sole vecchie cache del progetto, nessuna migrazione del profilo.

Endpoint master e fixture di confronto esistono soltanto nel server DEV, sono eliminati e controllati dall’audit nella build. npm run dev/build non generano immagini; art:build è manutenzione esplicita con Pillow 12.3.0, art:verify controlla gli output e art:measure ricostruisce il budget dai dati versionati. Nessuna dipendenza nuova o scrittura ai master.

Vedere [pipeline e procedura](ART_RUNTIME_PIPELINE.md), [inventario](runtime-art-inventory.json), [misure](runtime-art-performance.json), [rapporto e limiti](PHASE_2G_REPORT.md) e [specifica export futuri](ART_EXPORT_REQUIREMENTS.md). Il banco dipinto nello sfondo resta un limite artistico: nel canonico il primo piano è occultato dal crop 2F; nel flow portrait rimane la lettura storica. La soluzione futura preferita è background-clean, senza cancellazioni automatiche o variazioni del palco. Gauge esterno e tutti i sistemi del gioco sono invariati.

## Fase 2H — ruoli ambiente e chiusura della geometria

**CLASSIC STAGE GEOMETRY LOCKED AFTER PHASE 2H.** Fonte autorevole: classicStageLayout.ts (600×440, regioni, hitbox, layer); sagome/ancore: classicVisualFraming.ts. classicStageContract.ts riusa questi stessi riferimenti. I cinque file di layout/framing/CSS sono protetti da hash normalizzati nel test di blocco; nessun valore è ricopiato in una configurazione concorrente. Funzioni future usano overlay, dialoghi o schermate secondarie, conservando il palco.

EnvironmentVisualDefinition.background è il legacy obbligatorio; backgroundClean è opzionale e preferito solo se registrato; backBar e decorations rimangono opzionali. La superficie in primo piano è il ruolo **CounterVisualDefinition.surface**, selezionato da VisualLoadout.counterId: non è proprietà dell’ambiente. Non tutti gli ambienti richiedono ogni layer. environment.e01 rimane l’ID del contenuto/persistenza; environment.e01.background.clean è soltanto un futuro ID visivo.

Renderer, planner, preload e warm condividono la risoluzione. Preferenza: clean risoluzione richiesta → altra risoluzione clean → legacy risoluzione richiesta → altra legacy, deduplicando gli alias. Gli ultimi tentativi avvengono solo dopo un errore. Collection segue la stessa preferenza delle immagini ambiente; non cambia ownership, equipaggiamento o flusso. Nessun messaggio tecnico normale per un clean non disponibile; dati diagnostici DOM restano disponibili nel DEV Lab. Lo sfondo legacy conserva esattamente crop/occlusione 2G. Nessuna nuova maschera CSS.

Il source contract individua art-source/art/environments/e01/background-clean.png. In questa consegna è assente sia nel repository sia fra i21 file della cartella sorgente autorizzata. Il panorama storico, verificato tramite hash e ispezione visiva, incorpora ancora il banco. La chiusura tecnica è completa, la rimozione artistica è **BLOCKED ON NEW ART EXPORT**. Nessuna finta pulizia o asset del riferimento.

Baseline finali del nostro gioco: [visual-baselines/phase2h](visual-baselines/phase2h/README.md), con idle/risultato b01 e b02, fallimento, Collection chiusa/aperta. La baseline è legacy finché manca il clean; il nuovo export richiederà aggiornare le sole catture artistiche dopo revisione, mantenendo il blocco geometrico.

## Fondale clean — aggiornamento del 2026-10-16

È ora presente il clean background richiesto esplicitamente dall’utente. Il catalogo lo seleziona attraverso la risoluzione2H già predisposta; environment.e01 e counter.c01 restano stabili. Il fondale non include il banco né gli oggetti di preparazione; il banco selezionabile rimane l’unico piano in primo piano. Il legacy rimane fallback, non un secondo layer simultaneo. Nessuna modifica a CSS, framing o stage. [Provenienza e prompt](CLEAN_BACKGROUND_GENERATION.md). I set di baseline legacy restano storici; non sostituiscono una futura cattura artistica aggiornata. CLASSIC STAGE GEOMETRY LOCKED AFTER PHASE2H.


## Fase 2I — verifica reale e blocco della scena

**MAIN CLASSIC GAME STAGE VISUALLY LOCKED AFTER PHASE 2I.** **DOUBLE_COUNTER_STATUS: RESOLVED**, dopo ispezione del gioco reale e delle fixture600×440 con environment.e01 CLEAN e banco indipendente counter.c01. Le sette baseline sono ora aggiornate, conservando i set precedenti nella storia Git. Bloccati palco600×440, composizione clean, regione bartender, mensola, piano banco, mixing, comandi, pannello e HUD. Nuove funzionalità solo overlay/dialoghi/schermate secondarie.

Nessun artwork, CSS, coordinata o metadato di framing modificato. Il framing2F condiviso conserva scala/crop e compatibilità legacy; il clip292 non è una nuova maschera e rimane necessario anche al fallback. Nessuno strip/overlay/gradiente aggiunto. Prova positiva con counter.studio. Le pose dieci e gli effetti sparkles/ice-blue sono stati osservati.

Correzione d'integrazione: gli errori di SVG image non propagati richiedono listener diretto e cleanup; il guasto reale DEV delle due varianti clean ora attiva il legacy. La preferenza normale resta clean. ArtRegression può simulare il guasto solo nella fixture DEV con cleanFailure=1, senza mutare catalogo, asset o profilo. VisualDebug riporta environment.e01, CLEAN/LEGACY, runtime e fallback disponibile; l'audit impedisce l'inclusione di questi strumenti in produzione.

PWA verificata su build index-K30thIJp.js/cache2843ac5a0c2438be: server spento, reload e round9550 con clean1x, nessuna richiesta legacy/master/sibling. Artwork mai richiesto resta differito, come prima. Vedere [rapporto](PHASE_2I_REPORT.md), [baseline](visual-baselines/phase2h/manifest.json), [prove offline](visual-baselines/phase2i/offline-evidence.json).
