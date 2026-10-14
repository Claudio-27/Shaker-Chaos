# Fase 2F — Classic visual fidelity calibration

## Ambito e checkpoint

Lavoro locale su **main**. Prima delle modifiche 2F è stato creato il commit locale **bd4ed5e**, «Fix canonical classic stage geometry for Phase 2E», su autorizzazione esplicita dell’utente. Il commit precedente 2D resta 6912944. Le modifiche 2F restano **non committate** per la revisione. Nessun ramo creato, push, PR, accesso a GitHub, servizio esterno, modifica ai remoti o riscrittura della storia. La modifica preesistente senza diff testuale di src/ui/styles.css è preservata.

Ricerca sul riferimento chiusa: nessun Ruffle/SWF, bytecode, estrazione asset, nuovo esperimento o ricerca web. Nessuna nuova meccanica, shop, acquisto, account, backend o vault. Sono stati usati soltanto gli artwork originali già nel repository.

## Geometria 2E preservata

classicStageLayout.ts è identico al checkpoint: stage **600×440**, regione bartender **390,46,202,300**, shelf **18,54,380,188**, counter **0,286,600,154**, mixing **230,215,125,142**, messaggi **402,342,190,90**, HUD **8,6,584,30**.

| Controllo | Faccia logica invariata |
|---|---|
| Versa | 22,389,106,42 |
| Agita | 154,389,106,42 |
| Servi | 288,389,106,42 |

Non è stata usata l’eccezione di spostamento degli ancoraggi ±8. Cambiano solo le sagome degli artwork all’interno/intorno alle regioni, con sovrapposizione intenzionale del banco sul busto e sulle gambe del bartender. Le hitbox restano indipendenti e conservano il calcolo 2E, compresa l’espansione minima quando la scala diminuisce.

## Crop e scala degli artwork

**classicVisualFraming.ts** contiene 16 misure di canvas e bounding box alpha ≥8/255, con estremi destro/inferiore esclusivi. Sono dati di presentazione tipizzati e immutabili: nessun pixel viene modificato, ritagliato su disco, ricompresso o convertito.

visualPlacement calcola una scala uniforme e la posizione del canvas originale a partire dalla sagoma visibile. AssetImage applica le variabili CSS al **vero asset risolto**, anche dopo un fallback offline. Asset sconosciuti/SVG legacy mantengono contain normale. Per le bottiglie il calcolo conserva esplicitamente l’origine --bottle-art-x/y del contenitore 2E; il browser ha verificato il contatto effettivo con la mensola. In portrait/mobile queste compensazioni canoniche non si applicano e rimane il fitting precedente.

Crop/scale non compaiono negli eventi, nel MixState, nel CompatibilityInput, nello scoring o nei premi.

## Bartender 01 e 02

Sagoma alpha completa a riposo: **altezza 292**, sommità **y56**, centro orizzontale **x495**, baseline **y348** per tutte le pose. Il banco occlude la parte inferiore, quindi la porzione esposta è volutamente più corta della sagoma completa. Nessuna variazione 20% tra i due personaggi; le differenti larghezze delle braccia sono proprie delle pose.

| Bartender | Posa | Sagoma logica w×h | Angolo alto sinistro | Ancora x/baseline | Scala PNG→logico |
|---|---|---|---|---|---|
| b01 | idle | 196.53 × 292 | 396.73, 56 | 495, 348 | 0.20709 |
| b01 | tasting | 174.26 × 292 | 407.87, 56 | 495, 348 | 0.20334 |
| b01 | rough | 176.83 × 292 | 406.59, 56 | 495, 348 | 0.20348 |
| b01 | balanced | 188.81 × 292 | 400.6, 56 | 495, 348 | 0.20680 |
| b01 | excellent | 210.1 × 292 | 389.95, 56 | 495, 348 | 0.20578 |
| b02 | idle | 199.89 × 292 | 395.06, 56 | 495, 348 | 0.20334 |
| b02 | tasting | 167.61 × 292 | 411.19, 56 | 495, 348 | 0.20292 |
| b02 | rough | 183.18 × 292 | 403.41, 56 | 495, 348 | 0.20264 |
| b02 | balanced | 155 × 292 | 417.5, 56 | 495, 348 | 0.20236 |
| b02 | excellent | 192.23 × 292 | 398.88, 56 | 495, 348 | 0.20278 |

Varianza prevista fra baseline e altezze: **0 unità logiche**. Le misure DOM includono arrotondamenti CSS subpixel, non un ulteriore fitting. Le animazioni temporanee della reazione possono spostare la figura durante il loro ingresso; l’ancora a riposo non cambia. Non si è modificato il movimento ridotto.

## Bottiglie, mensola e densità

| Bottiglia | Centro x | Sagoma a riposo | Baseline |
|---|---|---|---|
| Frutteto | 70 | 46.99 × 118 | 208 |
| Agrumi | 155 | 47.8 × 111 | 208 |
| Bollicine | 240 | 33.37 × 118 | 208 |

Passo **85** come nella 2E; il quarto slot futuro rimane a x325 e la paginazione dopo quattro è invariata. La mensola CSS va da x18 a x384, con sommità y208, profondità 6, bordo caldo, fascia scura e piccola ombra di contatto. Le etichette rimangono compatte sotto la mensola.

La selezione solleva solo il PNG di **3** unità e lo ingrandisce di **1,025**, con alone discreto; nessuna cornice/card e nessun movimento delle bottiglie vicine. Gli indicatori vuoti delle bottiglie non selezionate sono nascosti. I pulsanti, aria-pressed, focus e quantità accessibili restano invariati.

Audit densità/silhouette: grande figura a destra, ritmo delle tre bottiglie a sinistra, mensola continua, shaker leggibile al centro basso, forte piano orizzontale, tre blocchi di comando sul fondo e finestra di messaggio stabile. Il vuoto centrale appartiene all’illustrazione dell’arco; non è stato riempito con pannelli o nuovi controlli. Il risultato conserva una scena unica.

## Sfondo e piano del banco

Sfondo e01 a scala uniforme: canvas **799,40×500**, x **−99,70**, y0. La finestra termina a **y292**, corrispondente a circa y579,33 del PNG. Il piano posteriore dipinto inizia intorno a y580 del sorgente, mentre il banco in primo piano è ancora più basso: entrambi rimangono fuori dalla finestra esposta. Scompare così la lettura di due banconi sovrapposti.

c01 mantiene la regione 0,286,600,154 ma la **sagoma** copre x0…600 e inizia a **y292**, con altezza **152,92**. Il canvas originale è reso a circa **605,01×201,67**, senza stiramento. Gli ultimi 4,92 logici del basamento sono tagliati dal bordo inferiore dello stage, scelta intenzionale. Le estremità curve del piano rimangono proprie dell’artwork. Un lieve bordo scuro unisce sfondo e primo piano senza dipingere sopra il PNG.

Compromesso: il ritaglio più stretto sacrifica parte delle lampade e delle decorazioni laterali; il riferimento fisico unico del banco migliora, ma lo sfondo resta un’immagine con utensili e bottiglie dipinti non interattivi. Non sono stati aggiunti workaround multipli o ricostruiti dettagli del riferimento.

## Shaker, calice e oggetti del banco

| Oggetto | Sagoma globale x,y,w×h |
|---|---|
| Shaker | 257.93, 224, 50.15 × 108 |
| Calice servito | 316.52, 270, 42.95 × 62 |

Lo shaker è centrato a **283,278**, alto **108**; il calice resta secondario, alto **62**. Aspetto originale conservato, con ombra corta di contatto e perno di agitazione vicino alla base. Non ci sono card intorno agli oggetti.

Gauge esterno invariato **220,238,20,90**, con cornice metallica/scura, tacche regolari e riempimento dal basso. Il valore resta quello canonico intero in **u**; nessuna conversione inventata in ml, liquido fittizio o maschera rettangolare sopra il PNG.

Ice e Garnish mantengono le regioni **350,270,48,48** e **406,270,46,48**, e tutti gli stessi handler. Icone circa 38×35, etichette piccole, ombra sul banco e badge 0/2…2/2 o +/✓. Rimosse le grandi placche circolari; un uso disponibile deprime solo l’oggetto di 2 unità. Gli stati disabilitato/speso sono attenuati; guarnizione disponibile solo dopo Shake, aggiunta accettata una volta. Semantica, focus e feedback del ghiaccio massimo conservati.

## Controlli, pannello e progressi

Versa/Agita/Servi: stessa faccia **106×42**, stessi bordi scuri/bevel, gradiente leggero, raggio **5**, etichette bold **16** nello stesso font. Palette differenziata ma famiglia comune. La pressione abbassa soltanto faccia e contenuto di **2**; l’elemento interattivo non si muove. Reset/Nuovo drink e salto assaggio restano nelle aree secondarie 2E.

Pannello **190×90** fisso, raggio **5**, bordo compatto e padding orizzontale **8**, superiore **7**. Durante il gioco: titolo breve, istruzione e feedback; l’avviso di rischio prende priorità. Nel risultato: titolo della reazione, punteggio **20** sulla riga successiva, poi battuta/dettagli/premio nello stesso scorrimento. Il punteggio è formattato **9.550 / 10.000** solo nel nodo di testo; il valore canonico resta 9550. Titolo e punteggio entrano interamente anche nella vista 1:1. Durante la rivelazione lo scroll del risultato è bloccato; dopo breakdown permette di leggere tutti i dettagli. Il reset dello scroll su cambio fase/rischio/risultato e il focus 2E sono conservati.

XP/monete del giro sono una riga compatta nei dettagli, senza card aggiuntive. Livello/sblocco ha inoltre un duplicato **decorativo** sopra il pannello, **120×28**, visibile per 5 secondi, senza coprire il volto; il testo accessibile durevole rimane nei dettagli. Con reduced motion il duplicato temporaneo è nascosto e i dettagli restano disponibili.

HUD: regione **584×30** invariata, pittura semitrasparente alta **26**, nessuna grande placca chiara. Livello/XP/monete restano leggibili e secondari; XP bar **124×7**. Collezione ha faccia **65×26**, famiglia visiva secondaria e hitbox espansa secondo 2E. Il dialogo rimane fuori dallo stage trasformato, senza competere durante il giro.

Profondità: sfondo → mensola/bottiglie → bartender → banco → mixing/extra → comandi → HUD/risultato → effetti → modale. Gli z-index 2E sono preservati; nuove ombre sono locali, corte, coerenti con la luce del bancone. Effetti excellent/ice-blue restano condizionali al loadout e allo stato previsto, mai permanenti in idle.

## Strumenti DEV

- **?classicExact=1**: quando lo spazio landscape è sufficiente, stage realmente **600 CSS px ×440 CSS px**, scala1. Produzione ignora il parametro.
- **?classicPose=b01.idle**: anteprima solo visiva di b01/b02 con idle/tasting/rough/balanced/excellent. Cambia solo l’art mostrata, mai storia, risultato, profilo o ricompense. Non è un selettore pubblico di contenuti bloccati.
- Visual Debug: griglia50, regioni, facce/hitbox, sagome opache verdi, baseline/ancore, dimensioni sorgente, canvas reso, dimensioni visibili e fattore di scala. Nessun polling in produzione.
- Nuovi marker DEV aggiunti all’audit della produzione. Anche passando i parametri alla build, il bartender iniziale resta b01, la scala è normale e griglia/pose freeze/lab sono assenti.

## Verifiche

**267/267 test**, tutti i 253 precedenti conservati; TypeScript strict, lint, build, audit isolamento/PWA: PASS. Quattordici nuovi test mirati a misure, parità delle pose, mensola/origini CSS, banco/vasi, crop dello sfondo/fallback, confine architetturale, quattro cronologie golden, rendering/accessibilità reali, formato del punteggio e limiti del HUD. I server SSR dei test possono scrivere un avviso sulla porta HMR 24678 contesa in esecuzione parallela; non falliscono test e non riguardano il gioco distribuito.

Quattro fixture deterministiche conservano gli hash SHA-256 di **storia canonica → intero RoundResult → ricompensa** della 2E: rough211, volume intermedio4725, excellent9550 ed esplosione0. Questi valori sono regressioni del tuning originale già presente, non nuovi valori del gioco di riferimento. Il caso4725 non equivale alla posa balanced: questa è stata verificata anche con un giro reale8450.

Controllo dei file: **5313 file protetti identici byte per byte**, inclusi dominio/applicazione/piattaforma/contenuti/artwork/evidenze storiche, package e geometria2E. I due file UI esclusi dal confronto integrale hanno solo cambi di presentazione; il corpo App con stato, callback, effetti e dispatch è identico.

| Vista | Esito |
|---|---|
| DEV1:1 | Stage600×440, tutti i dieci artwork ispezionati; risultato completo e oggetti leggibili |
| 1280×800 | Stage1058,18×776; scala1,763636; coordinate interne invariate |
| 1024×768 | Stage1000×733,33; scala1,666667; coordinate interne identiche |
| 768×1024 | Flow portrait, nessuna trasformazione o overflow orizzontale; target≥44CSS |
| 390×844 | Flow mobile, nessun overflow; target≥48CSS |
| 320×640 | Flow mobile e scorrimento verticale leggibile; target≥48CSS |

Controllati: idle e selezione; startup di Versa; riempimento parziale30 e pieno240; Ice2; Shake sicuro e rischio/danger; guarnizione pronta/accettata; assaggio con focus sul salto; risultato basso528/posa rough; intermedio4725 e balanced8450; excellent9550; esplosione0; livello/sblocco; Collection aperta. Le dieci pose b01/b02 sono state ispezionate anche con l’anteprima visiva, senza simulare nuovi input di riferimento.

Giri reali:9550 → +115XP/+43monete;8450 → +104XP/+38monete, livello2 e b02; fallimento0 → +5XP/+2monete. Tastiera Spazio per Versa/Agita e Invio per saltare l’assaggio; nuovo drink pulisce scena/focus; Collection equipaggia b02, Escape chiude e reload conserva scelta/XP/monete senza duplicazione. Reduced motion DEV: flag attivo e animazioni character/shaker none; copertura automatica delle tempistiche preservata. Nessuna nuova emulazione del sistema operativo.

Offline finale: build su localhost4207, ACK «Pronto anche offline», poi server realmente spento. Reload riuscito con 0 immagini mancanti e 0 errori; drink da12u completato e servito offline →422 punti, +24XP/+6monete. Un secondo reload conserva24XP/6monete senza duplicazione. Una posa mai richiesta prima ripiega correttamente su idle con la medesima compensazione grafica; nessuna pretesa di disponibilità offline per varianti non visitate.

Build finale: CSS index-D84pJhqE.css (59,99kB), JS index-Cd3rnT8T.js (306,25kB); cache80b4cf46cbe1f174. Shell7file,42path artwork pubblici ammessi su richiesta, **zero artwork precached**. Nessuna variazione alla policy offline.

## Limiti artistici e seguito consigliato

Servirebbero export futuri originali, non realizzati qui:

1. **e01 senza banco in primo piano e senza piano posteriore dipinto**, mantenendo un livello di arredi separato: elimina la necessità del crop stretto e recupera le lampade laterali.
2. Bottiglie con canvas aderenti e un punto di appoggio registrato: elimina compensazioni di margini e rende più semplice una mensola futura più densa.
3. Pose di entrambi i bartender registrate sullo stesso pivot e canvas ottimizzato: la normalizzazione alpha conserva altezza/baseline, ma non può uniformare la dimensione anatomica della testa fra gesti diversi.
4. Shaker/calice con canvas ottimizzato; per liquidi nel vetro, **maschera della coppa, liquido e riflessi/bordi separati**, registrati sullo stesso canvas. Il gauge esterno è la soluzione corretta con gli asset attuali.
5. Ice e Garnish con illustrazioni fisiche coerenti con la pittura del banco: gli SVG esistenti sono leggibili ma restano più simbolici dei PNG.

Non si dichiarano identità pixel per pixel o compatibilità meccanica esatta. Il seguito consigliato è la revisione visiva dell’utente, poi eventualmente una fase dedicata agli export artistici sopra; nessuna fase successiva è stata iniziata.

Schermata della scena finale dopo il reload offline: work/phase2f-stage.jpg (artefatto locale ignorato, non destinato alla produzione).
