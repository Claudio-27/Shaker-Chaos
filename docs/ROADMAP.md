# Roadmap

## Stato corrente — fase2Q / RC v1

1.0.0-rc.1 preparata,388test e audit PASS; fix hold al resize e metadati PWA. Nessuna feature nuova. [Checklist](V1_RELEASE_CHECKLIST.md) · [Report](PHASE_2Q_REPORT.md) · [Note giocatore](V1_RELEASE_NOTES.md). RC READY per collaudo, con tablet fisico/SR/installazione OS e altri browser ancora NOT TESTED. Commit/push autorizzati dall’utente per questa consegna; nessun deploy. Stop dopo2Q.

## Checkpoint storico — fase 2P

Player polish v1: guida contestuale skippabile, Aiuto, copy, errori, focus e cinque viewport.383test; scoring, balance2O, scena e artwork invariati. [Esperienza](PLAYER_EXPERIENCE_V1.md) · [Rapporto](PHASE_2P_REPORT.md). Stop dopo2P; nessun commit/push. Prima della release candidate resta utile il collaudo su tablet fisico.

## Checkpoint storico — fase 2O

Balance pass v1 completato, 375 test. Tre ritocchi di contenuto, nessun sistema nuovo, scoring/scena/artwork invariati. [Tuning](V1_BALANCE.md) · [Rapporto](PHASE_2O_REPORT.md). Stop dopo 2O; lavoro non committato su main. Playtest su tablet fisico consigliato prima del rilascio.

## Checkpoint storico — fase2N

Tre bottiglie originali generate con image_gen su autorizzazione dell’utente, sei ingredienti e sette ricette pubblicati. Shop/gate/ownershipV3 e mensola attivi; collaudo produzione offline/multi-tab e responsive,371test. [Rapporto](PHASE_2N_REPORT.md).

Stop dopo2N, lavoro locale non committato su main. Passo successivo consigliato: playtest su tablet fisico e bilanciamento basato sul feedback, senza iniziare qui una nuova fase.

## Checkpoint storico — fase2M

Sei ingredienti e sette ricette configurati; tre nuovi ingredienti/offerte/ricette non pubblicati per mancanza di artwork finale distinto. Acquisti/ownershipV3, gate ricette, shelf paginata, scoring data-driven con legacy identico, Lab e simulazione pronti. [Rapporto2M](PHASE_2M_REPORT.md), [brief artistico](ART_REQUEST_NEW_INGREDIENTS.md).

Stop dopo2M. Prossimo passo consigliato: consegna/revisione delle tre bottiglie e successiva attivazione dei dati, poi collaudo reale delle nuove pagine/acquisti offline. Nessuna fase successiva iniziata. Le modifiche restano locali non committate su main.

## Checkpoint storico — fase2L

Quattro ricette originali e quattro obiettivi, risultato distinto dallo scoring, mastery persistenteV3/migrazione e premi una tantum coordinati. Collezione→Ricette, Lab DEV e simulatore deterministico; palco/artwork/scorer/shop2K bloccati.350test e verifiche offline/multi-tab. [Rapporto2L](PHASE_2L_REPORT.md), [specifica](RECIPES_AND_GOALS.md).

Stop dopo2L, modifiche non committate su main. Proposta successiva: playtest su tablet di ricettario, precisione e risultati compatti; nessuna nuova fase avviata.

## Checkpoint storico — fase2K

Economia locale significativa con grant gratuiti separati dalla disponibilità d'acquisto: Scia150/livello2, Bartender02 300/livello3, bundle382/livello6 con prezzo residuo. Reward, curva XP, profiloV2, persistenza/coordinamento e stage2I invariati. Simulatore deterministico DEV e test di policy/legacy. [Rapporto](PHASE_2K_REPORT.md), [shop](SHOP_SYSTEM.md), [progressione](PROGRESSION_SYSTEM.md).

Checkpoint2J committato localmente con autorizzazione utente: d8dce00.2K resta non committata su main. Stop dopo2K. Proposta successiva: breve playtest dell'economia e dell'accessibilità su tablet reale; valutare futuri cosmetici originali solo dopo il playtest. Nessun asset, backend/account/cloud, pagamento reale o ricerca storica avviati. Le sezioni successive sono storiche.

## Checkpoint storico — 2E, geometria classica fissa

Scena 600×440 con scala uniforme, coordinate e layer centrali, pannello90px fisso con scroll interno, hitbox accessibili e griglia50px solo DEV. Tutti i sistemi2A–2C e gli asset sono invariati. Arresto dopo2E. Passo consigliato: breve verifica su tablet reale, leggibilità dei risultati nel pannello compatto e playtest della composizione; nessuna ricerca storica o shop avviati. [Rapporto 2E](PHASE_2E_REPORT.md).

## Checkpoint — 2D, scena classica

Ricomposizione della sola schermata normale, con priorità landscape 1280×800 e 1024×768; portrait/narrow possono scorrere. Scoring/progressione/save e ricerca chiusa restano invariati. Arresto dopo 2D. Prossimo passo consigliato: breve playtest su tablet reale per gerarchia visiva, touch e installazione PWA; eventuali ritocchi soltanto con nuovo prompt. Shop/purchases/bundles sono una proposta storica, non avviata. [Rapporto 2D](PHASE_2D_REPORT.md).

## Checkpoint — 2C, profilo/XP/economia locale

Profilo V1, repository locale, XP/monete originali, curve/level-up, reward settlement idempotente, stats, ownership, sblocchi2/3, equip persistente e Collection integrati a valle dello scoring. Nessuna modifica al tuning cocktail; ricerca1 chiusa.

Fase successiva consigliata, solo con nuovo prompt: **SHOP / PURCHASES / BUNDLES**. Definire prezzi fittizi e concessioni, transazioni idempotenti e atomicità wallet/ownership, bundle canonici; nessun pagamento reale o contenuto privato protetto solo dal client. Prima dell’espansione verificare la necessità di coordinamento multi-tab e di migrazioni del save. Playtest tablet fisico/accessibilità/PWA installata resta consigliato.

[Rapporto2C](PHASE_2C_REPORT.md), [specifica](PROGRESSION_SYSTEM.md). La proposta di playtest2C del checkpoint2B è stata sostituita dal nuovo incarico esplicito di progressione. Arresto dopo2C; nessuna fase shop iniziata.


## Checkpoint — fase 2B completata (2026-10-13)

Esperienza di un giro rifinita: feedback dei controlli, progression visiva, assaggio/reveal, nove dialoghi, risultato/reset, difesa input, movimento ridotto e responsive. Regole 2A, artwork e ricerca storica preservati. 210 test, controlli strict/lint/build/audit e smoke browser/offline superati. Cambiamenti locali su main, da revisionare e committare dall’utente.

Phase 2C consigliata, soltanto con nuovo incarico: playtest su tablet fisici (touch, multitouch, penna, orientamento e sospensione/ripresa), verifica PWA installata e screen reader, eventuali piccoli aggiustamenti guidati dal playtest e suoni originali tramite la porta preparata. La copertura fisica non è sostituita dai test sintetici/browser. Nessun retuning automatico, XP, economia, nuovi contenuti, account/backend/vault o ricerca del riferimento avviati in 2B.

[Rapporto completo 2B](PHASE_2B_REPORT.md). La roadmap originale sotto è storica e non autorizza lavoro ulteriore. Arresto dopo 2B.


Aggiornamento fase2A: ricerca1B–1E chiusa per decisione di prodotto. Primo gameplay originale implementato con profilo classico, risultato0–10000 e tuning approvato. Si lavora direttamente su main; le modifiche2A restano locali per revisione. La roadmap storica seguente non richiede ulteriore compatibilità1:1.
Questa raccomandazione 2A è stata seguita dalla fase 2B descritta sopra. Non riaprire esperimenti sul riferimento.


Fasi 0–0.3 completate. Fase 1A completata come infrastruttura di ricerca; osservazioni/meccaniche verificate e fasi successive restano da svolgere.

| Fase | Obiettivo | Criterio di uscita |
| --- | --- | --- |
| 0 — Architettura e harness di ricerca | React/TS/Vite, dominio puro, catalogo originale, demo esplicitamente non verificata, schema delle evidenze, test e PWA minima | TypeScript, lint, test e build superati; dipendenze sostituibili; istruzioni di prova documentate |
| 0.1 — Storia e unità canoniche | Eventi deterministici, replay, VolumeUnit intere, input scoring completo | Completata: storia preservata; nessuna conversione ml presunta |
| 0.2 — Composizione e segnaposto | GameStage responsive, registro visuale, animazioni e visualDebug | Completata: safe area e hitbox distinte; 53 test alla chiusura |
| 0.3 — Artwork e catalogo modulare | Entrambi i bartender forniti, environment/counter indipendenti, bundle dichiarativi, Asset Lab dev, cache selettiva | Inventario/hash/provenienza, slot indipendenti, controlli e rapporti; nessuna economia o consegna privata |
| 1A — Compatibility Lab e fixture | Sequenze canoniche controllate, osservazioni manuali separate, confronti parziali, sweep e guard di promozione | Lab DEV isolato, schema validato, zero fixture reali inventate, test e build/audit superati |
| 1B — Meccaniche di miscelazione verificate | Osservare capacità, versamento, ghiaccio, agitazione, guarnizioni e ciclo della partita | Specifica con unità, procedure, evidenze e casi limite riproducibili; nessun coefficiente presunto |
| 2 — Compatibilità comportamentale 1:1 dello scoring | Dataset ed equazione sostenuti da evidenza indipendente | Fixture di riferimento con punteggi numerici esatti, soglie e arrotondamenti; discrepanze spiegate; interfaccia invariata |
| 3 — Bartender, arte, animazione e suoni originali | Sistema espressivo e identità propria | Asset originali e provenienza documentata; reazioni coerenti con gli eventi di dominio |
| 4 — Rifinitura tablet/PWA | Ergonomia, accessibilità, installazione e offline | Verifiche su tablet fisici, entrambi gli orientamenti, penna/touch, riduzione movimento e ciclo di aggiornamento |
| 5 — Progressione, XP, valuta e sblocchi | Politiche premio separate e profilo del giocatore | Stesso mix e dataset producono sempre lo stesso score, indipendentemente dal profilo; premi non duplicati |
| 6 — Contenuti estesi | Altri ingredienti, bartender, ricette e scoperte | Catalogo validato e versionato; contenuto e policy distinti dalla UI |
| 7 — Area privata/vault sicura | Autenticazione/sessioni server e consegna autorizzata dei contenuti | Endpoint protetti, asset non presenti nel bundle pubblico, cache e revoche testate; niente sicurezza solo client |
| 8 — Account/cloud/backend opzionali | Salvataggi remoti e sincronizzazione, se richiesti | Contratti versionati, conflitti e migrazioni definiti; trattamento dei dati e disponibilità chiariti |

La PWA minima e le icone geometriche della fase 0 sono infrastruttura della demo; non completano le rifiniture della fase 4 né il sistema artistico della fase 3. La promozione di una meccanica a compatibile richiede evidenza, non il solo superamento dei test del progetto.

La fase 0.3 anticipa l'integrazione degli artwork forniti, senza completare la direzione artistica o il suono della fase 3, la validazione su tablet fisici della fase 4, l'economia della fase 5 o il vault della fase 7. Il rapporto ASSET_INGEST_REPORT.md documenta limiti e verifiche. La fase 1A successiva è stata autorizzata esplicitamente e documentata. Fermarsi dopo 1A: osservazioni black-box sul riferimento e implementazione compatibile richiedono un nuovo incarico.

Fase 1B (2026-10-11): infrastruttura e diagnostica black-box eseguite; caratterizzazione numerica bloccata da input/emulazione non calibrati. Zero regole compatibili promosse, nessun passaggio alla fase seguente. Vedi REFERENCE_FINDINGS.md.

Fase 1C chiusa con limiti: input desktop nativo e score originali disponibili; gate rigoroso tre run unificati parziale. Nessun passaggio automatico di fase o alla formula compatibile. Il prossimo incarico deve risolvere quel gate prima della matrice meccanica.

## Chiusura di fase 1D

Il gate di baseline è stato risolto con cinque nuove sessioni fredde a270. La caratterizzazione quantitativa nativa è documentata in NATIVE_CHARACTERIZATION_FINDINGS.md, comprese prove limitate e prerequisiti non raggiunti. Nessun candidato di scoring viene creato senza il gate completo. Arresto dopo1D: non iniziare la fase successiva senza un nuovo incarico.
