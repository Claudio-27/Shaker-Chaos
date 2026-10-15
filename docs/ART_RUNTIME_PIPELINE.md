# Runtime artwork pipeline — fase2G

## SOURCE / DERIVED / GENERATED

- **SOURCE**:21PNG originali in art-source/art/…; byte identici agli hash storici di docs/artwork-inventory.json. Il vecchio path art/… resta nel documento storico come provenienza, non come URL pubblico attuale. Non modificare gli originali e non accedere alle copie Desktop per build/manutenzione.
- **DERIVED**:41PNG in public/art/runtime/…, nomi con hash del contenuto. Solo questi raster e i21SVG originali di fallback/icona sono pubblici. Background1x e2x condividono lo stesso file perché il master attuale è già il limite di risoluzione.
- **GENERATED**:src/content/runtimeArtManifest.ts e docs/runtime-art-inventory.json. Quest’ultimo contiene source/hash/alpha/crop, dimensioni/byte di entrambe le varianti, uso critico/differito, modelloDPR e studio codec. Non editarli a mano.

## Comandi

npm run dev e npm run build usano i derivati già presenti; non richiedono generazione immagini o Pillow. npm run art:verify verifica master, hash, crop, headerPNG, elenco esatto dei derivati e config.

npm run art:build è manutenzione esplicita e locale. Richiede Python con **Pillow12.3.0**; ART_PYTHON può indicare l’interprete già installato. Nessun download, pacchettoNode aggiunto, file esterno o immagine del riferimento. Esempio PowerShell:

```powershell
$env:ART_PYTHON = 'C:\percorso\python.exe'
npm run art:build
npm run art:verify
npm run check
```

scripts/art-runtime-config.json è la policy: sogliaalpha8, padding per categoria, scala massima landscape modellata1,8 eDPR1/2. LANCZOS su alpha premoltiplicato durante il ricampionamento, poi exportPNG con alpha normale; nessuno sharpening. Il PNG è lossless rispetto al raster derivato, mentre il downsampling è la trasformazione tecnica intenzionale. La riproducibilità in byte dipende dallo stesso toolchain; Pillow è versionato e i derivati vengono sempre verificati tramite hash.

Il vecchio scripts/inspect-artwork.mjs rimane strumento storico di ingest/lettura; --copy è disabilitato per evitare il ritorno dei master in public. La nuova build riusa il suo inventario approvato come lista/hash dei21input.

## Canvas logico e pixel runtime

ImageAssetDefinition.width/height conservano il **canvas logico del sorgente**, usato per il fitting2F. runtime.variants[1x/2x].width/height sono le vere dimensioni codificate nel PNG. Non confondere i due valori.

Un SVG leggero espone quel viewBox logico e posiziona il PNG ritagliato a crop.x/y,width/height. Così contour, baseline, perno della selezione e hitbox restano quelli2F in landscape e portrait. L’SVG non contiene copie raster inline o master incorporati: riferisce un solo PNG runtime. I vecchi SVG delle icone restano immagini SVG, senza rasterizzazione.

Il resolver sceglie una sola variante: domanda = scala stage ×DPR,1x fino al budget1,8 e2x sopra; nel flow portrait la scala è1. La variante opposta è solo fallback in caso di errore. Per i viewport principali, la1x copre circa1,8× i pixel logici e la2x circa3,6×, limitata alla risoluzione del master. Il background attuale rimane1586×992: non viene artificialmente ingrandito.

La scelta deliberata sostituisce srcset/sizes e coincide fra renderer, preload e warmPWA. Non viene scaricata automaticamente la variante maggiore. Nessun calcolo di scala/crop/DPR raggiunge gli eventi o lo scoring.

## Caricamento e PWA

Il planner logico resta invariato:15ID critici della scena corrente,9raster e6SVG. Reazioni, effetti non mostrati, altro bartender e contenuti bloccati restano differiti. Il warm traduce ogni ID in **un** URL runtime adatto.

AllowlistPWA:62URL pubblici esatti,7file della shell precached, **nessun artwork/master nel precache**; limite32artwork runtime come prima. CACHE_SCENE può ricevere un’alternativa di risoluzione già allowlisted: viene provata solo se la preferita fallisce, e quella riuscita viene fissata come attiva. Non si scaricano1x+2x insieme durante il normale startup. Il renderer usa lo stesso ordine di fallback; ciò mantiene utilizzabile una scena in cache dopo un cambio di densità/dimensioni offline.

Gli aggiornamenti mantengono la normale attivazione del service worker dopo la chiusura dei vecchi client. La vecchia cache di progetto viene poi rimossa; nessuna cancellazione dei progressi e nessun cambiamento allo schema del profilo.

## DEV visual regression

Solo in sviluppo:

- ?artRegression=1&classicExact=1&scene=b01-idle
- scene=b02-idle / selected / mixing / result
- aggiungere artSource=1 per i master allo stesso canvas;
- classicPose=b01.tasting ecc. riusa le dieci pose della calibrazione2F;
- scene=result&effect=effect.ice-blue per la registrazione dell’altro effetto.

Fixture congelate, riduzione pura di cronologie deterministiche e profilo in memoria: nessuna scrittura dei progressi dell’utente, timer di scoring o automazione del riferimento. Gli endpoint /__art-source/ sono middleware DEV per i soli21ID approvati e non esistono nella produzione. I parametri e i marker sono inclusi nell’audit di isolamento.

Viewport1224×904 senza classicExact produce uno stage1200×880, utile come prova a2× della scena canonica. È modellazione di risoluzione in Chrome desktop, **non una prova su tablet fisico**.

## Formati e limiti

StudioPNG/WebP lossless sui21derivati1x con confrontoRGBA; AVIF a qualità100 provato su background e shaker. AVIF non è pixel-identico e non viene adottato. Anche WebP lossless non viene migrato automaticamente: PNG mantiene una sola famiglia di decoder/formato e la delivery già verificata, mentre crop/downsample realizzano il risparmio principale. Il confronto WebP resta una base misurata per un’eventuale fase di formato/fallback dedicata.

Lo sfondo rimane intero e sensibile alla composizione: niente nuovo crop portrait, rimozione automatica di oggetti o ricostruzione del banco. Per un background-clean, canvas di export aderenti e futuri livelli del vetro vedere ART_EXPORT_REQUIREMENTS.md.

## Misure e prove della fase 2G

npm run art:measure ricostruisce docs/runtime-art-performance.json dal planner corrente e dall’inventario generato, senza rigenerare immagini. Le somme sono byte dei file e RGBA teorico, non benchmark di RAM, rete o tablet fisico. Due esecuzioni complete della pipeline finale hanno prodotto gli stessi 43 file byte per byte (41 PNG e due manifest).

I tre campioni WebP lossless (b01 idle, bottle01 e calice) sono stati anche decodificati in Chrome e confrontati su checkerboard; tutti i 21 campioni hanno RGBA identico nel confronto Pillow. PNG resta il formato scelto in questa fase. Verifiche browser, fallback offline e limiti nel [rapporto 2G](PHASE_2G_REPORT.md).

## Fase 2H — clean background opzionale

Contratto: scripts/environment-art-sources.json. Target approvato: art-source/art/environments/e01/background-clean.png; in questa fase è **assente**, senza placeholder. Il catalogo mantiene environment.e01 e preferisce automaticamente environment.e01.background.clean quando il relativo runtime è generato. Nessuna migrazione dei loadout.

Dopo il drop-in eseguire **npm run art:build -- --environments-only** con lo stesso ART_PYTHON/Pillow12.3.0. Il comando scopre il file, verifica PNG opaco, dimensioni minime1600×1000 e rapporto, registra provenienza/hash e produce1x/2x1440/2880px con cap al master. Riusa senza rigenerarli tutti gli asset già verificati e invariati. Seguire con art:verify, art:measure e check. La build normale continua a usare i derivati versionati; non cerca o scarica immagini. La verifica semantica del clean rimane visiva.

environmentSources nell’inventario è un record additivo di presenza/provenienza. docs/artwork-inventory.json e i21 master storici non cambiano. Rimuovendo il clean e rieseguendo la manutenzione si torna al legacy; vengono rimossi solo i derivati obsoleti generati, con i confini già previsti. Lo schema del profilo non cambia.

PWA: stesso precache7shell, allowlist esatta dei runtime e limite32. Ora le alternative supportano una catena limitata/validata, comprendente clean1x/2x elegacy; niente download speculativi. Offline usa il clean se già disponibile; può usare il legacy in cache se la consegna clean fallisce. In assenza di export la verifica reale riguarda il legacy: non si dichiara un clean offline mai fornito. Non si memorizzano master o path diart-source.

Vedere [brief artista](ART_REQUEST_ENVIRONMENT_E01_CLEAN.md), [rapporto2H](PHASE_2H_REPORT.md) e baseline finali. **CLASSIC STAGE GEOMETRY LOCKED AFTER PHASE 2H.**

## Clean background attivo — 2026-10-16

Il target opzionale è stato soddisfatto su richiesta esplicita con image_gen integrato: sorgente export1600×1000 e raster nativo1586×992 conservato, ridimensionamento tecnico lieve dichiarato. Ruoli e ID invariati;22 sorgenti registrate e43 PNG runtime, più21SVG (64 URL). Il clean1x è1440×900,2x1600×1000: cap al dettaglio realmente disponibile, nessuna promessa di nuovi dettagli per il lieve aumento del canvas. Legacy e tutti gli altri raster invariati. Vedere CLEAN_BACKGROUND_GENERATION.md e il prompt completo. Questo aggiornamento risolve lo stato “assente” del contratto; la pipeline resta deterministica e il normale build non genera immagini.


## Verifica runtime 2I

Il clean è stato osservato su richiesta runtime1x1440×900 e a domanda superiore2x1600×1000. Il secondo tier è intenzionalmente limitato alla sorgente disponibile; non è un URL master, anche se ne condivide i byte. Una navigazione stabile1280×800 ha richiesto soltanto clean1x; nessun legacy, master o sibling. Il cambio viewport può correttamente cambiare tier secondo scala×DPR.

Corretto il listener diretto error su SVG image con cleanup: il guasto delle due risoluzioni simulato solo nella fixture DEV attiva il legacy. La normale catena di preferenza/cache non cambia. In produzione restano64 URL art ammessi,7shell precache,zero art precached e limite32. Cache2843ac5a0c2438be. Prova reale server spento/reload/round9550 senza fallback del fondale: visual-baselines/phase2i/offline-evidence.json. I nuovi sblocchi mai scaricati possono ancora mostrare una miniatura opzionale vuota offline; la scena attiva resta disponibile. Nessun prefetch indiscriminato aggiunto.
