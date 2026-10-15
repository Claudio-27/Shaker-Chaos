# Phase 2G — Production Asset Refinement

Stato: **completata, non committata su main**. Repository locale Shaker-Chaos. La geometria 600×440 e le regole del gioco approvate in 2F sono preservate. Nessuna fase successiva è stata iniziata.

## Workflow e pipeline (voci 1–4)

1. Ramo verificato: **main**, mantenuto per l’intera fase.
2. Checkpoint 2F creato **prima** delle modifiche 2G: **cbff3e2**, “Calibrate classic visual fidelity for Phase 2F”. Eccezione esplicitamente autorizzata dall’utente: “Autorizzo il solo commit locale della fase 2F”. Non era un commit già eseguito dall’utente; non viene presentato come tale.
3. **21 master PNG**, 26,595,836 byte complessivi, spostati byte-identici in **art-source/art/**, fuori dal web root. Hash confrontati con l’inventario storico. **41 derivati PNG** in **public/art/runtime/**, più i 21 SVG preesistenti. I vecchi path nell’inventario storico sono provenienza, non URL attuali. Nessun originale Desktop è stato letto o modificato in questa fase.
4. **npm run art:build**: manutenzione esplicita, Python/Pillow 12.3.0, configurazione versionata; alpha ≥8, padding per categoria, LANCZOS con alpha premoltiplicato, nessuno sharpening, nessun upscale oltre il master. Scritture atomiche solo se cambiano i byte; pulizia dei soli derivati obsoleti enumerati dal manifest precedente. Genera manifest TypeScript e inventario JSON. **npm run art:verify** verifica hash, crop, padding, dimensioni/header e lista esatta dei file. **npm run art:measure** ricostruisce le misure sotto. Due esecuzioni consecutive con la pipeline finale hanno prodotto **43 file identici in byte**: 41 PNG e due manifest. Dev/build normali usano i derivati esistenti e non richiedono Python/Pillow o rigenerazione.

## Bottiglie (voci 5–8)

Le tre sorgenti sono 1024×1536. Estremi del crop destro/inferiore esclusivi. Il padding richiesto è 12 pixel sorgente, limitato dai bordi del master. Nessun pixel con alpha ≥8 è scartato. Le grandi fasce laterali trasparenti vengono eliminate senza uniformare le larghezze artistiche.

| ID | Sorgente | Crop x,y,w,h (pixel sorgente) | Runtime 1x | Runtime 2x | Byte sorgente / 1x / 2x |
|---|---|---|---|---|---|
| ingredient.bottle01 | 1024×1536 | 288, 1, 451, 1534 | 67×228 | 134×455 | 1,290,049 / 25,076 / 80,893 |
| ingredient.bottle02 | 1024×1536 | 189, 47, 642, 1459 | 100×228 | 200×455 | 1,456,803 / 33,969 / 109,768 |
| ingredient.bottle03 | 1024×1536 | 207, 22, 609, 1493 | 93×228 | 186×455 | 1,575,816 / 38,747 / 125,700 |

Le sagome canoniche conservano altezze 118 / 111 / 118, centri x240 / 155 / 70 e baseline y208. Selezione e hitbox non dipendono dalle nuove dimensioni fisiche del PNG.

## Bartender e ritratti (voci 9–12)

Tutte le dieci pose hanno sorgente 1086×1448. La sagoma runtime è alta circa 544/1088 pixel; il crop con margine 16 conserva anche capelli e mani ai bordi già presenti nel master. Non si possono recuperare dettagli già tagliati nell’originale.

| ID | Sorgente | Crop x,y,w,h (pixel sorgente) | Runtime 1x | Runtime 2x | Byte sorgente / 1x / 2x |
|---|---|---|---|---|---|
| bartender.b01.idle | 1086×1448 | 83, 22, 981, 1426 | 378×550 | 757×1100 | 985,304 / 187,291 / 618,609 |
| bartender.b01.tasting | 1086×1448 | 170, 0, 889, 1448 | 337×549 | 674×1097 | 1,074,244 / 200,316 / 653,382 |
| bartender.b01.rough | 1086×1448 | 141, 0, 901, 1448 | 342×549 | 683×1098 | 1,117,801 / 207,514 / 680,428 |
| bartender.b01.balanced | 1086×1448 | 76, 20, 945, 1428 | 364×550 | 728×1100 | 1,001,281 / 193,117 / 628,708 |
| bartender.b01.excellent | 1086×1448 | 29, 13, 1053, 1435 | 404×550 | 807×1100 | 1,171,621 / 221,111 / 730,796 |
| bartender.b02.idle | 1086×1448 | 65, 0, 1015, 1448 | 385×549 | 769×1097 | 1,082,706 / 205,228 / 661,332 |
| bartender.b02.tasting | 1086×1448 | 96, 0, 858, 1448 | 324×547 | 649×1095 | 1,107,981 / 206,795 / 668,908 |
| bartender.b02.rough | 1086×1448 | 110, 0, 936, 1448 | 353×547 | 707×1093 | 1,140,886 / 212,494 / 692,670 |
| bartender.b02.balanced | 1086×1448 | 151, 0, 798, 1448 | 301×546 | 602×1092 | 1,126,882 / 209,668 / 675,798 |
| bartender.b02.excellent | 1086×1448 | 73, 0, 980, 1448 | 370×547 | 740×1094 | 1,174,245 / 220,220 / 714,235 |

11. Registrazione invariata: **centro x495, baseline y348, altezza della sagoma 292**, separatamente per le cinque pose di ogni bartender. I metadati 2F conservano scala/traslazione della posa; il crop viene rimappato dentro il canvas sorgente virtuale. Nessuna nuova correzione CSS di posizione. Verificate tutte le pose, con gli stessi limiti anatomici delle sorgenti.
12. I portrait 1254×1254 diventano 128×128 / 256×256 per b01 e 104×128 / 207×256 per b02, inquadratura invariata. La card usa 90 CSS pixel in altezza; il relativo canvas logico rimane quello originale. Byte e crop nella tabella seguente.

## Recipienti, banco, ambiente ed effetti (voci 13–20)

| ID | Sorgente | Crop x,y,w,h (pixel sorgente) | Runtime 1x | Runtime 2x | Byte sorgente / 1x / 2x |
|---|---|---|---|---|---|
| bartender.b01.portrait | 1254×1254 | 0, 0, 1254, 1254 | 128×128 | 256×256 | 1,282,817 / 26,202 / 85,351 |
| bartender.b02.portrait | 1254×1254 | 109, 0, 1016, 1254 | 104×128 | 207×256 | 1,278,358 / 27,725 / 87,053 |
| effect.ice-blue | 1254×1254 | 42, 38, 1169, 1152 | 358×353 | 716×706 | 1,025,398 / 130,464 / 432,267 |
| effect.sparkles | 1254×1254 | 194, 113, 930, 902 | 285×276 | 570×552 | 1,088,773 / 126,195 / 448,819 |
| counter.c01.surface | 2172×724 | 0, 85, 2172, 573 | 1097×289 | 2172×573 | 1,547,657 / 405,630 / 1,471,285 |
| environment.e01.background | 1586×992 | 0, 0, 1586, 992 | 1586×992 | 1586×992 | 2,111,373 / 2,046,022 / 2,046,022 |
| gameplay.chrome-shaker | 1024×1536 | 154, 14, 715, 1503 | 109×229 | 218×458 | 1,460,724 / 35,904 / 113,819 |
| gameplay.martini-glass | 1024×1536 | 29, 90, 968, 1383 | 149×213 | 298×426 | 1,495,117 / 33,378 / 108,241 |

13. Shaker: crop alpha con 16 pixel di sicurezza, sagoma canonica alta108 al centro283,278. Chrome, riflessi e posizione preservati. Gauge esterno invariato.
14. Calice: stesso principio, sagoma alta62, baseline332 e centrox338. Nessuna maschera liquida inventata; trasparenze/riflessi rimangono dipinti.
15. Banco: master2172×724, crop2172×573 a y85, padding12. Sagoma larga600, top y292. Nessuna variazione di hitbox, legno, prospettiva o allineamento.
16. Background: mantenuto **intero1586×992**, ricodifica PNG RGB senza alpha inutile, stessa composizione. 1x e2x condividono un file: nessun upscale e nessun secondo download. Non è stato introdotto un crop landscape/portrait nuovo, perché la mitigazione 2F è già il miglior ritaglio sicuro disponibile senza cambiare geometria o tagliare arredi.
17. Mitigazione esatta nel landscape: canvas di sfondo **799.395161×500** logici, x**−99.697581**, y0, finestra visibile **600×292**. Sul master corrisponde a **x197.8…1388.2, y0…579.328**. Il resto inferiore è escluso; il banco separato inizia a y292. Il grande piano incorporato in primo piano, circa y660 e oltre nel master, contribuisce **0 pixel di altezza visibile** nel canonico. Il bordo del piano posteriore sfiora la fine della finestra: una banda conservativa y572…579.328 equivale a **7.328 pixel sorgente / 3.694 pixel logici massimi**. È un limite geometrico esplicito della fascia da controllare, non una falsa misura semantica pixel per pixel del legno. Non esiste un layer/maschera del banco incorporato con cui certificarne un’area esatta. Nel flow portrait il fondo completo conserva la doppia lettura storica: non si pretende che questa fase l’abbia eliminata.
18. Il banco dipinto non è rimovibile come oggetto indipendente dal raster: coprire o cancellare più in alto eliminerebbe parte di mensole/arredo o cambierebbe la composizione approvata. Nessuna cancellazione, clone o inpainting.
19. Soluzione futura preferita: **environment.e01.background-clean**, master3200×2000 consigliato, minimo1600×1000, stessa luce/ambiente; niente banco anteriore o secondo piano posteriore, UI, personaggi o recipienti dipinti nella preparazione. Overlay e fasce sacrificabili esatti in [ART_EXPORT_REQUIREMENTS](ART_EXPORT_REQUIREMENTS.md).
20. Sparkles e ice-blue restano due effetti indipendenti, ritagliati con padding20 e canvas runtime equivalente a384/768 sul sorgente intero. Entrambi ispezionati in risultato; anchor e baseline del personaggio restano invariati. Nessun effetto nuovo.

## Formati e densità (voci 21–23)

21. **PNG** per i derivati raster con alpha; **SVG** preesistenti per icone/fallback. Il PNG è lossless rispetto al raster derivato; crop e downsampling sono trasformazioni tecniche intenzionali, quindi non si dichiara identità pixel con il master.
22. Studio su tutti i21 derivati1x: **WebP lossless RGBA-identico**. Tre campioni (b01 idle, bottle01, calice) decodificati anche in Chrome e confrontati su checkerboard. Esempi PNG→WebP:187291→132836,25076→19746,33378→26318 byte. Migrazione rimandata: il risparmio principale viene già da crop/resize, mantenendo un formato/decoder e la delivery PNG verificata; non è una bocciatura qualitativa di WebP. AVIF quality100 provato su sfondo/shaker: differenza massima2 per canale, non identico; escluso. Nessuna conversione lossy di produzione.
23. Policy esplicita: domanda=scala del palco×DPR;1x fino a1.8,2x oltre. Modello basato su landscape fino a circa1.8 eDPR1/2, controllato anche a scala2. Nel flow portrait scala1×DPR. Nessun3x. Dimensioni arrotondate a pixel interi e cap al master; eventuale uso oltre il modello non garantisce nuovi dettagli. Lo sfondo è già al tetto della sorgente. La sua qualità nel cover portrait ad alta densità richiederà il nuovo export.

## Budget (voci 24–28)

Inventario completo: [runtime-art-inventory.json](runtime-art-inventory.json). Misure ricostruibili: [runtime-art-performance.json](runtime-art-performance.json). Scena iniziale b01:9raster critici +6SVG. Questi numeri sono somme dei file e stima RGBA width×height×4; **non** tempi di rete, memoria del browser misurata o benchmark di tablet fisico.

| Scena iniziale | PNG codificati | RGBA teorico |
|---|---:|---:|
| Prima, master |13,205,660 B|56,620,816 B|
| Dopo1x |2,832,219 B|8,922,428 B|
| Dopo2x |4,759,688 B|16,717,984 B|
| Riduzione1x |78.55%|84.24%|
| Riduzione2x |63.96%|70.47%|

24. Prima:13,205,660 byte raster nella scena attiva.
25. Dopo:2,832,219 /4,759,688 byte per1x/2x. Tutti i derivati unici pubblici:14,781,128 byte, includendo entrambe le risoluzioni e una sola copia del background. JS principale306251→323660 byte, CSS59987→60266: costo esplicito del registro e della selezione, non nascosto nel risparmio immagini.
26. **15 URL immagine distinti** nella scena iniziale, invariati; conteggio logico a cache fredda, non pacchetti HTTP effettivamente osservati. Un file perID, senza caricare entrambe le risoluzioni nel normale warm. Aggiuntive reazioni/effetti/Collection solo quando visualizzati; fallback può effettuare un secondo tentativo se il primo fallisce.
27. PWA:7file shell precached, **zero artwork precached**,62path pubblici esatti ammessi on-demand, limite32elementi runtime invariato. Hash del contenuto nei nomi e nella versione cache. CACHE_SCENE valida anche l’alternativa di risoluzione: tentata solo se la preferita fallisce, pin della variante realmente riuscita. Il registro non comporta warm di tutto il catalogo. Asset di altri bartender e bloccati rimangono differiti. Il limite è per numero di file, non un budget di RAM o byte; più loadout/schede richiederanno una futura policy perclient.
28. Nessun master inpublic o dist, nessun URL di produzione verso art-source. Endpoint DEV ristretto ai21ID: /__art-source/; assente dalla build. Nessuna sorgente necessaria al gioco/offline. Il salvataggio del profilo non dipende dai path delle immagini.

## Registro, rendering e validazioni (voci 29–36)

29. RuntimeAssetDefinition tipizzato: canvas sorgente/hash/alpha, crop, padding, soglia, varianti con dimensioni native/hash/byte/formato. **ImageAssetDefinition.width/height restano il canvas logico sorgente**, non la dimensione fisica del file; quelle native sono inruntime.variants. Manifest generato separato dal catalogo artistico e dal dominio.
30. Selezione deliberata condivisa da renderer, preload ePWA invece di srcset/sizes. Un SVG leggero con viewBox sorgente piazza l’image raster al crop originale: fitting/anchor invariati anche nei fallback1x↔2x. Nessun canvas bitmap gigante ricostruito. Resize/DPR cambiano solo la scelta del file. CSS: esclusivamente img→:is(img, svg), stessa specificità; test golden normalizza tutti e tre i fogli e verifica identità completa con2F.
31. DEV600×440 esatto: b01idle, b02idle, selezione, mixing e risultato; dieci pose, due effetti. Confronti sorgente/runtime1x e2x: capelli/mani, etichette, chrome, vetro, bordo banco, ritratti senza nuovi tagli o aloni evidenti. Capture locali inwork/2g-source600.jpg,2g-runtime600.jpg,2g-source1200.jpg,2g-runtime1200.jpg. Differenza media assolutaRGB600:1.59/1.46/1.55 su255; a1200:0.93/0.86/0.91. Catture JPEG e ricampionamento inclusi, non una prova di identità pixel. Ancore verificate strutturalmente e viaDOM. Fixture DEV in memoria, prive di scritture al profilo.
32. **1280×800**:stage1058.182×776, scena completa, nessun overflow orizzontale; screenshot finalework/phase2g-stage.jpg. Produzione verificata anche con queryDEV: apreAppnormale, nessun master/fixture.
33. **1024×768**:stage1000×733.333, frame1000×744, scala1.666667, nessun overflow. Misurato dopo l’assestamento del resize, non sulla paint precedente.
34. **768×1024,390×844,320×640**: flow responsive preesistente, scroll verticale atteso, nessun overflow orizzontale. CounterxMidYMin slice nel flow, crop sorgente ricostruito correttamente. Portrait/head/alpha/etichette ispezionati. Nessuna pretesa di test touch fisico o prestazioni hardware. Input adapter e regole reduced-motion preservati.
35. Collection reale: entrambi i ritratti ottimizzati e cambio equipaggiamento b01→b02; bartender bloccato differito prima dello sblocco. Stesso cambio fra contenuti già in cache verificato offline con Escape per chiudere. Nessuna variazione di ownership o disponibilità.
36. Preview4208 **spento**, reload riuscito: ambiente, banco, tre bottiglie, b02idle, shaker. Giro completo offline conSpazio perPour/Shake, ghiaccio2 eguarnizione:calice,b02excellent,sparkles visibili dalla cache. Risultato9550; successivo reload mantiene profilo/equip e nessun errore di asset richiesto. Cambio a1224×904(stage1200×880),2fallback di risoluzione→1x già in cache, reload a tale scala: **Pronto anche offline**, zeroerrori eprofilo invariato. La thumbnail dell’effetto appena sbloccato alLivello3 non era stata visitata: il suo fallback opzionale resta previsto; non viene dichiarata disponibile offline tutta la collezione mai scaricata.

## Regressioni e consegna (voci 37–49)

37. Dominio, application, input eflusso risultato invariati. Un giro eccellente identico produce **9550**; nessun valore di scoring ritoccato. I test precedenti restano validi nei loro intenti; controlli di dimensioniPNG ora leggono la dimensione runtime effettiva.
38. Progressione/persistenza invariate: due giri online e unooffline, ciascuno+115XP/+43monete. Profilo finale **Livello3,95/200XP,129monete**, b02equipaggiato; ricariche non duplicano premi. FileApp,PlayerProgression e moduli dominio/application conservati inhash; nessuna migrazione schema.
39. **280test passati**,267precedenti+13utili: manifest/hash/dimensioni/crop/margini, risoluzioni/ID, divieto di master pubblici, selettivitàplanner, fallback/allowlistPWA e registrazioneSVG/CSS. Nessun test saltato.
40. **TypeScript, lint, tutti i test, build di produzione, audit dei confini DEV e art:verify passati**. Build67moduli,7shell/62patharte; nessuna dipendenza aggiunta. Script di misura eseguibile separatamente.
41. [ART_EXPORT_REQUIREMENTS](ART_EXPORT_REQUIREMENTS.md): overlay canonico esatto, master ebaseline, sRGB/alpha senza matte, pivot, consegna di livelli ehash. Specifica anche i futuri livelli del vetro/back/mask/front; gauge attuale invariato.
42. Limiti residui: sfondo con piani dipinti e risoluzione limitata, pose con bordi già tagliati nei master, registrazione perboundingbox e non pivot anatomico originale, recipienti senza livelli liquidi, singoloChrome desktop perQA, cache32file e policyDPR1/2. Nessuna promessa di pixelperfection o compatibilità esatta con il riferimento.
43. Export artistici futuri precisi: background-clean3200×2000; banco2400×640 alpha; bottle01/02/03 circa300×976/416×920/408×976; shaker448×896; glass736×1024 con livelli; cinque pose perbartender896×1200,pivot448,1184; portrait512×512. Sono specifiche per un artista, non file generati qui.
44. Prossima fase consigliata, solo su nuovo prompt: ricevere/verificare background-clean easset a livelli, integrarli attraverso questa pipeline con lo stesso stage; eventualmente valutare WebPlossless e un benchmark sutablet fisico. Nessuna fase successiva avviata.
45. **Nessuna immagine artistica generata, ridisegnata o ritoccata**, nessunaAIimagegen: solo trasformazioni tecniche delle copie locali approvate.
46. **Nessuna ricerca/esecuzione del riferimento**, Ruffle/SWF/non avviati. Dataset e osservazioni congelati.
47. **Nessun ramo creato**.
48. **Nessun commit della2G, push, PR, accessoGitHub o modifica di remote/storia**. Unico commit di questa sessione: il checkpoint2F autorizzato, prima della fase.
49. **Tutte le modifiche2G restano non committate e non staged su main**, disponibili per revisione inGitHubDesktop. Stop dopo2G.
