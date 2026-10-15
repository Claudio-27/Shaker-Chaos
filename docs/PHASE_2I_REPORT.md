# Fase 2I — verifica clean e blocco finale della scena

Data: 16 ottobre2026. **DOUBLE_COUNTER_STATUS: RESOLVED.** Decisione presa dopo ispezione del gioco reale nel browser Chrome, incluso palco DEV600×440. Nessuna nuova immagine generata.

**MAIN CLASSIC GAME STAGE VISUALLY LOCKED AFTER PHASE 2I.** Restano bloccati600×440, composizione environment.e01 clean, bartender, mensola, piano banco, mixing, comandi, pannello e HUD. Funzionalità future in overlay, dialoghi o schermate secondarie.

## Modifica concreta

Il clean già integrato non richiede alcun cambiamento artistico o di framing. La prova di guasto ha invece riprodotto un difetto: SVG image vuota senza fallback, poiché il suo evento error non propaga al gestore delegato. AssetVisual usa ora un listener diretto con cleanup del ref. La catena esistente prova altra risoluzione e poi legacy; nessun cambiamento a preferenza, download policy o dominio. Dopo la correzione la simulazione di due404 reali ha mostrato environment.e01.background, con diagnostica LEGACY.

ArtRegression offre cleanFailure=1 solo nella fixture DEV: sostituisce i due URL clean con404 dell'endpoint DEV esistente, senza mutare il catalogo originale o toccare file. VisualDebug espone ambiente, CLEAN/LEGACY, runtime e fallback disponibile. L'audit della build vieta i nuovi marcatori. Nessun controllo tecnico in produzione.

## Metadati verificati

Sorgente: art-source/art/environments/e01/background-clean.png. **1600×1000,1.921.815 byte,PNG RGB opaco** (color type2, nessun chunk tRNS). SHA-256:

7b87d6443b34ada71489b5468789ffe2f2018e8d781469279735db253783b29b

| Tier | Percorso relativo a public/ | Dimensioni | Byte | SHA-256 |
| --- | --- | --- | --- | --- |
| 1x | art/runtime/environments/e01/background-clean-1x-58561551ef61.png | 1440×900 | 1.632.039 | 58561551ef6176a3774506712f617a6143afe1d3c177e53caae9908343aa4e86 |
| 2x | art/runtime/environments/e01/background-clean-2x-7b87d6443b34.png | 1600×1000 | 1.921.815 | 7b87d6443b34ada71489b5468789ffe2f2018e8d781469279735db253783b29b |

2x è intenzionalmente limitato al master disponibile: stessi byte ma URL runtime, senza richiesta di art-source. Il lieve resampling precedente1600×1000 non aggiunge dettaglio; provenienza invariata in CLEAN_BACKGROUND_GENERATION.md.22 sorgenti registrate,43 PNG runtime e21SVG,64 URL art ammessi.

## Verifiche visive e di gioco

Le dieci pose b01/b02 idle,tasting,rough,balanced,excellent sono state osservate a600×440. Volti, sagome e contrasto restano chiari; i riflessi della mensola non coprono i volti. Sparkles e ice-blue osservati su entrambi. Le bottiglie interattive sono grandi e separate da quelle decorative; la selezione cambia correttamente. Un solo piano prominente, c01, senza vecchio banco o sgabelli. Shaker e calice poggiano sul banco nel canonico; Ice/Garnish/gauge/pannello/HUD leggibili.

Asset Lab: environment.e01 con c01 e cambio a counter.studio, confermato nel DOM; ulteriore cattura canonica con lo stesso placeholder. Il clean rimane valido con entrambi. Il placeholder conserva la propria resa semplificata: non è una nuova consegna artistica.

Round reale b01: selezione delle bottiglie, ritorno al frutteto, hold Versa11s fino a240u, Ice×2, hold Agita7s, avviso “Lo shaker scalpita”, agrume, Servi, assaggio, reveal e reazione. Risultato9550: ingredienti8450, ghiaccio1000, agrume100, agitazione0; excellent, failed=false. Premio115XP/43monete, livello2, b02 sbloccato. Collezione ed equip b02, Nuovo drink/reload: selezione e progressi conservati. Un round completo b02 è stato poi completato online per scaldare assaggio/reazione/effetto.

Fallimento reale b02: piccolo pour, singolo hold Agita8,3s; il dominio si arresta alla soglia8000ms. Score0, comandi bloccati, presentazione esplosione/rough e premio5XP/2monete. Nessuna modifica alla regola del sesto Shake (coperta dai test esistenti).

| Viewport normale | Palco misurato CSS | Pagina / hitbox | Esito |
| --- | --- | --- | --- |
| 1280×800 | 1058,182×776 | pagina1280×800 | Nessuno scroll; un banco, regioni fisse |
| 1024×768 | 1000×733,333 | pagina1024×768; comandi176,667×70 | Stessa geometria600×440 scalata |
| 768×1024 | 728,8×1173,6 | pagina753×1188; comandi227,2×72, extra94×84 | Flusso verticale esistente, nessun overflow orizzontale |
| 390×844 | 359,2×1327,4 | pagina375×1342; comandi108,662×72, extra62×72 | Crop coerente; hitbox≥48 |
| 320×640 | 288,8×1360 | pagina305×1374; comandi85,2×72, extra56×72 | Nessun overflow orizzontale; hitbox≥48 |

La differenza15px del viewport nei flussi verticali è la scrollbar del browser. Nessuna richiesta di rendere portrait una nuova composizione canonica. DEV reduced-motion attivato da Tuning Inspector: reduced=true e sequence data-motion=none, fondale CLEAN invariato. Test esistenti coprono reveal ridotto, effetti e ordine dei timer.

## Prova offline e richieste

Build effettivamente osservata: assets/index-K30thIJp.js, CSSindex-ukm7kTf0.css, cache2843ac5a0c2438be. Origine locale pulita127.0.0.1:4217, per evitare il worker della precedente build su4215. A viewport stabile1280×800, pageAssets ha registrato **solo clean1x** come ambiente: nessun legacy, master o sibling. I cambi viewport delle prove precedenti possono selezionare legittimamente l'altro tier secondo la policy scala×DPR.

Scena attiva e round b02 riscaldati, badge “Pronto anche offline”. Preview4217 fermato con Ctrl+C e processo concluso. Browser ricaricato realmente con server fermo: clean1x visibile, data-resolved-asset=environment.e01.background.clean, nessun data-fallback. c01, b02idle, tre bottiglie, shaker disponibili senza errori nella scena. Ripetuti pour240, Ice×2, Shake, agrume e Servi:9550, excellent b02, sparkles e calice visibili;115XP/43monete. Nuovo drink/reload ancora offline conserva livello3,100/200XP,131monete, b02, environment.e01 e c01. Nessun premio duplicato dal reload.

Evidenza: [idle offline](visual-baselines/phase2i/offline-idle.jpg), [risultato offline](visual-baselines/phase2i/offline-result.jpg), [failure produzione](visual-baselines/phase2i/failure-production.jpg), [metadati e hash](visual-baselines/phase2i/offline-evidence.json). La prova combina arresto del server, reload/round reali, DOM renderizzato e inventario risorse pageAssets; non è un dump diretto di CacheStorage.

Limite osservato: il nuovo sblocco di Scia azzurra, mai richiesto prima offline, ha la miniatura opzionale nascosta (effect.ice-blue). Nome/premio/sblocco funzionano; nessun messaggio tecnico al giocatore. L'effetto attivo sparkles funziona. Questo rispetta la policy esistente di artwork differito; non si promette offline l'intero catalogo mai visitato. Allowlist64,7shell precache,zero art precached,limite32, pinning della scena invariati.

## Rapporto richiesto — 50 punti

| # | Voce | Esito |
| --- | --- | --- |
| 1 | Ramo | main, invariato |
| 2 | HEAD prima2I | 8713115, include consegna2H/clean |
| 3 | Worktree iniziale | Pulito prima dell'avvio2I; ripresa della stessa fase con sole modifiche2I |
| 4 | Sorgente | art-source/art/environments/e01/background-clean.png |
| 5 | Dimensioni sorgente | 1600×1000,RGB opaco,1.921.815byte |
| 6 | SHA sorgente | Riportato integralmente nella sezione metadati |
| 7 | Validazione artistica | Tiki, parete, mensole, luci, decorazioni e pavimento aperto; nessun banco anteriore, sgabello, utensile, persona, UI, shaker o calice |
| 8 | Runtime1x | Percorso/dimensioni/byte/SHA nella tabella metadati |
| 9 | Runtime2x | Percorso/dimensioni/byte/SHA nella tabella metadati |
| 10 | Preferenza produzione | CLEAN verificato su build finale |
| 11 | Fallback | Legacy osservato dopo due404 DEV; fix listener SVG |
| 12 | Identità | environment.e01 resta l'unico ContentItem; nessun environment.e01.clean possedibile |
| 13 | Posizionamento | Identico: canvas799,395161×500, offsetx−99,697581,y0,clip292; SVG xMidYMid slice |
| 14 | Vecchi workaround | Nessuna nuova maschera o rimozione. Framing/clip condivisi ancora utilizzati dal legacy e dal fitting; nessun codice dimostrato obsoleto da togliere |
| 15 | DOUBLE_COUNTER_STATUS | **RESOLVED** |
| 16 | Vista esatta | DOM600×440 a x340,y180 su1280×800; ispezione visiva positiva |
| 17 | counter.c01 | Unico banco anteriore prominente, indipendente dal fondale |
| 18 | Banco alternativo | Asset Lab e fixture counter.studio positivi |
| 19 | Bottiglie | Tre bottiglie leggibili, cambio selezione verificato |
| 20 | Grounding | Shaker/calice sul piano canonico, gauge ed extra invariati |
| 21 | b01 | Cinque pose osservate, nessuna regressione |
| 22 | b02 | Cinque pose osservate, nessuna regressione |
| 23 | Pannello | Mix, Shake/avviso, pronto, assaggio, risultato e failure osservati; posizione/contrasto invariati |
| 24 | HUD | Leggibile e compatto; livello/XP/monete/Collezione invariati |
| 25 | Round | Completi b01 e b02 online, b02 offline;9550 e premi corretti |
| 26 | Failure | Hold8,3s: soglia8000ms,score0,5XP/2monete |
| 27 | Scoring | Stessi file dominio/applicazione, golden/replay deterministici passati;8450+1000+100+0=9550,excellent,false; failure0 |
| 28 | Progressione | Formule/ledger/unlock/stats identici e testati; round reale115XP/43monete; failure5/2 |
| 29 | Profilo/loadout | Save con environment.e01/counter.c01 caricato prima/dopo reload, nessuna migrazione o mutazione dovuta al clean; b02 persiste |
| 30 | Collection | Bar tiki al tramonto e Banco in legno intarsiato equipaggiati, ownership invariata; nessun Clean/Legacy/background-clean nel testo giocatore |
| 31 | 1024×768 | Nessuno scroll, un banco, costanti canoniche invariate |
| 32 | 1280×800 | Nessuno scroll, stesso palco scalato |
| 33 | Portrait/mobile | Tre viewport verificati; flusso verticale e crop esistenti, nessun overflow orizzontale, hitbox≥48 |
| 34 | Reduced motion | Toggle DEV osservato; nessun cambio al fondale o alle regole |
| 35 | Effetti | Sparkles e ice-blue osservati con entrambi; sparkles verificato anche offline |
| 36 | Offline CLEAN | Server fermo, reload e round completi; clean1x senza fallback, prove salvate |
| 37 | PWA/cache | Warm selettivo clean,64URL ammessi,7shell,0art precache,limite32; nessun cambiamento di policy |
| 38 | Richieste | Avvio stabile e reload offline: clean1x soltanto, nessun master/legacy/sibling |
| 39 | Diagnostica DEV | Environment e01,CLEAN/LEGACY,Fallback available,runtime; esclusa dalla produzione |
| 40 | Sette baseline | Aggiornate nella cartella storica phase2h, manifest fase2I e SHA clean; vecchio set in8713115 |
| 41 | Lock documentato | Visual architecture/export/runtime/generation/report2H aggiornati con appendici, storia conservata |
| 42 | Test | **293 passati**,291 preesistenti conservati,+2 test mirati; nessuno skipped/fallito |
| 43 | Validazione | TypeScript strict,lint,build/audit isolamento,art:verify e Git diff check; risultati finali nella consegna |
| 44 | Limiti | Resampling nativo precedente, JPEG non pixel-identici tra browser, fallback legacy conserva arte storica, portrait resta flow e grounding meno naturale; miniatura di sblocco mai scaricata resta opzionale offline |
| 45 | Prossimo passo | Solo raccomandazione: eventuale futura fase funzionale su overlay/schermate secondarie; nessuna fase avviata |
| 46 | Image generation | Mai chiamata in2I; nessun artwork modificato |
| 47 | Ricerca riferimento | Nessuna ricerca, esecuzione Ruffle/SWF o consultazione asset originali |
| 48 | Rami | Nessun ramo creato o cambiato |
| 49 | Commit/remoti | Eccezione esplicita dell'utente “fai anche ora commit”: unico commit locale finale2I. Nessun push,PR,GitHub o modifica remoti/storia |
| 50 | Consegna | Modifiche2I incluse nel commit locale autorizzato su main; hash e verifica worktree finale comunicati nella risposta. La richiesta esplicita sostituisce il divieto di commit dell'allegato |

## Integrità e limiti di verifica

**101 file protetti byte-identici** rispetto all'inizio2I: dominio, applicazione, App, PlayerProgression, sorgenti art, raster pubblici e cinque file di geometria/framing/CSS. I test proteggono anche hash normalizzati del palco, identità salvate, delivery e worker, assenza di dipendenze visuali nello scoring, reward deterministici e idempotenza. Nessun lock ricalibrato.

Le sette baseline sono fixture di composizione, non sostituiscono la partita reale. I due test nuovi controllano simulazione immutabile di entrambe le consegne guaste e integrità/binding delle sette baseline al clean effettivo. Nessuna nuova dipendenza o automazione del riferimento. Le tre prove di produzione sono aggiuntive alle sette baseline. Le verifiche sono in Chrome locale, non una certificazione di tutti i dispositivi fisici. Server di test fermati e override viewport ripristinato.
