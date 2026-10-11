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
