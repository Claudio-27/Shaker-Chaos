# Asset ingest e consegna — fase 0.3

Data: 2026-10-06. Repository: C:/Users/claud/Documents/GitHub/Shaker-Chaos. Tutte le copie, i documenti e le modifiche sono nel repository.

## Sorgente autorizzata e metodo

Cartella individuata: C:/Users/claud/Desktop/Immagini Claudio x Codex/Shaker Chaos/. Il prompt allegato presumeva una cartella interna al repository; non era presente. L'utente ha autorizzato esplicitamente l'eccezione di sola sorgente: “Sì, usa la cartella Desktop come sorgente”. Gli originali non sono stati modificati, rinominati o cancellati.

Inventariati tutti i 21 file prima di modificare il progetto, poi ispezionati visivamente. Copie PNG native browser-compatible, identiche per SHA-256. Nessuna conversione, upscaling, compressione o modifica di raster. Il report JSON conserva byte, dimensioni, alpha bounds e hash integrali.

scripts/inspect-artwork.mjs legge i PNG forniti RGB/RGBA a 8 bit non interlacciati, ricostruisce le scanline e misura alpha bounds con soglia >8; non riscrive immagini. scripts/artwork-mapping.json è la mappa esplicita. La flag --copy copia soltanto verso public/ dentro il repository. L'eventuale uso futuro di una sorgente esterna richiede autorizzazione esplicita per quella sorgente.

## Tutti i file: sorgente → ID → path

Tutti i formati sono PNG. Confidenza alta sul ruolo visivo di ogni file; l'associazione sostanza/ingrediente delle bottiglie resta provvisoria e non è una conclusione meccanica.

| Sorgente relativa | Ruolo | Asset ID | Path relativo a public/ | Dimensioni | Byte | Note |
| --- | --- | --- | --- | --- | --- | --- |
| Barman dandy in posa accattivante.png | idle | bartender.b01.idle | art/bartenders/b01/idle.png | 1086×1448 | 985304 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| analysing.png | tasting | bartender.b01.tasting | art/bartenders/b01/tasting.png | 1086×1448 | 1074244 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| Barman disgustato dal cocktail.png | rough | bartender.b01.rough | art/bartenders/b01/rough.png | 1086×1448 | 1117801 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| Barista con cocktail e pollice alzato.png | balanced | bartender.b01.balanced | art/bartenders/b01/balanced.png | 1086×1448 | 1001281 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| Barman esultante con cocktail e gesto OK.png | excellent | bartender.b01.excellent | art/bartenders/b01/excellent.png | 1086×1448 | 1171621 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| 1_ritratto.png | portrait | bartender.b01.portrait | art/bartenders/b01/portrait.png | 1254×1254 | 1282817 | Crop originale conservato. |
| immagini barista 2/base.png | idle | bartender.b02.idle | art/bartenders/b02/idle.png | 1086×1448 | 1082706 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| immagini barista 2/tasting.png | tasting | bartender.b02.tasting | art/bartenders/b02/tasting.png | 1086×1448 | 1107981 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| immagini barista 2/bad.png | rough | bartender.b02.rough | art/bartenders/b02/rough.png | 1086×1448 | 1140886 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| immagini barista 2/balanced.png | balanced | bartender.b02.balanced | art/bartenders/b02/balanced.png | 1086×1448 | 1126882 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| immagini barista 2/excellent.png | excellent | bartender.b02.excellent | art/bartenders/b02/excellent.png | 1086×1448 | 1174245 | Canvas comune, bordo inferiore y=1447; testa/mano variano tra pose. |
| immagini barista 2/2_ritratto.png | portrait | bartender.b02.portrait | art/bartenders/b02/portrait.png | 1254×1254 | 1278358 | Crop originale conservato. |
| immagini barista 2/iceeffect.png | effetto opzionale | effect.ice-blue | art/effects/ice-blue.png | 1254×1254 | 1025398 | Alpha conservato; nessun crop o ricampionamento. |
| Scintille magiche dorate e turchesi.png | effetto opzionale | effect.sparkles | art/effects/sparkles.png | 1254×1254 | 1088773 | Alpha conservato; nessun crop o ricampionamento. |
| Banco da Bar in Legno Intarsiato.png | banco foreground | counter.c01.surface | art/counters/c01/surface.png | 2172×724 | 1547657 | Alpha conservato; nessun crop o ricampionamento. |
| Bar tiki tropicale al tramonto.png | background + back bar incorporato | environment.e01.background | art/environments/e01/background.png | 1586×992 | 2111373 | Scaffali e banco già dipinti; nessun back bar separato. |
| bottiglia1.png | bottiglia cosmetica | ingredient.bottle01 | art/ingredients/bottle01.png | 1024×1536 | 1290049 | Ruolo certo; sostanza non identificata. Abbinamento demo sostituibile. |
| bottiglia2.png | bottiglia cosmetica | ingredient.bottle02 | art/ingredients/bottle02.png | 1024×1536 | 1456803 | Ruolo certo; sostanza non identificata. Abbinamento demo sostituibile. |
| bottiglia3.png | bottiglia cosmetica | ingredient.bottle03 | art/ingredients/bottle03.png | 1024×1536 | 1575816 | Ruolo certo; sostanza non identificata. Abbinamento demo sostituibile. |
| Shaker da Cocktail Cromato con Accenti Colorati.png | shaker chiuso | gameplay.chrome-shaker | art/gameplay/chrome-shaker.png | 1024×1536 | 1460724 | Richiede mask/varianti per fill interno; ora usa meter. |
| Calice Martini in Vetro Lucente.png | calice | gameplay.martini-glass | art/gameplay/martini-glass.png | 1024×1536 | 1495117 | Richiede mask/varianti per fill interno; ora usa meter. |

## Copertura e questioni irrisolte

- bartender.b01: idle, tasting/analysing, rough/disgustato, balanced/pollice alzato, excellent/gesto OK, portrait. Welcome riusa idle. Scintille condivise come default opzionale, non firma esclusiva dedotta dal file.
- bartender.b02: base→idle, tasting, bad→rough, balanced, excellent, portrait. iceeffect→effect.ice-blue, default opzionale sostituibile.
- environment.e01: fondale tiki completo. Nessun back bar isolato; non sovrapporre lo SVG legacy degli scaffali.
- counter.c01: PNG separato in legno intarsiato. Nel fondale rimane un secondo banco già dipinto: serve un export futuro del fondale senza foreground incorporato per combinazioni artisticamente complete.
- bottiglia1/2/3: ruoli bottle01/02/03 certi. Il set demo associa azzurra→soda, arancio→citrus, frutta rossa→orchard. Non sappiamo la sostanza intesa dall'autore; nessuna proprietà meccanica dedotta. Si può tornare al set segnaposto in Asset Lab.
- shaker e calice integrati; ghiaccio, guarnizione e icone azione non forniti, quindi conservati gli SVG originali.
- Nessun file inutilizzabile o non copiato. Nessuna nuova identità/nome di personaggio approvata: “Bartender 01/02” sono nomi provvisori separati dagli ID.

## Alpha, registrazione e fitting

Pose A/B: tutte 1086×1448, alpha significativo termina a y=1447. A ha bordo superiore da y=12 a 38; B da y=6 a 12. Con altezza di rendering ~234 px, il margine superiore di 12 px del contenitore protegge i capelli anche durante il movimento decorativo. Tutte le immagini mantengono contain e baseline inferiore; le differenze di testa/mani non sono state corrette con crop/warp.

Gli alpha bounds orizzontali differiscono: A excellent [45…1063] è la posa più estesa; B idle [81…1063] comprende il braccio aperto. Le silhouette restano dentro il canvas/safe area nelle prove. I ritratti mantengono il crop fornito: A tocca tutti i bordi, B tocca il bordo inferiore. Non sono ritagliati ulteriormente dalla UI.

Banco 2172×724, alpha bounds [9,97,2162,645]: conserva il padding trasparente, fit contain e z-order dietro ai comandi. Il pannello narrow verticale lascia inevitabilmente una striscia di banco piccola; un futuro asset responsive dedicato potrebbe migliorarlo. Nessuna hitbox dipende dal banco.

Bottiglie 1024×1536: bounds bottle01 [300,13,726,1522], bottle02 [201,59,818,1493], bottle03 [219,34,803,1502]. Margini laterali ampi; il canvas visuale CSS è stato allargato senza modificare i pulsanti. Nomi e quantità restano leggibili anche dopo Servi.

Il fondale 1586×992 è opaco. Cover centrato conserva il centro in 4:3/16:10, taglia i lati in portrait e ingrandisce molto il centro in narrow. Non ci sono varianti responsive fornite. I pannelli chiari preservano la leggibilità del titolo ingredienti, testo reazione, comandi e HUD. Effetti dietro il personaggio evitano di coprire l'espressione.

Shaker e calice 1024×1536 hanno vetro/metallo e riflessi dipinti, non una maschera di liquido affidabile. Usata modalità meter con volume e composizione esterni; liquidWindow legacy mantenuta ma disattivata per questi PNG. Per fill interno del calice richiedere mask coppa e layer bordi/riflessi registrati; non alterare dominio/scoring per adattare il disegno.

## Struttura runtime

~~~text
public/art/
  bartenders/b01/{idle,tasting,rough,balanced,excellent,portrait}.png
  bartenders/b02/{idle,tasting,rough,balanced,excellent,portrait}.png
  environments/e01/background.png
  counters/c01/surface.png
  ingredients/bottle01.png, bottle02.png, bottle03.png
  gameplay/chrome-shaker.png, martini-glass.png
  effects/sparkles.png, ice-blue.png
  placeholders/  (21 SVG originali conservati, comprese le icone UI)
~~~

42 asset registrati, tutti pubblici. Non duplicati nei bundle. Gli artwork originali del Desktop restano sorgenti esterne autorizzate per questa consegna; gli hash nel repository permettono una verifica riproducibile delle copie.

## Dimensioni e performance misurate

| Misura | Valore |
| --- | --- |
| Tutti i 21 PNG | 26.595.836 byte = 26,60 MB = 25,36 MiB |
| Bitmap RGBA teoriche di tutti i PNG | 132.102.016 byte ≈ 125,98 MiB |
| Scena iniziale: 15 asset, dei quali 9 PNG | 13.207.009 byte = 13,21 MB = 12,60 MiB |
| Bitmap RGBA teoriche dei 9 PNG critici | 56.620.816 byte ≈ 54,00 MiB |
| PNG più grande: fondale tiki | 2.111.373 byte |
| Secondo: bottiglia3 | 1.575.816 byte |
| Terzo: banco | 1.547.657 byte |
| Quarto: calice | 1.495.117 byte |
| Quinto: shaker | 1.460.724 byte |

Il totale critico comprende il bicchiere non ancora visibile, necessario per servire offline, e sei SVG piccoli dei comandi/extras. Non comprende pose reazione, degustazione, effetti, B o segnaposto alternativi. Tutti i PNG hanno ~1,57 megapixel: un ritratto da 1,28 MB visualizzato a 30 px e bottiglie visualizzate a poche decine di px sono export eccessivi per il loro uso attuale.

54 MiB è il conto delle superfici RGBA sorgenti, non una misura di RAM del browser: cache immagini, texture GPU, buffer del compositore e varianti già usate possono aumentarlo; alcuni browser possono invece ridimensionare/rilasciare bitmap. Non è stata misurata memoria su tablet fisici. Il limite cache di 32 file limita la crescita di storage, non la RAM o i byte.

Raccomandazioni concrete, non applicate automaticamente:
1. Export derivati portrait 64/128 px con alpha e crop originali, per DPR 1/2; verificare qualità prima di sostituire.
2. Bottle 128×192 e 256×384; shaker/calice 256×384 e 512×768 per le dimensioni correnti.
3. Pose 540×720 per tablet correnti; variante 768×1024 quando si vuole coprire personaggi di ~400 px con DPR 2. DPR 3 richiede verifiche/export maggiori.
4. Confrontare PNG originali con WebP lossless/AVIF su alpha, riflessi e bordi; eventuale lossy solo dopo approvazione visiva. Non inventato un rapporto di compressione.
5. Valutare fondali dedicati portrait/narrow senza banco incorporato, piuttosto che un crop irreversibile.
6. Misurare memoria, decodifica e tempo prima reazione su hardware reale. Eventuale quota cache in byte e pinning per client prima di cataloghi grandi.

## Catalogo, bundle, loadout e confine privato

11 ContentItem canonici e quattro bundle dichiarativi pubblici. Un item è risolvibile indipendentemente e può appartenere a più bundle senza copia. PriceMetadata e UnlockMetadata descrivono possibilità future senza un'economia, grant o store attuale. ID e displayName sono distinti.

VisualLoadout indipendente: bartender, environment, counter, effectOverride, bottleSetId. B + e01 + c01 + scintille condivise è una composizione valida senza bundle. Gli switch non entrano negli eventi o nello scoring. Asset Lab solo sviluppo, /?assetLab=1, selezioni in memoria e diagnostica dimensioni/fallback; /?visualDebug=1 conserva zone/safe area/hitbox.

PublicContentCatalog e registro immagini distribuito ammettono soltanto public. Contratti ProtectedContentRequest/Delivery senza implementazione o URL privati. Futuro accesso reale richiede server autorizzato; password JS e file in public/ non sono protezione. Non sono stati spediti asset privati né creati account/backend/vault.

## PWA e verifica realmente offline

Install: sette file minimi della shell, zero artwork. Allowlist: 42 path pubblici esatti ammessi solo su richiesta. CACHE_SCENE riscalda esclusivamente i 15 asset attivi e conferma la riuscita prima dello stato “Pronto anche offline”. Runtime cache-first, massimo 32 file, esclusione API/private/out-of-scope/foreign/non-GET; conservazione della scena attiva durante l'evizione.

Prova browser: server preview su 4180 acceso, prima visita, stato offline pronto; server arrestato, reload riuscito con tutti i 14 img visibili decodificati; versamento/ghiaccio/agitazione/servizio funzionanti, score demo 34/100; bicchiere presente dalla cache. La reazione rough mai caricata su quell'origine ripiega correttamente su bartender.b01.idle, senza bloccare testo e score. Reset torna a 0 u/0 ghiaccio/0 agitazione/nessuna guarnizione/nessun score. Server successivamente riavviato.

Una variante mai richiesta non è promessa offline. URL/asset protetti futuri non entrano nella allowlist pubblica. L'update conserva la normale attesa di chiusura delle vecchie schede; nessun skipWaiting forzato.

## Controlli eseguiti

- npm run typecheck: PASS.
- npm run lint: PASS.
- npm test: 68 test, 68 passati, 0 falliti, 0 saltati. Prima 53; aggiunti 15 casi utili, conservando gli intenti dei precedenti.
- npm run build: PASS; 38 moduli, JS ~264,40 kB (gzip ~81,39), CSS ~16,84 kB. AssetLab non è un chunk di produzione.
- Browser: gioco normale, Asset Lab e visualDebug, A/B, ambiente/banco reali e placeholder miscelati, set bottiglie e default/override/nessun effetto.
- Switch di slot durante mix da 15 u e dopo servizio: quantità e score restano invariati. Mix completo manuale 60/30/30 u + 4 ghiacci + agrume + 6,2 s → 99/100 e reazione eccellente; il tempo effettivo dei tasti può generare tick ulteriori, quindi non viene dichiarato un 100 manuale. La fixture automatica esatta a 6000 ms resta 100.
- Invio, Spazio e mouse con rilascio fuori dal pulsante verificati. Touch fisico e pointercancel su hardware non simulati in questa consegna; l'adapter HoldButton è invariato.
- 1024×768, 1280×800, 768×1024 portrait e 320×740 narrow: nessun overflow orizzontale. Comandi narrow: hold 68 px, extras 48 px, servizio/reset 52 px in altezza. Scroll verticale previsto in portrait/narrow e con Asset Lab aperto.
- I flag assetLab/visualDebug non attivano pannelli in produzione, verificato anche lasciandoli nella URL.
- Hash delle 21 copie verificati nei test; confronto finale anche con tutti i 21 originali nella sorgente autorizzata, zero differenze. Nessuna nuova dipendenza.

## Decisioni costose da cambiare e prossimi limiti

ID stabili e associazioni canoniche diventeranno contratti quando esisteranno salvataggi/entitlement: rinominarli richiederà migrazioni. Gli attuali bundle sono esempi senza politica di grant. Slot non persistono; nessun formato di inventario/salvataggio è stato scelto.

Per più cataloghi o più schede, il pinning di una singola scena per service worker e il limite per numero di file richiederanno evoluzione. Conservare delivery private separate. L'attuale classify public è manuale: nessun validatore riconosce un segreto erroneamente dichiarato pubblico.

Pose registrate per canvas/baseline, non per punti anatomici; nuove proporzioni possono richiedere anchor/scale metadata per asset. Lo sfondo con banco incorporato e i recipienti senza fill mask restano i limiti artistici principali. Non è necessario rigenerare per giocare alla demo; sono raccomandati export ottimizzati, fondali modulari e mask dedicate prima della rifinitura finale.

**Preserve information until research proves it irrelevant.** Dominio, history, VolumeUnit e scoring della fase 0.1 sono invariati; nessuna mappatura ml, formula del riferimento o fase 1 introdotta. Nessun XP, valuta, account, backend, transazione, acquisto o vault. Nessun commit, push, PR o modifica dei remote.
