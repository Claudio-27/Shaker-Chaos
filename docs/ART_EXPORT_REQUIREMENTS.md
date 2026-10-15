# Art export requirements — stage Shaker-Chaos

Queste sono specifiche per export FUTURI dell’artwork originale. La fase 2G non genera, ridisegna o ripulisce artisticamente immagini. Il nuovo artwork dovrà adattarsi alla scena approvata; non si spostano regioni o comandi per adattare l’artwork.

## Convenzioni e template canonico

Coordinate logiche: origine in alto a sinistra, x verso destra, y verso il basso, stage **600×440**. Le dimensioni sono del gioco, non pixel del master. Mantenere RGB sRGB, alpha non premoltiplicato nel PNG consegnato, nessun matte bianco/nero, nessuna ombra tagliata. Consegnare master/livelli separati e PNG di export senza metadati personali; il runtime viene derivato dalla pipeline.

| Regione / ancoraggio | Coordinate logiche bloccate |
|---|---|
| Bartender safe box | x390,y46,w202,h300 |
| Sagoma bartender approvata | altezza292, sommità56, centrox495, baseline348 |
| Mensola / bottiglie | x18,y54,w380,h188 |
| Centri bottiglie attive | x70,155,240; quarto slot325; baseline208 |
| Regione banco | x0,y286,w600,h154 |
| Top fisico del banco | y292, da x0 a x600 |
| Mixing | x230,y215,w125,h142 |
| Shaker visibile | centro283,278; altezza108 |
| Calice visibile | centrox338; baseline332; altezza62 |
| Gauge riservato | x220,y238,w20,h90 |
| Ice / Garnish | 350,270,48,48 / 406,270,46,48 |
| Messaggi riservati | x402,y342,w190,h90 |
| HUD riservato | x8,y6,w584,h30 |
| Versa / Agita / Servi | 22,389,106,42 / 154,389,106,42 / 288,389,106,42 |

Il bartender passa DIETRO il banco: la baseline della sagoma non è la linea del piano del tavolo. Il pannello e i comandi rimangono davanti alla scena. Non dipingerli nei raster.

## environment.e01.background-clean

Master raccomandato **3200×2000 (16:10)**; minimo di composizione **1600×1000**. Un master opzionale **4000×2500** offre più margine per lo sfondo cover nel flow portrait ad alta densità. La raccomandazione 3200×2000 deriva dai 1080 CSS px massimi di stage landscape modellati ×DPR2, più crop laterale; non è un invito a spedire il master al browser.

Conservare ambiente tiki, direzione artistica, colori, luce calda, parete, mensole con bottiglie decorative e arredo. Richiesti **nessun banco in primo piano**, nessun piano di preparazione posteriore che formi una seconda linea orizzontale, nessun bartender, UI, shaker/calici già dipinti nella zona di preparazione. Bottiglie decorative di fondo sono consentite e non devono sembrare nuove opzioni interattive. Nessuna copia di elementi del gioco di riferimento.

Template di composizione sul master3200×2000: lo sfondo è dipinto a **800×500** logici, centrato a **x−100,y0**. Il rettangolo canonico600×440 corrisponde a **x400,y0,w2400,h1760** sul master. Nel landscape attuale viene esposta solo la parte **x400,y0,w2400,h1168**, fino al top fisico y292. Le fasce laterali x0…400 e x2800…3200 sono sacrificabili; evitare lì dettagli essenziali. Il resto inferiore serve ai crop responsive e può essere coperto dal banco.

| Overlay sul master3200×2000 | x,y,w,h in pixel master |
|---|---|
| Bartender safe box | 1960,184,808,1200 |
| Shelf safe box | 472,216,1520,752 |
| Mixing | 1320,860,500,568 |
| Messaggi riservati | 2008,1368,760,360 |
| HUD riservato | 432,24,2336,120 |
| Top banco | y1168 |

Per master1600×1000 dividere questi valori per2; per4000×2500 moltiplicarli per1,25. Queste sono guide, da consegnare anche come livello separato non esportato nell’immagine. Il background attuale è1586×992, quasi16:10: la lieve differenza di rapporto non autorizza a cambiare lo stage; il fitting deve usare i metadati di presentazione.

Il background-clean è la soluzione duratura alla doppia lettura del banco. Non si ricostruisce automaticamente con clone, inpainting o cancellazione di oggetti.

## counter.c01.surface

Master consigliato **2400×640**, alpha aderente con almeno12px di sicurezza. La sagoma attuale ha rapporto **2154:549**: mantenerlo senza stirare il legno o le prospettive. Su quel master la sagoma può occupare circa2376×605,6, lasciando padding e un punto del bordo superiore registrato.

Ancora logica: sagoma da x0 a600, top y292; altezza approvata circa152,92. Nessun bartender/oggetto/UI nel layer. Conservare venature, bordi, curva del piano e ombre; un’ombra separata è preferibile se dovrà sovrapporsi ad altri livelli.

Runtime attuale: alpha largo1088px per1x;2x fino alla risoluzione disponibile del master. Un nuovo master2400px permette il budget2160px del landscape modellato senza upsampling. La pipeline ricalcola dimensioni/hash, non le coordinate del gioco.

## Bottiglie bottle01 / bottle02 / bottle03

PNG alpha aderenti, colore/design/etichette invariati, padding di sicurezza16px sui master consigliati. **Baseline comune: fondo della sagoma a16px dal fondo canvas**; ancora orizzontale al centro del canvas. Niente grandi margini laterali. Le larghezze fisiche DIFFERISCONO e non vanno normalizzate.

| Asset | Sagoma logica approvata | Esempio master aderente | Sagoma master indicativa |
|---|---|---|---|
| bottle01 / Bollicine |33,37×118|300×976|circa267×944|
| bottle02 / Agrumi |47,80×111|416×920|circa382×888|
| bottle03 / Frutteto |46,99×118|408×976|circa376×944|

Le cifre master includono arrotondamento a pixel interi: non allargare il disegno per riempire un rettangolo. Conservare capsula, collo e contorno; non aggiungere sharpening o glow permanente. La selezione è un effetto UI. Registrare baseline e bounding box nel sidecar, con estremi destro/inferiore esclusivi.

La pipeline corrente deriva sagome alte224/448px per1x/2x e conserva l’ancora y208. Futuri export dovranno rispettare la stessa posizione apparente.

## Shaker

Master suggerito **448×896**, alpha, sagoma circa401×864 con16px di sicurezza. Centrox224 e baseliney880 nel master; rapporto del disegno **683:1471**. Posizione del gioco invariata: centro283,278, altezza108.

Chrome, riflessi e bordo devono essere intatti. Per una futura composizione a livelli: **shaker-body/back** e **shaker-front/reflections/rim**, stesso canvas448×896, stessa ancora, nessun rescale indipendente. Un corpo chiuso può continuare a usare solo il gauge esterno.

Non consegnare una finta finestra del liquido ricavata dai riflessi. Nessuna maschera viene inventata in2G.

## Glass

Master suggerito **736×1024**, alpha, sagoma circa687×992, padding16. Centrox368 e baseliney1008; rapporto del disegno **936:1351**. Nel gioco: altezza62, baseline332, centrox338.

Per un futuro liquido interno servono export separati e registrati sullo stesso canvas736×1024:

- **glass-back**: parte dietro al liquido;
- **liquid-mask**: alpha della sola coppa interna realmente riempibile, esclusi bordo, stelo e base;
- **glass-front/reflections**: bordo e riflessi che passano davanti.

Specificare limiti di riempimento e superficie della bevanda come metadati, mantenendo separati quantità canonica e grafica. Non fabbricare la maschera analizzando colori o trasparenze del PNG attuale. Il gauge esterno rimane autorevole fino a una fase futura esplicitamente approvata.

## Bartender pose exports

Per ciascuno di b01 e b02: idle, tasting, rough, balanced, excellent, con **canvas comune896×1200**, pivot comune **448,1184**, scala anatomica coerente. Target della sagoma: altezza1168, sommità16, baseline1184. A scala0,25 questo corrisponde esattamente ai292 logici, y56…348 della scena approvata.

Capelli e mani dentro la safe frame, preferibilmente x28…868, y16…1184; niente arti tagliati. Mantenere le dimensioni della testa e del torso fra pose, registrando il pivot del corpo; non ridimensionare ogni gesto per riempire il canvas. L’eventuale differenza intenzionale del gesto va descritta nei metadati. Stesso ingombro apparente fra b01 e b02, senza cambiare volti/costumi/colori.

La baseline è della sagoma completa; il banco la occlude parzialmente. Evitare ombre/sparkles inglobati nei PNG del personaggio. Consegna delle pose a livelli originali utile per futuri export coerenti.

Portrait separati: master **512×512** alpha, inquadratura coerente con i ritratti approvati; runtimeUI128/256. Non riutilizzare un’immagine1254×1254 per una card alta90CSSpx. Non ritoccare i volti per questa ottimizzazione.

## Effetti e consegna

Sparkles/ice-blue separati, alpha e pivot esplicito relativo al canvas del bartender. Nessun nuovo effetto permanente sul personaggio. Il loro contenuto rimane indipendente da gameplay, punteggio e ricompense.

Ogni consegna comprende ID canonico, dimensioni, alpha bounds, pivot/baseline, spazio colore, elenco livelli e hash. Master fuori dal web root; derivati e manifest generati dalla pipeline. Nessuno SVG semplice di comando va rasterizzato. Qualsiasi compressione lossy richiede una futura approvazione visiva esplicita.
