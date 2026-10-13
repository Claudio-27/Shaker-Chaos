# Registro della ricerca

Data iniziale: 2026-10-04. **Alla data iniziale nessuna osservazione del gioco originale era stata svolta**; le acquisizioni diagnostiche della fase 1B sono aggiunte in R-005. Le voci dimostrative verificano il nostro software; non dimostrano compatibilità. Non sono state consultate fonti esterne per coefficienti o soglie.

## Template di finding

```text
ID: R-000
Data / autore:
Ambito: gioco di riferimento / software Shaker-Chaos / ipotesi
Claim (affermazione precisa):
Verification status: VERIFIED / STRONGLY_SUPPORTED / UNVERIFIED
Evidence/source: fonte, versione, sessione e riferimenti; oppure NESSUNA
Test procedure: condizioni iniziali, azioni, quantità, timing, controlli, ripetizioni
Observed result: valore esatto, unità, reazione; oppure NON OSSERVATO
Confidence: low / medium / high, con motivazione
Notes: limiti, contraddizioni, alternative, prossima prova
Mechanics IDs: M-...
Fixture / dataset version:
Decision: nessuna / ulteriori prove / candidata alla specifica
```

La confidenza non sostituisce lo stato. Un finding contraddetto va conservato, collegato alla nuova evidenza e rivalutato; non cancellare le prove negative. Registrare fonti terze come ipotesi non verificate finché non ci sono osservazioni indipendenti. Non introdurre codice, asset o altri file proprietari nel progetto.

## R-000 — Punteggio demo riproducibile (ambito: nostro software)

- Claim: l'adattatore demo restituisce lo stesso risultato per lo stesso stato e configurazione sintetica, senza modificare l'input.
- Verification status: VERIFIED **esclusivamente per il software del prototipo**. Compatibilità del dataset e dell'equazione: UNVERIFIED.
- Evidence/source: `src/domain/scoring.test.ts`, fixture `synthetic-test-v2` (equivalente intero della fixture precedente), codice originale del progetto. Nessuna evidenza del gioco di riferimento.
- Test procedure: eseguire `npm test`; congelare lo stato perfetto sintetico, valutarlo ripetutamente, controllare score e somma del breakdown; esplorare una griglia deterministica di input.
- Observed result: la fixture perfetta restituisce 100, il vuoto 0; risultati ripetuti coincidono e i contributi restano entro il budget.
- Confidence: high per i casi software coperti; nessuna confidenza di compatibilità.
- Notes: formula e numeri inventati. Una fixture superata non promuove i valori originali M-001…M-010.
- Fixture/dataset: synthetic-test-v2 / phase-0-demo-v2 (migrazione software del 2026-10-05).
- Decision: mantenere la demo etichettata NOT YET COMPATIBILITY-VERIFIED.

## R-001 — Capacità del gioco di riferimento (finding ancora vuoto)

- Claim: capacità, unità e comportamento di overflow devono essere misurati.
- Verification status: UNVERIFIED.
- Evidence/source: NESSUNA.
- Test procedure proposta: partire da vuoto, versare quantità controllate, individuare il limite e ripetere con ghiaccio prima/dopo. Prima definire una misura riproducibile delle quantità.
- Observed result: NON OSSERVATO.
- Confidence: low; nessun valore candidato.
- Notes: La vecchia etichetta 240 ml era solo presentazione del prototipo; in fase 0.1 il limite demo è 240 u, senza alcuna conversione fisica definita. Non trasferirlo al dataset di compatibilità.
- Mechanics IDs: M-001, M-002, M-003.
- Fixture/dataset: nessuna fixture del riferimento.
- Decision: nessuna; ricerca da eseguire in fase 1.

## Aggiornamento architetturale — 2026-10-05, fase 0.1

> **Preserve information until research proves it irrelevant.**

Non è iniziata la fase 1. Nessun nuovo finding sul gioco di riferimento, nessuna fonte esterna consultata, nessun valore originale aggiunto. Le modifiche seguenti verificano solo il nostro software.

### R-002 — Cronologia conservata e replay deterministico (ambito: Shaker-Chaos)

- Claim: eventi cronologici identici producono lo stesso stato derivato; storie con totali identici conservano differenze di ordine, numero di operazioni, tick e timing. Reset pulisce il tentativo senza eliminare il prefisso storico.
- Verification status: VERIFIED esclusivamente per i casi software coperti. Rilevanza di ciascuna variabile per il riferimento: UNVERIFIED.
- Evidence/source: `src/domain/session.test.ts`, `src/application/game.test.ts`, schema eventi v1 e proiezione `phase-0-demo-projection-v2`.
- Test procedure: replay ripetuto, coppie di log con ghiaccio prima/dopo e un pour/due pour, tick oltre capacità, più shake con durate distinte, reset attivo, confronti indipendenti della view con il replay. Tutte le quantità sono fixture sintetiche.
- Observed result: stati ripetuti coincidono; log e conteggi restano distinguibili; richieste limitate/ignorate sono conservate; currentAttemptHistory dopo Reset è vuota e la cronologia precedente resta accessibile.
- Confidence: high per le invarianti testate; nessuna evidenza di compatibilità.
- Notes: il timestamp è relativo a ms interi, non misura nativa verificata del riferimento. Lo schema richiede inizi identificati; ulteriori fatti/risoluzioni andranno aggiunti senza cancellare quelli esistenti. Nessun evento UI come coordinate o focus è registrato.
- Mechanics IDs: M-002, M-003, M-004, M-005, M-010 restano UNVERIFIED.
- Decision: mantenere la storia canonica fino a prova di irrilevanza di ogni dettaglio.

### R-003 — Unità intere e separazione della presentazione (ambito: Shaker-Chaos)

- Claim: VolumeUnit e tick sono interi sicuri; presentazioni alternative non alterano storia, quantità o score. La formula demo usa rapporti razionali interi con BigInt.
- Verification status: VERIFIED per il software del progetto. Unità native, capacità e conversione fisica del riferimento: UNVERIFIED.
- Evidence/source: `src/domain/quantity.test.ts`, `src/domain/scoring.test.ts`, `src/ui/volumePresentation.test.ts`.
- Test procedure: rifiutare frazioni/NaN/infinito/overflow; valutare rapporti prossimi a MAX_SAFE_INTEGER e arrotondamenti esatti; formattare due scale sintetiche e confrontare gli stessi input/risultati prima e dopo.
- Observed result: nessun valore frazionario entra nelle quantità; overflow rifiutato; risultato demo perfetto 100 e vuoto 0; formattazione senza effetti sullo scorer.
- Confidence: high per i casi coperti, senza conclusioni sul riferimento.
- Notes: i precedenti numeri 240/15 restano scelte della demo in u. La configurazione di produzione non contiene un fattore ml/u. Le scale nei test non sono proposte di conversione.
- Mechanics IDs: M-001, M-002, M-007, M-009 restano UNVERIFIED.
- Decision: stabilire una mappatura fisica soltanto quando esistono osservazioni documentate.

## Estensione del template per future acquisizioni

A ogni finding aggiungere: schema della storia, sequenze e tempi relativi, origine/risoluzione del clock, start/end e ID delle operazioni, ingrediente e quantità di ciascun tick, credito shake distinto dalla durata trascorsa, punti di reset e ID della proiezione/dataset. Conservare la traccia completa, non soltanto i totali finali. Indicare esplicitamente l'assenza di una mappatura fisica o l'evidenza che la sostiene.

Le variabili aggiunte alla storia non sono automaticamente meccaniche verificate. Un replay deterministico prova una proprietà del software, non che il riferimento usi la stessa proiezione o formula.

## R-004 — Harness di fase 1A, 2026-10-06 (ambito: Shaker-Chaos)

- Claim: sequenze manuali precise producono eventi canonici e proiezioni deterministiche; fixture e confronti parziali preservano le incognite; il laboratorio è isolato dal gioco normale e dalla produzione.
- Verification status: VERIFIED solo per i controlli software eseguiti. Compatibilità con il riferimento: UNVERIFIED.
- Evidence/source: src/research/cases.test.ts, src/content/reactionPresentation.test.ts, scripts/production-boundaries.test.mjs; audit su output effettivo di npm run build. Nessuna fonte o osservazione del riferimento.
- Procedura: input sintetici, round-trip JSON, ordine inverso e totali uguali con storie diverse, quantità al limite sicuro, reset, schema/evidenza/promotion guards e confronti MATCH/MISMATCH/UNKNOWN. Smoke browser separato.
- Risultato: laboratorio e serie funzionanti; scorer demo intatto. Le fixture mock VERIFIED dei test sono dichiarazioni sintetiche in memoria per verificare i guard, non evidenze reali.
- Confidence: high per i casi software testati; nessuna evidenza del riferimento.
- Decision: mantenere vuota research/reference-cases fino a osservazioni indipendenti; zero regole promosse, zero valori VERIFIED del riferimento. Non confondere R-000/R-002/R-003/R-004 (software) con finding compatibili.

M-001…M-010 restano UNVERIFIED. La fase 1A avvia infrastruttura di ricerca e non cambia alcun loro valore. Ogni osservazione futura deve indicare input esatto, unità native/mapping, timeline misurata, build, source/procedure e ripetizioni. Il solo score coincidente non verifica input né formula generale. Vedi REFERENCE_TEST_MATRIX.md e COMPATIBILITY_LAB.md.

## R-005 — Fase 1B, 2026-10-11

- Ambito: ricerca black-box del riferimento / software di acquisizione; separare le due evidenze.
- Build: ia-therightmix-ede221ad99e03173, SHA-256 ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7, 693558 byte; solo RAM. WDM osservabile separato, hash sconosciuto. Fonte/ambiente in REFERENCE_FINDINGS.md.
- Procedura reale: tentativi Serve vuoto (tre nella stessa sessione museo, uno Archive), selezione bottiglia, hold brevi/lunghi, hitbox/drag, confronto browser/renderer, ice/limone e Shake→Pour diagnostico; input asincroni sintetici distinti dai fidati. Nessuno score numerico; fase/pose/tooltip osservati, quantità e accettazione meccanica sconosciute.
- Dataset: 16 acquisizioni automatiche, 16 fixture UNVERIFIED. Zero esperimenti umani indipendenti. Una rettifica append-only del button su pointerup destro: buttons=0 non significa button=0. Originale preservato, nessun nuovo repeat.
- Risultato meccanico: zero VERIFIED, zero STRONGLY_SUPPORTED. Nessun coefficiente/quantum/capacità/bonus/soglia/massimo. M-001…M-010 rimangono UNVERIFIED.
- Controlli software: raw/schema/collegamenti, no promozione automatica, guard input/build, report MATCH/MISMATCH/UNKNOWN su tutte le fixture, confine produzione. Dataset model: 0 MATCH / 0 MISMATCH / 16 UNKNOWN; numeri non confrontabili, errore null e accuratezza numerica N/A.
- Blocco: nessuna baseline liquida con output numerico affidabile; origine input/emulazione/scheduling non isolata. Renderer Chrome automatico vuoto, Canvas renderizza. Rete Archive HTTP 500 intermittente. Non confondere un tentativo fallito con una regola del gioco.
- Decision: fermare la fase dopo il fallback massimo affidabile, preparare gate manuale di calibrazione e piani NOT TESTED. Nessuna sostituzione dello scoring demo né prosecuzione di fase. Dettaglio: REFERENCE_FINDINGS.md / research/reference-runner/README.md.

### Chiusura R-005 — controlli effettivi

107/107 test passati (91 precedenti + 16 nuovi), TypeScript/lint/build riusciti; research:fixtures/validate/summary/model riusciti su 16 raw/16 fixture e una correzione. Smoke dev: Versa da tastiera 15 u, un ghiaccio da mouse, Shake da tastiera 0,1 s, Serve 34/100, Reset a zero. Lab: pour/ice/tre shake/Serve, export 14 eventi UNVERIFIED, Reset conserva storia e azzera tentativo; gioco sottostante resta 0 u. Produzione: query compatLab ignorata; 14 immagini visibili caricate, stato Pronto anche offline; preview propria fermata, reload dalla cache riuscito, Versa/Serve a 15 u e 30/100 con tutte le immagini decodificate. Nessun test touch fisico nuovo; handler/UI invariati e regressioni di sessione/catologo/PWA passate.

Bundle invariato: 38 moduli, JS index-Ds8N4XYh.js 264,41 kB, CSS index-C2Y8JjDS.css 16,84 kB; cache 791c56d7c58dd2b0, shell 7 / artwork allowlist 42. Audit: nessun SWF/WASM su public/dist/research né tracciato; nessun diff in dominio/application/UI/content/public. Git diff --check passato; ramo iniziale conservato.

Controllo finale del tooling R005 (non una nuova osservazione del riferimento): rimosso il file temporaneo di verifica sintassi che interferiva con ESLint; npm run check rieseguito, 107/107 test e TypeScript/lint/build passati. Runner riavviato con download completo e fallback anche su trasferimento interrotto; /identity.json conferma hash atteso, 693558 byte e binarySaved=false, /package.json risponde 404. Wrapper definitivo caricato in browser e durata negativa rifiutata prima di inviare input al filmato. Dati di riferimento invariati: 16 raw + 16 fixture UNVERIFIED.

## R006 — Phase 1C (chiusa con limiti, 12 ottobre 2026)

Ruffle Desktop stable 0.7.1 e nightly 2026-10-11 identificati con hash; eccezione GitHub autorizzata solo per download ufficiali. Helper SendInput/SetCursorPos+Stopwatch e catture client DPI; UI orb corretto avvia gioco. Score114 primo; tre cold timed run113/111/110 non ripetibili. Full indicator con Pour15000 e Shake1000/Serve mostra270 in tre cold process (1stepwise+2unificati). Terzo unificato interrotto da cursore/geometria/target, guard non aggirati. Gate rigoroso parziale, matrice ulteriore non eseguita. 13 nuovi raw/14 nuove fixture; aggregate statusSTRONGLY_SUPPORTED circoscritto, nessuna regola VERIFIED/modello/coefficiente. Rettifica append-only del solo ordine comandi FULL-DIAG; phase1B raw intatti. Vedi NATIVE_REFERENCE_FINDINGS per hash, ambiente, metodo e limiti.

### Chiusura R006 — controlli effettivi

- `npm run check`: TypeScript strict, lint, **122/122 test** (107 precedenti + 15 nuovi) e build produzione passati. Nessun test saltato. Nuovi controlli coprono mapping DPI/letterboxing, validazione completa prima dell'input, isolamento produzione, telemetria nativa, ambiente dello scorer, score visivo, hold interrotto e correzioni append-only.
- `research:validate`, `research:summary`, `research:model` riusciti: **29 raw / 30 fixture / 2 correzioni**, 0 VERIFIED / 1 STRONGLY_SUPPORTED / 29 UNVERIFIED. Sette acquisizioni numeriche native; la fixture aggregata è l'ottavo valore nello schema, non un ottavo esperimento. Modello assente: 0 MATCH / 0 MISMATCH / 30 UNKNOWN, 38 campi sconosciuti, errore massimo null e accuratezza numerica N/A.
- Smoke dev: Versa da tastiera 30 u, un ghiaccio, Agita da tastiera 0,3 s, Serve 35/100 e comandi bloccati, Reset a zero. Lab: pour12/ice1/tre shake800/Serve, export UNVERIFIED di 14 eventi; Reset porta a 15 eventi conservando la storia e azzera il tentativo. Gioco sottostante resta 0 u.
- Smoke produzione su localhost: compatLab=1 non espone il pannello; preview propria fermata, reload dalla cache riuscito con tutte le 14 immagini decodificate; Versa 15 u/Serve30/100 offline e stato Pronto anche offline. Nessun nuovo test touch fisico; handler/layout/artwork invariati, regressioni PWA passate.
- Bundle invariato: 38 moduli, JS index-Ds8N4XYh.js 264,41 kB, CSS index-C2Y8JjDS.css 16,84 kB, cache 791c56d7c58dd2b0, shell7/artwork allowlist42. Guard eseguito sugli output effettivi: ricerca nativa, mappe, catture, SWF e runtime esclusi.
- Audit locale: tutti i 16 hash raw di fase1B identici alla snapshot; nessun diff in dominio/application/UI/content/public/package-lock; nessun SWF/EXE/DLL/ZIP tracciato; cartelle locali ignorate. Git diff --check riuscito; ramo phase1/reference-characterization conservato. Nessun commit/push/PR o modifica a remoti/storia Git.
- Helper nativo fermato sul solo processo posseduto. Ultimo doctor PASS/READY_TO_LAUNCH senza input: prerequisiti, SWF/runtime hash, DPI e API GDI validi; targetScreenshotVerified=false perché il processo è chiuso. I doctor su target vivo erano passati durante i run riusciti; questa chiusura non pretende una finestra ancora attiva. Ultimi tentativi fermati per cursor movement, geometria o target assente: non conteggiati come terzo repeat.

Fase 1C **CLOSED_WITH_LIMITS**. Gate rigoroso **PARTIAL (2/3)**: due script unificati riusciti e una diagnostica separata con lo stesso score270 in un altro cold process. Preservare questa distinzione. Il prossimo incarico può completare il terzo run con controllo stabile, poi calibrare quanta e aprire la matrice; nessuna fase successiva è iniziata.

## R007 — Phase 1D (chiusa con limiti, 12 ottobre 2026)

Procedura baseline-270-v1 congelata dai due log unificati 1C, stesso hash SWF e runtime. Sei tentativi nuovi: primo abort per cursore, poi cinque cold score270 identici; gate3/3 e5/5 superati. Relazione nativa STRONGLY_SUPPORTED, quantità/tick canonici UNMAPPED. Secondo abort durante il controllo della prima serie; nessun trattamento eseguito, retry con nuovi ID e guard rafforzati.

69 nuove osservazioni /74 nuove fixture; totali98 raw/104 fixture/2 correzioni storiche.69 cold run,67 sequenze OS complete,61 risultati numerici,59 servizi riusciti,2 fallimenti automatici primaServe con score0,2 abort,4 diagnostici e2 procedure senza risultato. Status cumulativi0 VERIFIED /6 STRONGLY_SUPPORTED /98 UNVERIFIED; tutti i raw restano UNVERIFIED.61 file storici byte-identici.

Pour14000/14500: tre coppie per livello,270 contro270. Pour5000:111/111/111; il contrasto con i vecchi1C113/111/110 resta documentato, acquisizione/intervalli diversi. Pour10000:245/246/246, non mediati. Una coppia B dopo gate:1x5000 →111,1667+1667+1666 →65, delta-46; stesso totale richiesto, nessuna equivalenza di liquido.

Punti di ghiaccio/limone corretti con diagnostiche separate: i primi candidati selezionavano bottiglie. Ice dopo pieno270 senza accepted count dimostrato; early-one cubetti in movimento e270, early-two senza risultato. Limone dopoShake: tre pair270→370 con slice sul calice, relazione circoscritta Strong; primaShake270 una volta, doppio click dopoShake370 una volta. Pause/quantità/capacità non isolate come coefficienti globali.

Shake0: Serve lascia Time to shake, nessuno score. Conteggi1..5 a1000ms:270/270/275/285/300. Totale richiesto4000ms con1/2/4 azioni:275/285/285; misure e pause diverse. Agitazione continua5000 →275;10000/15000 esplosione visiva dopo hold/release e auto failure0 primaServe. Bracket nativo grossolano5–10s; non una soglia Flash esatta. Nessun quantum, capacità numerica, coefficiente, ordine fra due ingredienti o modello. Ingredient slot08 selezionabile, label nominale non convalidata.

### Controlli R007

TypeScript/lint/134 su134 test/build passati; nessun test saltato. Fixture validation, summary, model evaluator e doctor passati; baseline gate5/5. Nessun candidato:0 MATCH /0 MISMATCH /104 UNKNOWN,246 campi sconosciuti, errore massimo null, accuratezza numerica N/A.

Lab: fixture nativa reale270 importata con CURRENT DEMO UNKNOWN; niente confronto con un cocktail vuoto inventato. Demo:15u, Ice1, Shake da tastiera, Serve34/100, reset0; Asset Lab/Visual Debug funzionanti. Lab sintetico:14 eventi UNVERIFIED, reset conserva15 eventi e lascia il gioco0u. Produzione corrente su4188:14 immagini caricate, laboratori esclusi anche con query; preview fermata, reload da cache e Versa15u/Serve30/100 offline riusciti. Su4177 era presente una cache storica di fase0.2 non aggiornata dal reload durante questa prova; limite documentato nel report, service worker invariato.

Bundle invariato:38 moduli,index-Ds8N4XYh.js264,41kB,index-C2Y8JjDS.css16,84kB,cache791c56d7c58dd2b0,shell7/artwork allowlist42. Audit sul dist e Git: nessun SWF/runtime/cattura/helper/mappa originale in produzione o tracciato; dominio/application/content/public/package-lock invariati. HEAD60e3252 invariato, ramo locale phase1/quantitative-native-characterization creato solo dopo autorizzazione esplicita. Nessun commit/push/PR/GitHub/download/servizio esterno/remoto.

Su richiesta dell’utente lo schermo è rimasto attivo tramite richiesta temporanea Windows, rilasciata e verificata RELEASED alle19:15:13UTC; timer persistenti invariati. Ruffle posseduto chiuso, ultimo doctor READY_TO_LAUNCH senza input. La parte finale del pair B ha usato un piano esplicito nuovo per terminare entro circa un’ora, senza diminuire guard; ultimo run19:14:21UTC. Nessuna stima online è stata necessaria o introdotta come misura.

Report completo dei38 punti: NATIVE_CHARACTERIZATION_FINDINGS.md. Fase1D CLOSED_WITH_LIMITS; stop, nessuna fase successiva iniziata.

## R008 — Phase1E aperta: preparazione del12ottobre2026

Repository iniziale pulito, HEAD3e1f06a e ramo phase1/causal-mechanics-isolation già selezionato dall’utente. Nessun cambio Git. Snapshot204 raw/fixture/corrections storici; hash tutti identici. Congelati CONTROL-FULL eCONTROL-5000 dai record1D. Runner1E distinto con doppio gate fresco, idle senza click monitorati, prevalidazione, code finite non eseguite, logginggap/wall-time e validatorpair che conserva i residui. Nessun run1E avviato: in attesa della disponibilità per il nuovo intervallo nativo.

Tentativo promozione baseline reale: il validatore esistente rifiuta VERIFIED perché input canonicoUNVERIFIED. Nessun indebolimento. Misura preliminare2capture storiche:ROI38righe pieno38,intermedio5000ms6; non equivalenti a quantità finali. Nessuna nuova fixture/raw; totali98/104/2 e status0VERIFIED/6Strong/98Unverified. Report e44stati in CAUSAL_MECHANICS_FINDINGS.md; fase non chiusa.

### Controlli della preparazione R008

TypeScript strict, lint, **149/149 test** (134 precedenti + 15 nuovi) e build passati, nessuno saltato. Fixture validation98/104, summary e model evaluator passati:0 MATCH/0 MISMATCH/104 UNKNOWN,246 campi sconosciuti, massimo errore null, NO_CANDIDATE. Native doctor PASS/READY_TO_LAUNCH senza input. Demo34/100 e reset0, import storico270→CURRENTDEMO UNKNOWN, produzione offline30/100 riusciti. Bundle e cache identici,14 immagini caricate. Git diff --check e audit isolamento passati;204 file storici byte-identici. Fase1E resta aperta, nessun nuovo run né abort. Nessun commit/push/PR/GitHub/cambio ramo/remoto/storia.

## Chiusura1E —13ottobre2026

L’utente ha sostituito il requisito di riproduzione esatta con un tuning originale approssimativo e autorizzato ricerca pubblica online, interrompendo le prove native. Stato CLOSED_WITH_APPROXIMATION.53nuovi raw/56fixture;totali151/160/2,0VERIFIED/9Strong/151Unverified.52sequenze OS complete,45score,7senza score,1abort al preflight (targetPID14452 assente, nessun input confermato).204file storici intatti.

Controlli4repeat ciascuno:270 e111. Pour1/2/3/4/5press a5000ms:111/111/111;89/87/87;63/63/65;39/38/41;17/17/20.10×500:3volte senza score. Due nuovi pairPour matched≤100ms conservano delta−48/−46; altri4unmatched restano espliciti. Niente capture durantehold:63/63/63;gap+2s:65/65/63. Short500/750 senza score2volte,1000→5/3,1500→15/17. Garnish3pairmatched270→370.

Nessun quantum, capacità canonica, coefficienteingrediente, bonusIce o formula di riferimento verificati. Nuovo profilo originale:240u, startupPour800ms,3u/125ms, garnish100, Ice500×2 cap1000, Shakebonus0/5/15/30, rischio8s/6azioni, scorebudget10.000. Sono scelte UNVERIFIED pronte per la prossima implementazione; demoPhase0/artwork invariati. Ml resta solo presentazione futura, mapping=null. Preserve information until research proves it irrelevant.

Fonti pubbliche e44punti:CAUSAL_MECHANICS_FINDINGS.md e APPROXIMATE_GAMEPLAY_TUNING.md. Nessuna Phase1F iniziata; niente commit/push/PR/GitHub/remoti/storia Git. SchermoRELEASED07:51:47UTC, Ruffle posseduto assente, ABORT conservato.

### Verifica finale della chiusura1E

TypeScript strict, lint, **155/155 test** (134 precedenti +21 nuovi), build e audit output PASS; nessun test saltato. Validation151raw/160fixture/2correzioni, summary e model evaluator riusciti:0MATCH/0MISMATCH/160UNKNOWN,452campi sconosciuti, errore massimo null, NO_CANDIDATE. Tre nuovi tentativi di VERIFIED rifiutati dal validatore esistente; adjudication restano Strong. Native doctorPASS senza input, processo posseduto assente.

Smoke conclusivi: preview propria4192,14/14immagini decodificate, lab/debug esclusi conquery; VersaSpace15u, Serve30/100, Reset0. Preview fermata, reload da cache e gioco offline30/100 riusciti; stato Pronto anche offline verificato dopo il completamento asincrono. DevLab:import fixture nuova case-IA-1E-G-AFTER-01 mostra REFERENCE370 eCURRENTDEMO UNKNOWN per tutti i campi, senza false comparazioni. Schede proprie14/15chiuse, schede utente conservate. Nessun nuovo test touch fisico.

Bundle invariato:38moduli,index-Ds8N4XYh.js264.41kB,index-C2Y8JjDS.css16.84kB,cache791c56d7c58dd2b0,shell7/artallow42. Nessun diff dominio/application/UI/public/lock o artwork; solo nuovo profilo pubblico non attivo fra i contenuti. 204file storici byte-identici. Git diff --checkPASS; branchphase1/causal-mechanics-isolation eHEAD3e1f06a conservati; nessun binario/cattura tracciato o GitHub/commit/push/PR/modifica remoti/storia. Web autorizzata dall’ultima richiesta, con provenienza documentata. Fase1E CLOSED_WITH_APPROXIMATION; stop.


## Phase 2A — produzione originale e freeze definitivo (2026-10-13)

Phase1 reference research CLOSED BY PRODUCT DECISION. Nessun nuovo dato/esperimento/cattura/runtime o ricerca web sul riferimento. Raw/fixture/correzioni/run/report storici rimasti invariati; test sugli hash204 file PASS. I comandi nativi sono soltanto manuali storici, non agganciati a dev/test/build/UI.

Pulizia Git esplicitamente autorizzata: snapshot di sicurezza, fast-forward del lavoro completato su main, checkpoint1E0dc7aed890e7465ec4da7691d50a724e18eb8bf8 e push normale. Origin/main sincronizzato0/0, worktree pulito prima della fase2A. Ripristinati143 file dopo conversione CRLF automatica del checkout contro gli hash preesistenti; attributi Git proteggono204 evidenze. Nessun valore osservato cambiato.

Gameplay originale attivo: ClassicInspiredTuningProfile,240u, startup800ms ad ogni Pour,3u/125ms,80 tick/pieno10800ms. Due Ice500 ciascuno, garnish100 una volta dopoShake, bonus Shake0/0/0/5/15/30 per count0..5. Sesto start o durata cumulativa8000ms causano failure immediata0. Tutto deriva da eventi canonici con quantità/tempi interi; scoring BigInt0..10000, ingredientweights8000/7200/4800 +balance1800. Nove tier originali e mapping arte separato. Nessuna conversione ml e nessun coefficiente esterno.

188/188 test, TypeScript strict, lint, build/audit e gitdiffcheck PASS. Smoke di produzione9925/10000 e offline1311/10000 con server fermo; startup, mouse/tastiera, release outside, Ice/garnish, Shakebonus/warning/failure, Serve/Reset verificati. Layout1024×768,1280×800,768×1024,390×844 e320×640 senza overflow; touch fisico non eseguito. AssetLab,VisualDebug,CompatLab e inspector DEV verificati, assenti in produzione anche conflagURL.
Shell7,allowlistart42 ondemand, zero art precached; artwork/lock invariati. La fase2A rimane UNCOMMITTED e UNPUSHED su main; HEAD è ancora il checkpoint1E. Vedere PHASE_2A_REPORT.md. Stopdopo2A.
