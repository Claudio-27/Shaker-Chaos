# Architettura visiva — fase 0.2

Data: 2026-10-06. Composizione e contratti per artwork originale. La fase 1 di compatibilità non è iniziata. Tutte le immagini attuali sono SVG geometrici segnaposto realizzati nel progetto; nessun artwork finale o asset del riferimento è stato importato.

## Reference familiarity vs original visual expression

Conserviamo la gerarchia funzionale del formato: bartender come punto focale, bottiglie disponibili, banco e preparazione, comandi Versa/Agita/Servi, reazione e risultato immediato. La familiarità riguarda disposizione delle funzioni e ritmo d'uso. Personaggio, ambiente, forme, palette, etichette, dialoghi, tipografia e animazioni sono espressione indipendente. Non si tracciano screenshot, non si ricrea il bartender originale e non si riproduce una GUI pixel per pixel.

## Gerarchia dei componenti

```text
App — adapter degli input e composizione delle dipendenze
└─ VisualAssetsProvider — registro esplicito degli asset pubblici
   └─ GameStage
      ├─ EnvironmentLayers — background, back bar, decorazioni per profondità
      ├─ BottleShelf — selezione mediante hitbox, immagini risolte per ID
      ├─ BartenderArea — nome/ritratto + CharacterSafeArea
      │  ├─ SequenceArt — idle, tasting, reazione
      │  └─ accessori / effetti opzionali registrati sul canvas del personaggio
      ├─ ReactionOverlay — titolo e dialogo, focus dopo il servizio
      ├─ CounterArea — superficie originale indipendente
      │  ├─ MixingStation — anteprima di shaker/bicchiere, liquido, ghiaccio, guarnizione
      │  └─ ControlsArea — HoldButton, extra, servizio e reset
      ├─ ScoreHUD — punteggio, breakdown e guida demo
      └─ VisualDebug — solo sviluppo, opzionale
```

I componenti di zona sono in `src/ui/GameStage.tsx`; il resolver delle immagini e il player decorativo sono in `src/ui/AssetVisual.tsx`. Il dominio, la cronologia canonica, il replay, le quantità e lo scoring non importano questo sistema e non hanno subito modifiche in fase 0.2.

## Composizione responsive

| Condizione CSS | Regola di composizione |
| --- | --- |
| Landscape, larghezza almeno 960 px | Prima fascia: bottiglie / bartender / reazione. Seconda: banco con preparazione e comandi su due colonne, HUD a destra. Target prioritari 1024×768 (4:3) e 1280×800 (16:10). |
| Landscape, altezza fino a 850 px | Riduzione degli spazi secondari, shaker di anteprima più compatto, heading dei comandi omesso visivamente. Le hitbox non si riducono. Default e risultato servito rientrano nei due viewport target. |
| Larghezza almeno 1360 px | Più spazio fra zone e bottiglie più grandi, scena limitata dalla cornice massima di 1520 px. La successiva regola portrait resta prioritaria. |
| Portrait oppure larghezza 600–959 px | Bartender e reazione affiancati; bottiglie su una riga; banco sotto; HUD orizzontale a due colonne. Scorrimento verticale consentito. |
| Larghezza sotto 600 px | Bartender → reazione → bottiglie → banco → HUD. Anteprima shaker e indicatore affiancati; comandi sempre in due colonne. Scorrimento verticale, senza scala uniforme della scena. |
| Larghezza sotto 360 px | Icone visibili e padding dei comandi più compatti; stessa hitbox. Supporto verificato a 320 px di viewport. |

Il layout usa CSS Grid, flex, `minmax`, unità di viewport sicure e safe-area inset. Le immagini decorative possono essere ritagliate con `cover`; personaggi, bottiglie e oggetti interattivi usano `contain`. Nessuna azione è legata a coordinate della scena, a una percentuale di immagine cliccabile o al rapporto d'aspetto dell'artwork. Un'apertura volontaria delle guide o un viewport landscape più corto dei target può richiedere scorrimento: non nascondiamo comandi per imporre una scala globale.

## Area sicura del personaggio

`CharacterSafeArea` definisce un contenitore indipendente dal canvas della singola immagine: larghezza 100% della zona, massimo 310 px (300 in portrait); altezza adattiva, 246 px nella composizione landscape compatta, 235 px in portrait e 224 px su schermi stretti. Il desktop può arrivare a 400 px di altezza. Il fit è `contain` con ancoraggio **centro / basso**.

Questa è un'area di sicurezza del layout, non una collision box. Un bartender con artwork più largo o più alto mantiene il proprio rapporto d'aspetto; non serve cambiare la schermata di gioco. La visibilità del personaggio va controllata nella scena, non solo nella singola tavola.

Per un primo pacchetto coerente consigliamo canvas 3:4 con alpha, soggetto centrato e margine libero attorno alla posa più ampia. Tutte le pose di uno stesso bartender devono condividere canvas, scala, baseline e ancoraggio. Accessori/effetti sovrapposti devono usare **lo stesso canvas e registrazione**: non possono essere allineati arbitrariamente dalla loro silhouette. Personaggi diversi possono usare canvas differenti; adattare le rispettive tavole prima di aggiungere layer comuni. Non assumiamo una singola dimensione di sprite per tutti i bartender.

## Definizioni, ID e associazione dei contenuti

- `src/content/visualModel.ts`: `ImageAssetDefinition`, `BartenderVisualDefinition`, `IngredientVisualDefinition`, `EnvironmentVisualDefinition`, `ReactionVisualDefinition`, sequenze/layer e selezione della scena.
- `src/content/publicVisualCatalog.ts`: unico registro dei percorsi pubblici e dei metadati intrinseci. Asset ID → file/format/dimensioni; content ID → asset ID.
- `src/content/visualPlan.ts`: risoluzione, validazione dei riferimenti e piano della scena attiva.
- `src/application/bootstrap.ts`: bartender, ambiente e ingredienti visibili della demo. Cambiarli è una decisione di composizione; non esiste un menu di selezione o una logica di sblocco.

Esempio: content ID `milo` → idle `bartender.milo.idle` → `art/placeholders/milo-idle.svg`. Un nuovo file originale può sostituire quello nel registro, aggiornando formato/dimensioni, senza modificare eventi o scoring. Per nuovi contenuti, aggiungere una definizione keyed dal content ID e associarla alla selezione in bootstrap. Tutti i bartender pubblici devono coprire gli ID di reazione richiesti dalla presentazione, con idle come possibile fallback esplicito. Il validatore segnala riferimenti mancanti, dimensioni/regioni invalide, sequenze vuote e percorsi fuori da `art/`.

Le definizioni visive degli ingredienti sono separate dal contenuto logico: bottle/selectedBottle/icon, colore e overlay opzionale del liquido. La selezione non richiede obbligatoriamente un secondo file: ora usa il bordo della hitbox. L'area di riempimento dello shaker è descritta da `gameplay.liquidWindows` in percentuali **di presentazione**; un'immagine diversa può aggiornare tale regione senza cambiare quantità o fisica. Shaker e bicchiere hanno registrazioni separate nel contratto, così artwork con finestre differenti può aggiornare i metadati di ciascuno senza cambiare la schermata.

L'ambiente ha background, back bar e counterForeground più layer opzionali con profondità background/back/foreground. Cambiare ambiente non modifica MixState o lo scorer. Le decorazioni restano entro i layer della scena, dietro ai controlli: non devono coprire testo o hitbox.

### Convenzioni di naming

ID stabili, minuscoli e puntati: `bartender.<id>.<pose>`, `ingredient.<id>.bottle`, `environment.<id>.<layer>`, `gameplay.<element>`, `ui.<action>`. Gli ID di reazione sono separati, ad esempio `lab.excellent`; non sono nomi di file.

Per artwork futuro: `public/art/bartenders/milo/idle-v1.webp`, `public/art/environments/studio/background-v1.webp`, `public/art/ingredients/orchard/bottle-v1.webp`. Percorsi minuscoli, senza spazi, riferimenti remoti o `..`. La versione appartiene al file/manifest, non al content ID. Gli attuali segnaposto sono riuniti in `public/art/placeholders/`. Archivi sorgente pesanti e file di lavorazione non devono essere pubblicati nella shell PWA.

## Reazioni e animazione indipendenti

Flusso: `ScoreResult.reactionTier → reactionByTier → ReactionId → bartender.reactions[id] → sequenza visiva`. Title/dialoghi restano contenuto. Il mapping attuale è una scelta **demo**: welcome, rough, balanced, excellent. Non afferma quali tier o animazioni usi il riferimento.

Il punteggio e il blocco dopo il servizio sono applicati immediatamente dal reducer. Il player può mostrare prima tasting e poi la reazione, conservando le durate proprie di ciascuna sequenza. Non esiste alcun callback di completamento che modifichi il dominio. Reset/sostituzione del personaggio smontano il player e puliscono i timer; saltare/interrompere l'animazione non influenza la partita. `prefers-reduced-motion` passa alla posa finale ed elimina i transform decorativi.

Attualmente sono implementati image swap, semplici transform CSS ed overlay statici. Nessuna libreria aggiunta. In futuro lo stesso confine di presentazione può ospitare sprite sheet, Web Animations API e particelle, con metadati aggiuntivi nel registro. Non sono già implementati un decoder di sprite sheet, un motore di particelle o un sistema WAAPI. Mai usare frame di animazione, `animationend` o la velocità del rendering come clock/eventi dello scoring.

## Touch, tastiera e accessibilità

Le bottiglie sono pulsanti HTML completi: hitbox rettangolari molto più ampie della sagoma dipinta. Immagini e layer sono `pointer-events: none`. Le azioni principali hanno 62 px minimi di altezza (68 su mobile); extra 46 px (48 su mobile), servizio/reset almeno 48 px. La guida usa un summary da 44 px. In portrait/mobile le bottiglie hanno hitbox da 96/150 px di altezza. Non serve dipingere un bottone grande per ottenere un bersaglio grande.

Pointer capture, rilascio fuori, cancellazione, blur, tastiera Invio/Spazio e reset mantengono gli adapter di fase 0.1. La mixing station è per ora un'anteprima **non interattiva**: il debug mostra il suo ingombro disponibile, non un falso target d'azione. Il focus va alla reazione dopo Servi; il risultato resta testuale e gli asset decorativi hanno alt vuoto. Un eventuale drag/drop futuro dovrà aggiungere un hit target esplicito e un adapter di dominio, senza interrogare pixel/alpha dell'immagine.

## Debug di sviluppo

Avviare `npm run dev`; aprire `http://127.0.0.1:5173/?visualDebug=1` (o la porta locale scelta). Senza query il debug è spento. `import.meta.env.DEV` impedisce la sua comparsa nella build di produzione anche se la query è presente.

Mostra confini delle zone, safe area del bartender, hitbox bottiglie/controlli, area della mixing station, viewport, dimensioni della scena, breakpoint CSS effettivo e DPR. `ResizeObserver` aggiorna i dati. L'overlay ha pointer-events disabilitati e non registra azioni di gioco. Non contiene artwork o strumenti di modifica/persistenza.

## Formati, risoluzioni e prestazioni

Sono raccomandazioni di progetto da confermare mediante prove dell'artwork reale, non misure del riferimento né garanzie sui dispositivi.

| Asset | Rapporto consigliato | Primo export consigliato |
| --- | --- | --- |
| Bartender: pose e overlay allineati | 3:4, alpha | 768×1024; conservare un master più grande fuori dalla distribuzione pubblica |
| Ritratto/icon del bartender | 1:1 | 256×256 |
| Background / back bar | 16:10, decorazione centrale e bordi sacrificabili | 1600×1000; nessun testo/funzione importante nel ritaglio |
| Counter foreground | circa 6.7:1, estendibile | 1600×240; evitare dettagli che debbano coincidere con coordinate dei controlli |
| Bottiglie | circa 1:2, alpha | 256×512; label grafica originale, nome leggibile nella UI |
| Shaker / bicchiere | circa 5:7, alpha | 400×560, canvas/finestre registrate |
| Ghiaccio / guarnizione / icone | 1:1 | 96–128 px per oggetti; SVG per icone semplici |

Preferire SVG per forme/icone semplici; WebP con alpha per personaggi e oggetti illustrati; valutare AVIF su dispositivi target prima di adottarlo per tutte le animazioni. PNG è adatto a master/esportazioni lossless o a casi in cui serve fedeltà dell'alpha, ma misurare il peso finale. Evitare GIF come formato predefinito delle sequenze. `AssetImage` usa dimensioni intrinseche esplicite, decoding async e object-fit; nessun font esterno o download da servizi remoti.

Budget iniziali **proposti**, da rivedere con asset reali: immagini critiche della scena entro circa 1.5 MiB; pacchetto del bartender attivo, reazioni comprese, entro circa 3 MiB. Ridurre risoluzione/frame prima di aggiungere librerie. Misurare consumo di memoria decodificata, frame rate, layout shift e cold start su tablet reali: il peso compresso da solo non basta. Il DPR della prova locale non certifica la qualità su tablet ad alta densità.

### Caricamento della sola scena attiva

`planSceneAssets` raccoglie idle, ambiente, bottiglie visibili e oggetti/comandi critici; differisce ritratto/varianti, tasting, reazioni ed effetti del bartender selezionato. Deduplica gli ID. `primeSceneVisuals` scalda gli asset critici e avvia il resto in idle, con fallback timer. Non precarica altri bartender, ambienti o ingredienti nascosti; non decide quali siano sbloccati.

Questa è una strategia client minima, non una pipeline complessa. Le future immagini pesanti di contenuti non attivi dovranno essere caricate su richiesta. **La PWA attuale precachea ancora tutti i file pubblici della build**, cioè la shell e i piccoli segnaposto attuali. Prima di distribuire interi cataloghi di artwork, sostituire quella policy con shell minima + asset pubblici della scena attiva e una runtime cache controllata. Il planner client non rende selettiva da solo la precache. Contenuti protetti non devono entrare nel registro pubblico o nella cache.

## Lista esatta per il primo bartender giocabile

Il pacchetto visivo attuale di Milo richiede sei asset del personaggio e un overlay associato alla reazione excellent:

1. `bartender.milo.idle` — posa neutra con canvas registrato.
2. `bartender.milo.tasting` — posa/sequence di assaggio decorativa.
3. `bartender.milo.rough` — reazione semplice al mix da sperimentare.
4. `bartender.milo.balanced` — reazione semplice al mix equilibrato.
5. `bartender.milo.excellent` — reazione semplice al mix riuscito.
6. `bartender.milo.portrait` — ritratto quadrato.
7. `gameplay.sparkles` — overlay registrato, usato dal mapping demo excellent.

Welcome riusa idle. Una singola immagine per posa è sufficiente per il primo playable; numero di frame e durata di eventuali sequenze sono ancora da decidere. Nessun accessorio è richiesto. Sparkles può diventare opzionale rimuovendo il riferimento dal mapping; non è una necessità meccanica.

Per la scena completa servono anche: 3 layer dell'ambiente (background, back bar, counter), 3 bottiglie, 4 oggetti gameplay (shaker, bicchiere, ghiaccio, guarnizione) e 4 icone comandi (pour, shake, serve, reset). Le icone ingredienti riusano le bottiglie; nessuna selected-bottle dedicata è richiesta. Totale attuale: **21 SVG pubblici**.

## Assunzioni da risolvere prima dell'artwork finale

- Direzione artistica, silhouette, costume, espressioni e rapporto di presenza del bartender rispetto al banco. Milo resta un segnaposto, non un personaggio finale approvato.
- Inquadratura del personaggio (mezzo busto/corpo), baseline e canvas comuni delle pose; quanto possono estendersi braccia/accessori prima del ritaglio.
- Ritaglio accettabile degli ambienti in portrait/narrow. Eventuali fondali dedicati richiederanno varianti responsive nel registro visivo, non modifiche al dominio.
- Forme di shaker/bicchiere e finestre del liquido: il segnaposto usa rettangoli di riempimento; artwork differente può richiedere maschere alpha o altri overlay oltre alle registrazioni separate già disponibili.
- Durata, frame count, loop e tono delle reazioni; i quattro tier attuali sono esclusivamente demo. Non vincolare il pacchetto alle animazioni del riferimento.
- Dispositivi/DPR/browser effettivi, budget di memoria e caricamento, alpha/codec; validazione su hardware reale prima di fissare gli export.
- Politica di consegna/cache dei futuri cataloghi grandi. La precache completa dei piccoli placeholder non è il modello definitivo.

Nessun sistema XP, currency, unlocking, shop, account, vault o backend introdotto. Nessun valore di compatibilità nuovo. Nessun commit o push.