# Fase 2E — geometria classica esatta

Completata il 14 ottobre 2026. Solo geometria e presentazione: nessuna ricerca sul riferimento, nuova grafica o modifica alle regole.

## Workflow e conservazione

- Ramo **main**. All’ispezione iniziale la 2D non era ancora committata: HEAD era0b1acde, con le Changes2D. L’utente ha autorizzato esplicitamente «fai tu il commit solo questa volta». Prima di iniziare le modifiche2E è stato creato il solo commit locale **6912944**, contenente i10 file della 2D. Nessun push. Questa eccezione è consumata.
- Tutte le modifiche **2E restano non committate su main**; nessun nuovo ramo/worktree, nessun accesso GitHub, remotes/history non modificati. Nessun commit2E.
- Hash di **805 file preesistenti** non interessati dalla presentazione verificati contro lo snapshot prima2E. Stato, dispatcher, callback ed effetti di App identici; domain/application/platform/content, scoring/tuning, profilo/ownership/save/reward, timing/input/reduced-motion e artwork non modificati. `styles.css` aveva già uno stato Git M senza diff testuale prima2E ed è stato preservato.

## Canvas e scala

Canvas canonico **600×440**, coordinate logiche dall’angolo alto sinistro. `classicStageLayout.ts` centralizza dimensioni, box, slot, anchor, layer e conversione nei CSS custom properties. Le coordinate annidate sono derivate dai box globali: nessun calcolo di gameplay dipende dal CSS.

`scale=min(frameWidth/600,frameHeight/440)`. Il frame sottrae margini12px/safe-area; il sizer occupa600s×440s, il canvas mantiene600×440 con `transform:scale(s)` uniforme e origine0,0. Frame centrato, senza scale diverse sugli assi. ResizeObserver legge soltanto il frame, più resize del viewport; niente polling o letture DOM per tick. Variabili memoizzate per scala.

Geometria fissa quando viewport **≥960×480 e landscape**; portrait, narrow e finestre molto basse usano il flusso separato. Il breakpoint di altezza evita che il ridimensionamento di una finestra corta crei target che si sovrappongono. A1280×800 e1024×768 nessun elemento principale si riordina.

## Coordinate effettive

Box: x,y,larghezza,altezza, tutti in unità logiche. Le misure nel DOM normalizzate per la scala coincidono nei due landscape.

| Elemento | Box canonico | Anchor/note |
|---|---|---|
| Sfondo | 0,0,600,440 | cover, center center |
| HUD | 8,6,584,30 | Livello14..70, XP74..220, monete226..300 |
| Collezione, faccia | 522,7,65,26 | target reale ampliato se necessario |
| Mensola | 18,54,380,188 | nessuna card |
| Bottiglia1 | 38,80,64,128 | centroX70, fondo208 |
| Bottiglia2 | 123,80,64,128 | centroX155, fondo208 |
| Bottiglia3 | 208,80,64,128 | centroX240, fondo208 |
| Slot4 riservato | 293,80,64,128 | centroX325, passo85 |
| Target/selezione bottiglie | centroX−36,73,72,142 | indipendente dall’alpha PNG |
| Bartender | 390,46,202,300 | centroX491, baseline346 |
| Banco fisico | 0,286,600,154 | bleed solo decorativo |
| Canvas PNG banco | 0,260,600,200 | rapporto3:1 originale |
| Preparazione | 230,215,125,142 | centro oggetto shaker285,280 |
| Shaker | 250,224,70,112 | contain |
| Bicchiere dopo Serve | 318,262,40,70 | contain, stessa logica2B |
| Meter | 220,238,20,90 | track ruotato: fill dal basso |
| Quantità | 208,330,54,18 | es.12/240, nessun ml |
| Ghiaccio | 350,270,48,48 | conteggio0/1/2 sul badge |
| Agrume | 406,270,46,48 | disponibilità/✓ esistenti |
| Versa | 22,389,106,42 | centro75,410; anchor richiesto75,413 interno al box |
| Agita | 154,389,106,42 | centro207,410; anchor207,413 |
| Servi | 288,389,106,42 | centro341,410; anchor341,413 |
| Reset/Nuovo drink | 405,403,66,27 | stessa area, senza spostare i tre CTA |
| Salta risultato | 478,403,106,27 | target ampliato come gli altri |
| Messaggio/risultato | 402,342,190,90 | immutabile in tutte le fasi |

Il prompt fornisce centriY413 e boxY389/H42, che hanno centro410. Sono conservati i box indicati e gli anchor413, distanti3px e sempre interni ai controlli. Analogamente il box bartender termina a346, due unità prima della baseline approssimata348. Nessuno spostamento per stato o viewport.

Le immagini conservano proporzioni e canvas originali. Il contain nel box202×300 dà un canvas immagine alto circa269 unità per gli attuali PNG3:4, prima dei margini trasparenti: non si forza la stima275–300 deformando o tagliando testa/mani. Idle/tasting/reazione condividono il medesimo safe-area e baseline. Il banco copre la parte inferiore come superficie fisica.

Le prime tre bottiglie usano i primi tre slot. Da una quinta voce la struttura presenta pagine di4 slot dentro la stessa mensola, con scroll/snap orizzontale e focus nativo; nessuna griglia libera in landscape. Nessun nuovo ingrediente introdotto.

## Interazione, pannello e layer

Grafica e interazione sono separate **sullo stesso button reale**, senza copie di listener, bottoni invisibili duplicati o target derivati dall’alpha. `interactionBounds` amplia i box a minimo44CSSpx dopo la scala, arrotonda in eccesso al quarto di unità logica contro la quantizzazione e li mantiene nell’area sicura8..592 /6..432. La faccia è uno pseudo-elemento alle coordinate originali, il testo resta sul button. I target sono misurabili e continuano a usare gli stessi HoldButton/ref/focus/pointer handler.

Reset e Nuovo drink condividono il dock nel pannello. La regione messaggi ha uno scroll interno focusabile, separato dal dock, azzerato solo al cambio di contesto/fase del risultato per mantenere visibili guida e score dopo la lettura delle note, così titoli lunghi, breakdown, XP/monete, livello e sblocchi non espandono90px né nascondono l’azione successiva. I dettagli possono richiedere scroll anche nel giro normale: è il compromesso deliberato del pannello richiesto. Le istruzioni guidano il giro, gli avvisi rischiosi hanno priorità sulla riga titolo. Serve congela immediatamente lo score; la sequenza2B resta tasting → score → reazione → breakdown/reward, con Skip e movimento ridotto invariati. Score/reazione/premi restano nel pannello, nessuna nuova card o badge persistente. Non aggiunti timer di level-up.

Layer centrali: ambiente0, decorazioni back-bar10, bottiglie20, bartender30, banco40, oggetti50, comandi60, HUD/pannello70, effetti80 nei rispettivi contesti, modale90, DEV100. I wrapper del layer comandi/oggetti non intercettano input; soltanto i loro button lo fanno. Il dialogo Collection resta fuori dal canvas trasformato, nel top layer nativo del browser: non scala i target, non modifica la scena, dimma lo sfondo e ripristina il focus. Gli effetti decorativi restano nel contesto del relativo personaggio/oggetto.

Il fondale esistente contiene un banco dipinto. Il suo foreground viene mascherato dal limiteY286; il banco selezionato mantiene il PNG3:1, posizionato aY260 per compensare i margini alpha e iniziare fisicamente intorno a286. Nessun PNG editato; resta visibile il piano del back bar sul fondo, come parte dell’ambiente, non un secondo banco anteriore.

## Validazione

- **253/253 test**, di cui245 preesistenti e8 nuovi: regioni/anchor, ordine/gap CTA, fit/aspect, target dopo scala e safe bounds, facce indipendenti dai target, slot/pagine, trasformazioni relative, breakpoint/valori invalidi.
- TypeScript strict, lint, build, audit isolamento produzione e Git diff check superati. Il guard della produzione ora rifiuta anche i marker della griglia DEV. Nessuna nuova dipendenza o artwork. BundleJS303,44kB (94,60gzip); CSS53,59kB (11,80gzip).
- **1280×800:** canvas renderizzato1058,18×776, scala1,763636; pagina1280×800, nessuno scroll. Target minimo45,85CSSpx.
- **1024×768:** canvas1000×733,33, scala1,666667; pagina1024×768, nessuno scroll. Target minimo44,17CSSpx. Tutte le regioni normalizzate, incluse facce CTA/Collection, coincidono esattamente entro0,01px con1280.
- **768×1024:** HUD → bottiglie/bartender affiancati → preparazione → tre comandi → ghiaccio/agrume → messaggio; flusso non trasformato, scroll verticale, nessun overflow orizzontale, target≥44px.
- **390×844 e320×640:** flusso a una colonna, stesso ordine semantico, target≥48px, HUD con fondo chiaro leggibile. Scroll verticale consentito, nessun overflow orizzontale. Non è stato eseguito un test su tablet fisico.
- Giro completo: frutteto240, Ice2, un hold Shake7s con avviso, agrume →9550, +115XP/+43monete, livello2 XP15, Bartender02. Guida, assaggio, risultato e reazione mantengono identico box del pannello e del bartender; bicchiere esattamente318,262,40,70.
- Collection aperta: canvas stesso bounding box; focus iniziale sul titolo, equipBartender02 sposta focus sulla voce, Escape restituisce focus aCollezione; reload mantiene equip e15XP/43monete.
- Produzione con tutte le queryDEV: nessun laboratorio/griglia, nessuna immagine mancante. Failure Shake oltre soglia →0, +5XP/+2monete; Nuovo drink azzera il mix e riporta focus aVersa, senza spostare il layout.
- **Offline:** shell scaldata su localhost4203, server poi spento. Reload e giro12u →422, +24XP/+6monete; nuovo reload conserva29XP/8monete senza premi duplicati. Shell7 file,42 percorsi artwork on-demand,zero artwork in precache; policy e preload invariati.
- Reduced motion via anteprima DEV: animation none/transition0s; timing/skip sono coperti dai test preesistenti, nessun nuovo movimento. Hold pointer e Space provati; interrupt/cancel/ownership sono preservati byte per byte e coperti dalla suite.
- Scroll delle note da tastiera verificato: al passaggio aShake/ready lo scroll torna da30,4 a0; Serve eInvio sul pulsante Skip mostrano immediatamente422/breakdown, scroll0 e box immutato. Ultima shell verificata anche su origine4204 dopo il ritocco di presentazione.
- Visual Debug: checkbox opzionale «Griglia classica600×440», viewBox0 0 600 440, passo50,17 rettangoli con regioni/slot/CTA/target, anchor e baseline; SVGpointer-events:none. Codice e marker esclusi dalla build finale.

## Limiti e consegna

Non è una copia grafica o una promessa1:1. Il framing del banco segue l’attuale c01 in rapporto3:1; futuri banchi con canvas diversi richiederanno metadati di framing, senza cambiare la geometria logica. Artwork tiki, set di tre ingredienti e PNG con alpha rimangono quelli originali del progetto. Pannello volutamente piccolo con dettagli scorrevoli; posture dinamiche conservano i movimenti2B nel medesimo anchor. Niente supporto multitouch fisico o screen reader reale dichiarato. Le limitazioni di storage/multi-tab rimangono quelle2C.

Passo successivo consigliato: breve playtest su tablet reale per densità, messaggi scorrevoli e touch. Shop, acquisti, valuta spendibile, account/backend/vault, nuova grafica/audio e ricerca storica restano fuori ambito.

Screenshot finale: `work/phase2e-stage.jpg`, locale e ignorato da Git. Solo server e schede di test creati per questa fase vengono chiusi e il viewport ripristinato; la scheda dell’utente5173 non viene toccata. Tutte le Changes2E sono lasciate all’utente per Commit/Push in GitHub Desktop.
