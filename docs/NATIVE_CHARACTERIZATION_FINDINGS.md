# Native characterization findings — fase 1D

Chiusura con limiti, 12 ottobre 2026. **Preserve information until research proves it irrelevant.** Le osservazioni sono black-box automatiche con lettura visiva, non esperimenti umani indipendenti. Nessun numero di scoring inserito nel prodotto.

| N. | Richiesta del report | Risultato |
| --- | --- | --- |
| 1 | Baseline script | baseline-270-v1; SHA-256 procedura15f8b7d409d79921c62f93cbcde8f12e77f91e6f42ff2637b2608be3507a08c0. |
| 2 | Procedura esatta | Vedi tabella sotto: orb100 → slot08 selection80 → Pour15000 → Shake1000 → Serve80 ms. Cold launch, client600×470, DPI120, attesa risultato30000 ms. |
| 3 | Cold baseline | 6 tentativi / 5 completi; processi distinti. |
| 4 | Sequenza baseline | ABORTED senza score; 270,270,270,270,270. |
| 5 | Gate3/3 | PASS |
| 6 | Gate5/5 | PASS |
| 7 | Evidenza baseline | STRONGLY_SUPPORTED della relazione procedura/output nel runtime fissato; non VERIFIED, input canonico UNMAPPED. |
| 8 | Abort | Vedi tabella completa sotto; movement del cursore nei due tentativi già documentati. Cause esterne non attribuite. |
| 9 | Raw1D | 69 |
| 10 | Fixture1D | 74 |
| 11 | Totali | 98 raw / 104 fixture / 2 correzioni storiche |
| 12 | Pour-duration | Tre coppie per14000 e14500: tutti270 contro270, delta0. Altri livelli nella curva sotto; nessuna media o esclusione degli score discordanti. |
| 13 | Uno vs più Pour | B gate passato da5000=111 x3 e full=270 x5. Una coppia:1x5000 →111;1667+1667+1666 →65, delta-46. Totali OS5001,8683 vs5023,1969ms:21,3286ms differenza. UNVERIFIED, nessuna equivalenza di quantità; contano startup/pause/tick da isolare. |
| 14 | Ice | Target storici non convalidati; clic dopo pieno270 contro270 non provano assenza di bonus. Prove prima del Pour e dati sotto. Capacità/accettazione restano alternative. |
| 15 | Garnish | Prima Shake:270/270 (un pair, accettazione non stabilita). Dopo Shake: tre cold pair270→370, slice visibile, delta100 ripetuto. Doppio clic dopoShake370 in una prova. Relazione circoscritta Strong; evitare coefficiente globale. |
| 16 | Shake-count | E-0..5: richiesti1000ms per azione. Conteggio e cumulativa cambiano insieme; risultati/tempi sotto. Non inferire bonus dal conteggio solo. |
| 17 | Shake-duration | F-1/2/4 richiedono4000ms totali; misure reali e pause diverse sotto. Una sola prova per setting: nessuna regola promossa. |
| 18 | Ordine | G A→B/B→A GATED: due ingredienti etichettati e Pour ripetibili assenti. Placement dei modificatori documentato separatamente. |
| 19 | Curva ingrediente | Ascissa = procedura di input nativa richiesta/misurata, non VolumeUnit. Vedi punti e differenze sotto. |
| 20 | Quantum | UNVERIFIED / non stabilito. Plateau al pieno non è quantum interno. Nessuna mappatura durata→PourTick. Nessuna ricerca fine probante su molteplici confini. |
| 21 | Capacità | Indicatore pieno osservato; plateau14000/14500/15000. Capacità numerica ignota; clamp/ultimo incremento/parziale/overflow non isolati. Nessuna unità ml. |
| 22 | Explosion | Sweep:5000 normale275;10000 e15000 esplosione visibile e auto failure0 primaServe. Bracket grossolano della procedura continua5–10s richiesti; non la prima soglia interna. Mid-capture15000 a~7,5s mostra ancora agitazione: release/decisione finale da isolare. Nessuna replica/fine boundary. |
| 23 | Ingredienti | Selezione dello slot08/blu ripetibile; ref.slot08-unidentified. Nessuna identità nominale convalidata da label leggibile; skin produzione indipendenti. |
| 24 | Coefficienti | NOT TESTED / GATED: quantità e quantum mancanti, nessuna tabella o regressione dei coefficienti. |
| 25 | Reaction | ID neutrali r01, r01-garnished, ref.pose.idle-after-serve e ref.react.explosion; pose di servizio/bevuta, inclinazione e transizione risultato osservate. Variabilità temporale conservata; nessun intervallo numerico/tier/esclusività provato. |
| 26 | VERIFIED | 0 fixture; nessuna regola meccanica. Hash/isolamento/test sono controlli del nostro software. |
| 27 | STRONGLY_SUPPORTED | 6 fixture cumulative; vecchia relazione1C, baseline1D, plateau Pour, nuovo Pour5000 e limone dopoShake. |
| 28 | UNVERIFIED | 98 fixture cumulative; tutti i raw restano UNVERIFIED/UNMAPPED. |
| 29 | REJECTED | Richiesta ms = consegna OS esatta respinta dalle misure; OS consegnato = azione meccanica accettata è criterio insufficiente. IceChunks/garnishLemons respinti come punti modificatore: selezionavano bottiglie. Nessuna formula respinta senza dati adeguati. |
| 30 | Gate modello | NON RAGGIUNTO:0 input canonici VERIFIED; non15 fixture esatte con due ingredienti validati. Molti score osservati non bastano. |
| 31 | Scorer candidato | ASSENTE. Non alterato lo scorer demo, ancora NOT YET COMPATIBILITY-VERIFIED. |
| 32 | Metriche modello | 0 MATCH /0 MISMATCH /104 UNKNOWN;246 campi sconosciuti; errore massimo null; complete-match coverage0% sull’intero dataset; accuratezza numerica esatta N/A (nessun candidato/input canonico). |
| 33 | Ipotesi esterne | Vedi confronto sotto: valori di terzi non aggiunti al dataset/scoring. Nessuna stima web sostituisce una misura. |
| 34 | Prossimi esperimenti | Convalidare completamento animazione Ice prima Pour e controllo delay-matched per il limone; replicare setting brevi prima dei confini; ripetere Shake e bracket del fallimento; label di un secondo ingrediente; replicare B, poi G, quantum e coefficienti. Solo nuovo incarico, stop dopo1D. |
| 35 | Test | 134 passati; nessun test saltato. |
| 36 | TS/lint/build | PASS: TypeScript strict, ESLint,134/134 tests, production build. |
| 37 | Isolamento | PASS: bundle38 moduli invariato, nessun originale/binario/cattura/CLI/mappe/native code; guard build e Git audit passati. |
| 38 | Git | HEAD60e3252a847dd2f91d4dba3e131b12e9127ae157 invariato; ramo locale autorizzato phase1/quantitative-native-characterization. Nessun commit/push/PR/GitHub/remoti. |

## Identità e baseline riproducibile

SWF ia-therightmix-ede221ad99e03173:693558 byte, SHA-256 ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7. Ruffle0.8.0-nightly.2026.10.11-nightly, commit8c6f3e95203a765c39639ee9366abe8340830709; exe SHA-256 b0840c1db59ee428ab35015fdd155a09465d6649fb19de09ee34d352dd247656. Ambiente ia-therightmix-ede221ad99e03173__ruffle-desktop-nightly-20261011-win64-gui; Windows, DPI120/125%, DX12 richiesto. GPU/FPS/fedeltà rispetto a Flash originale non misurati.

| Azione | Target stage | Client | Hold richiesto ms |
| --- | --- | --- | --- |
| Start orb | 300,410 | 300,440 | 100 |
| Select slot08 | 343,115 | 343,145 | 80 |
| Pour | 75,413 | 75,443 | 15000 |
| Shake | 207,413 | 207,443 | 1000 |
| Serve | 341,413 | 341,443 | 80 |

Cold: stop solo processo posseduto → doctor hash/versione → fresh launch600×440 stage, memory storage, URL/TCP/filesystem denied → attivazione/setup → attesa1500 ms e intro fingerprint96245237ee6b3eb89c99cca6e16e41c6d3fa72c178e8895ed67b50a8baadc60c. Toolbar30px, client600×470. Move before down50ms, after release500ms, cattura/geometry settling250ms. Attesa postServe30000ms campionata ogni2000ms con overhead registrato. Non sono frame Flash misurati. Origin desktop cambia solo fra run; ogni geometria resta congelata durante la sequenza.

Il file baseline archivia il suo stato alla creazione: non viene riscritto dopo il gate. L’adjudication e le review successive descrivono il risultato5/5. I due log storici1C ricostruiscono le richieste, non le latenze nuove: i release-to-next-down1C ~0,6–0,7s differiscono dai~1,1–1,2s1D per il controllo di cattura aggiunto. Soltanto i cinque run nuovi contano per il gate.

## Curva di input / Pour

| Hold richiesto ms | Score osservati |
| --- | --- |
| 5000 | 111, 111, 111 |
| 10000 | 245, 246, 246 |
| 14000 | 270,270,270 |
| 14500 | 270,270,270 |
| 15000 | 270 (cinque baseline più controlli) |

Differenze sul plateau:14000→14500=0,14500→15000=0 per i risultati ripetuti. Per livelli non ripetibili non viene usata una media né una singola finite difference come coefficiente. Ascissa NativePourLevel: duration OS non quantità. Gli ID, le misure e tutte le coppie sono nel ledger; no millilitri o VolumeUnit del riferimento. B eseguito in una coppia dopo il gate5000/full; curva interna e quantum richiedono un protocollo più ripetibile.

## Tutti i confronti control/treatment

| Pair | Control IDs | Treatment IDs | Score control | Score treatment | Delta | Stato |
| --- | --- | --- | --- | --- | --- | --- |
| 1D-A-10000-pair-1 | IA-1D-CONTROL-20 | IA-1D-A-10000-01 | 270 | 245 | -25 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-A-10000-pair-2 | IA-1D-CONTROL-22 | IA-1D-A-10000-02 | 270 | 246 | -24 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-A-10000-pair-3 | IA-1D-CONTROL-24 | IA-1D-A-10000-03 | 270 | 246 | -24 | OBSERVED DELTA — NOT A MECHANIC |
| A-14000-01-retry2 | IA-1D-CONTROL-07 | IA-1D-A-14000-01 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| A-14000-02-retry2 | IA-1D-CONTROL-09 | IA-1D-A-14000-02 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| A-14000-03-retry2 | IA-1D-CONTROL-11 | IA-1D-A-14000-03 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| A-14500-01-retry2 | IA-1D-CONTROL-08 | IA-1D-A-14500-01 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| A-14500-02-retry2 | IA-1D-CONTROL-10 | IA-1D-A-14500-02 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| A-14500-03-retry2 | IA-1D-CONTROL-12 | IA-1D-A-14500-03 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-A-5000-pair-1 | IA-1D-CONTROL-19 | IA-1D-A-5000-01 | 270 | 111 | -159 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-A-5000-pair-2 | IA-1D-CONTROL-21 | IA-1D-A-5000-02 | 270 | 111 | -159 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-A-5000-pair-3 | IA-1D-CONTROL-23 | IA-1D-A-5000-03 | 270 | 111 | -159 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-B-pair-01 | IA-1D-B-1-01 | IA-1D-B-3-01 | 111 | 65 | -46 | OBSERVED DELTA — NOT A MECHANIC |
| C-one-01 | IA-1D-CONTROL-13 | IA-1D-C-1-01 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-C-visible-1-pair-01 | IA-1D-CONTROL-14 | IA-1D-C-visible-1-01 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-C-visible-2-pair-01 | IA-1D-CONTROL-15 | IA-1D-C-visible-2-01 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-C-visible-early-1-pair-01 | IA-1D-CONTROL-28 | IA-1D-C-visible-early-1-01 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-C-visible-early-2-pair-01 | IA-1D-CONTROL-29 | IA-1D-C-visible-early-2-01 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN / INCOMPLETE |
| A-14000-01 | IA-1D-CONTROL-01 |  | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN / INCOMPLETE |
| 1D-D-visible-before-pair-01 | IA-1D-CONTROL-16 | IA-1D-D-visible-before-01 | 270 | 270 | 0 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-D-visible-after-pair-01 | IA-1D-CONTROL-17 | IA-1D-D-visible-after-01 | 270 | 370 | 100 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-D-visible-repeat-pair-01 | IA-1D-CONTROL-18 | IA-1D-D-visible-repeat-01 | 270 | 370 | 100 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-D-visible-after-pair-02 | IA-1D-CONTROL-30 | IA-1D-D-visible-after-02 | 270 | 370 | 100 | OBSERVED DELTA — NOT A MECHANIC |
| 1D-D-visible-after-pair-03 | IA-1D-CONTROL-31 | IA-1D-D-visible-after-03 | 270 | 370 | 100 | OBSERVED DELTA — NOT A MECHANIC |

Il delta è tra score visualizzati per procedure nel medesimo ambiente. Non è automaticamente un bonus: quantità, stato, capacità, order e accettazione devono essere isolati. L’azione aggiuntiva introduce anche una pausa/cattura: un controllo delay-matched è un prossimo esperimento necessario per isolare la causalità. Le coppie fallite restano nella tabella, senza delta0 inventato.

## Shake: richieste e misure

| ID | Count | Hold richiesti ms | Hold effettivi ms | Totale effettivo ms | Score | Reaction / phase |
| --- | --- | --- | --- | --- | --- | --- |
| IA-1D-E-0-01 | 0 |  |  | 0.0000 | UNKNOWN | ref.phase.awaiting-shake / preparation-awaiting-shake |
| IA-1D-E-1-01 | 1 | 1000 | 1009.5163 | 1009.5163 | 270 | ref.pose.idle-after-serve / numeric result |
| IA-1D-E-2-01 | 2 | 1000, 1000 | 1009.6609, 1009.6764 | 2019.3373 | 270 | ref.pose.idle-after-serve / numeric result |
| IA-1D-E-3-01 | 3 | 1000, 1000, 1000 | 1013.5799, 1003.6317, 1001.4495 | 3018.6611 | 275 | ref.pose.idle-after-serve / numeric result |
| IA-1D-E-4-01 | 4 | 1000, 1000, 1000, 1000 | 1004.3439, 1009.8033, 1011.2407, 1010.7022 | 4036.0901 | 285 | ref.pose.idle-after-serve / numeric result |
| IA-1D-E-5-01 | 5 | 1000, 1000, 1000, 1000, 1000 | 1009.5695, 1011.3290, 1015.1797, 1013.6958, 1005.7814 | 5055.5554 | 300 | ref.pose.idle-after-serve / numeric result |
| IA-1D-F-1-01 | 1 | 4000 | 4011.0953 | 4011.0953 | 275 | ref.pose.idle-after-serve / numeric result |
| IA-1D-F-2-01 | 2 | 2000, 2000 | 2000.6426, 2005.8548 | 4006.4974 | 285 | ref.pose.idle-after-serve / numeric result |
| IA-1D-F-4-01 | 4 | 1000, 1000, 1000, 1000 | 1002.6317, 1008.1144, 1011.9144, 1000.4913 | 4023.1518 | 285 | ref.pose.idle-after-serve / numeric result |
| IA-1D-X-10000-01 | 1 | 10000 | 10000.9398 | 10000.9398 | 0 | ref.react.explosion / failure-result |
| IA-1D-X-15000-01 | 1 | 15000 | 15007.2749 | 15007.2749 | 0 | ref.react.explosion / failure-result |
| IA-1D-X-5000-01 | 1 | 5000 | 5007.1957 | 5007.1957 | 275 | ref.pose.idle-after-serve / numeric result |

La cumulativa richiesta F è4000ms; quella misurata differisce e ogni nuova operazione introduce pause e catture. Non si assume uguale liquido o uguale esposizione Flash. E varia count e tempo insieme. I campioni non provano soglie millisecondo per millisecondo; un risultato esplosivo si distingue da un abort del helper.

## Tutti gli esiti1D

| Run | Cold | OS outcome | Score/phase | Reaction | Hold effettivi principali ms |
| --- | --- | --- | --- | --- | --- |
| IA-1D-A-10000-01 | true | COMPLETED_INPUT | 245 | ref.react.r01 | pour:10003.3938; shake:1012.2615 |
| IA-1D-A-10000-02 | true | COMPLETED_INPUT | 246 | ref.react.r01 | pour:10000.8068; shake:1009.8210 |
| IA-1D-A-10000-03 | true | COMPLETED_INPUT | 246 | ref.react.r01 | pour:10000.4301; shake:1009.3471 |
| IA-1D-A-14000-01 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:14008.3001; shake:1007.1982 |
| IA-1D-A-14000-02 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:14007.0408; shake:1012.2649 |
| IA-1D-A-14000-03 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:14001.2990; shake:1009.8356 |
| IA-1D-A-14500-01 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:14512.1641; shake:1010.6483 |
| IA-1D-A-14500-02 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:14511.6335; shake:1011.3921 |
| IA-1D-A-14500-03 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:14502.5263; shake:1013.5760 |
| IA-1D-A-5000-01 | true | COMPLETED_INPUT | 111 | ref.react.r01 | pour:5011.2625; shake:1012.9540 |
| IA-1D-A-5000-02 | true | COMPLETED_INPUT | 111 | ref.react.r01 | pour:5001.2082; shake:1009.9900 |
| IA-1D-A-5000-03 | true | COMPLETED_INPUT | 111 | ref.react.r01 | pour:5005.1241; shake:1005.4157 |
| IA-1D-B-1-01 | true | COMPLETED_INPUT | 111 | ref.react.r01 | pour:5001.8683; shake:1009.3870 |
| IA-1D-B-3-01 | true | COMPLETED_INPUT | 65 | ref.react.r01 | pour:1677.1857; pour:1668.6941; pour:1677.3171; shake:1010.4097 |
| IA-1D-BASELINE-01 | true | ABORTED | automation-abort | not-confirmed | UNKNOWN |
| IA-1D-BASELINE-02 | true | COMPLETED_INPUT | 270 | ref.sequence.pour-to-glass-result | pour:15007.1312; shake:1013.8702 |
| IA-1D-BASELINE-03 | true | COMPLETED_INPUT | 270 | ref.sequence.pour-to-glass-result | pour:15006.8835; shake:1006.9799 |
| IA-1D-BASELINE-04 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15005.1899; shake:1012.7514 |
| IA-1D-BASELINE-05 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15005.1672; shake:1013.2977 |
| IA-1D-BASELINE-06 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15012.8245; shake:1010.7399 |
| IA-1D-C-1-01 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15005.6905; shake:1013.5882 |
| IA-1D-C-visible-1-01 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15000.7131; iceVisible:93.1245; shake:1011.5262 |
| IA-1D-C-visible-2-01 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15010.7541; iceVisible:80.9266; iceVisible:93.6851; shake:1013.4231 |
| IA-1D-C-visible-early-1-01 | true | COMPLETED_INPUT | 270 | ref.react.r01 | iceVisible:91.3784; pour:15008.4818; shake:1010.6922 |
| IA-1D-C-visible-early-2-01 | true | COMPLETED_INPUT | preparation-no-result | ref.phase.preparation-no-result | iceVisible:80.4448; iceVisible:92.7073; pour:15012.2121; shake:1002.8317 |
| IA-1D-CONTROL-01 | true | ABORTED | automation-abort | not-confirmed | UNKNOWN |
| IA-1D-CONTROL-07 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15003.7634; shake:1008.3091 |
| IA-1D-CONTROL-08 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15006.1322; shake:1013.5985 |
| IA-1D-CONTROL-09 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15013.5496; shake:1009.0789 |
| IA-1D-CONTROL-10 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15000.5158; shake:1002.7487 |
| IA-1D-CONTROL-11 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15001.4585; shake:1010.7581 |
| IA-1D-CONTROL-12 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15004.0288; shake:1001.6538 |
| IA-1D-CONTROL-13 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15006.3468; shake:1011.8264 |
| IA-1D-CONTROL-14 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15006.8536; shake:1011.9050 |
| IA-1D-CONTROL-15 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15008.7430; shake:1018.1341 |
| IA-1D-CONTROL-16 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15002.0910; shake:1000.7855 |
| IA-1D-CONTROL-17 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15001.3120; shake:1012.0251 |
| IA-1D-CONTROL-18 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15016.2320; shake:1008.9774 |
| IA-1D-CONTROL-19 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15000.5039; shake:1003.4503 |
| IA-1D-CONTROL-20 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15006.3510; shake:1003.2227 |
| IA-1D-CONTROL-21 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15003.0552; shake:1011.1546 |
| IA-1D-CONTROL-22 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15003.9520; shake:1010.3603 |
| IA-1D-CONTROL-23 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15005.4846; shake:1009.5674 |
| IA-1D-CONTROL-24 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15013.0239; shake:1010.8342 |
| IA-1D-CONTROL-28 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15010.4666; shake:1007.4960 |
| IA-1D-CONTROL-29 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15007.2964; shake:1013.1985 |
| IA-1D-CONTROL-30 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15000.9895; shake:1000.7695 |
| IA-1D-CONTROL-31 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15012.1139; shake:1009.0905 |
| IA-1D-D-visible-after-01 | true | COMPLETED_INPUT | 370 | ref.react.r01-garnished | pour:15006.1423; shake:1013.5378; garnishVisible:82.0779 |
| IA-1D-D-visible-after-02 | true | COMPLETED_INPUT | 370 | ref.react.r01-garnished | pour:15014.9436; shake:1009.6510; garnishVisible:80.6349 |
| IA-1D-D-visible-after-03 | true | COMPLETED_INPUT | 370 | ref.react.r01-garnished | pour:15005.2481; shake:1012.7869; garnishVisible:92.8944 |
| IA-1D-D-visible-before-01 | true | COMPLETED_INPUT | 270 | ref.react.r01 | pour:15005.8517; garnishVisible:93.4863; shake:1006.3726 |
| IA-1D-D-visible-repeat-01 | true | COMPLETED_INPUT | 370 | ref.react.r01-garnished | pour:15004.6157; shake:1012.9359; garnishVisible:92.5151; garnishVisible:92.8185 |
| IA-1D-DIAG-GARNISH-01 | true | COMPLETED_INPUT | selection-diagnostic | not-served |  |
| IA-1D-DIAG-GARNISH-V2-01 | true | COMPLETED_INPUT | modifier-diagnostic | not-served | garnishVisible:93.8122 |
| IA-1D-DIAG-ICE-01 | true | COMPLETED_INPUT | selection-diagnostic | not-served |  |
| IA-1D-DIAG-ICE-V2-01 | true | COMPLETED_INPUT | modifier-diagnostic | not-served | iceVisible:92.9201 |
| IA-1D-E-0-01 | true | COMPLETED_INPUT | preparation-awaiting-shake | ref.phase.awaiting-shake | pour:15003.0383 |
| IA-1D-E-1-01 | true | COMPLETED_INPUT | 270 | ref.pose.idle-after-serve | pour:15006.3484; shake:1009.5163 |
| IA-1D-E-2-01 | true | COMPLETED_INPUT | 270 | ref.pose.idle-after-serve | pour:15013.2875; shake:1009.6609; shake:1009.6764 |
| IA-1D-E-3-01 | true | COMPLETED_INPUT | 275 | ref.pose.idle-after-serve | pour:15003.0434; shake:1013.5799; shake:1003.6317; shake:1001.4495 |
| IA-1D-E-4-01 | true | COMPLETED_INPUT | 285 | ref.pose.idle-after-serve | pour:15013.5418; shake:1004.3439; shake:1009.8033; shake:1011.2407; shake:1010.7022 |
| IA-1D-E-5-01 | true | COMPLETED_INPUT | 300 | ref.pose.idle-after-serve | pour:15013.3380; shake:1009.5695; shake:1011.3290; shake:1015.1797; shake:1013.6958; shake:1005.7814 |
| IA-1D-F-1-01 | true | COMPLETED_INPUT | 275 | ref.pose.idle-after-serve | pour:15004.6405; shake:4011.0953 |
| IA-1D-F-2-01 | true | COMPLETED_INPUT | 285 | ref.pose.idle-after-serve | pour:15004.5044; shake:2000.6426; shake:2005.8548 |
| IA-1D-F-4-01 | true | COMPLETED_INPUT | 285 | ref.pose.idle-after-serve | pour:15008.0705; shake:1002.6317; shake:1008.1144; shake:1011.9144; shake:1000.4913 |
| IA-1D-X-10000-01 | true | COMPLETED_INPUT | 0 | ref.react.explosion | pour:15004.4097; shake:10000.9398 |
| IA-1D-X-15000-01 | true | COMPLETED_INPUT | 0 | ref.react.explosion | pour:15004.4504; shake:15007.2749 |
| IA-1D-X-5000-01 | true | COMPLETED_INPUT | 275 | ref.pose.idle-after-serve | pour:15006.2360; shake:5007.1957 |

## Abort e informazioni preservate

| Run | Motivo | Sessione |
| --- | --- | --- |
| IA-1D-BASELINE-01 | Exception calling "Hold" with "8" argument(s): "Cursor moved externally: expected=244,641 actual=232,614" | NATIVE-20261012T125548503-2840 |
| IA-1D-CONTROL-01 | Exception calling "Hold" with "8" argument(s): "Cursor moved externally: expected=212,609 actual=218,609" | NATIVE-20261012T131240147-19832 |

Due abort per cursor movement non hanno score; rilascio del pulsante posseduto e stop senza proseguire nel trattamento. Altri abort, se presenti, sono riportati integralmente nei ledger. Non attribuire la causa a input fisico, scheduling o DPI senza ulteriore prova. I quattro diagnostici di target, Ice early-two e E-0 senza Shake non sono Serve riusciti e non hanno score0. E-0 resta alla schermata Time to shake dopo il tentativo Serve; una sola prova, nessuna regola globale promossa. Telemetria parziale, originali, catture, reazioni, gap, richieste e tempi completi restano nei file locali. Il report contiene soltanto metadata/testo; nessuna immagine originale distribuita.

## External hypothesis comparison

| Claim esterno | Classificazione | Motivo |
| --- | --- | --- |
| Massimo10245 | NOT YET TESTABLE | Non cercato un massimo; quantità/ingredienti non calibrati. |
| Coefficienti additivi | NOT YET TESTABLE | Quantum/quantità e seconda identità mancanti. |
| Ice+500/+1000 | NOT YET TESTABLE | Clic dopo pieno senza accettazione; prove early hanno confondenti di capacità. |
| Garnish+100 | SUPPORTED BY OUR DATA (solo procedura fissata) | Tre pair indipendenti dopoShake270→370; slice visibile e delta100 ripetuto. Non generalizzare a tutti i mix. |
| Garnish+200 | CONTRADICTED BY OUR DATA (solo procedura fissata) | Per i tre pair accettati il delta osservato è100; non si respinge una variante di build o una condizione non testata. |
| Bonus discreti Shake | NOT YET TESTABLE | E1..5:270,270,275,285,300; F a4000ms:275,285,285. Differenze osservate, ma count/tempo/pause non isolati e setting singoli; nessuna tabella esatta di bonus. |
| Soglie reazioni | NOT YET TESTABLE | Famiglie visuali e pochi score non delimitano intervalli rigorosi. |

L’utente ha autorizzato una ricerca online condizionale se tempo/token fossero insufficienti. Nessuna consultazione web è stata necessaria: le cifre sopra restano ipotesi già nominate nel prompt, confrontate soltanto con osservazioni indipendenti. Non sono input di modello.

## Validazione, isolamento e chiusura

TypeScript/lint/134 test/build PASS. Fixture validation98 raw/104 fixture; summary69 nuovi cold run,61 risultati numerici,59 servizi riusciti,2 fallimenti automatici primaServe,2 abort,4 target diagnostic e2 procedure senza risultato; nessuna review in sospeso.0 VERIFIED /6 STRONGLY_SUPPORTED /98 UNVERIFIED. Baseline gate3/3 e5/5 PASS, con un primo abort conservato. Model evaluator0 MATCH/0 MISMATCH/104 UNKNOWN,246 campi sconosciuti, errore massimo null; accuratezza esatta N/A. Doctor PASS/READY_TO_LAUNCH senza input, targetScreenshotVerified=false perché il processo posseduto è chiuso.

Smoke dev: fixture case-IA-1D-BASELINE-02 importata, REFERENCE270 /CURRENT DEMO UNKNOWN; nessun falso cocktail vuoto. Asset Lab cambia barista02, studio, banco e bottiglie fallback senza eventi; Visual Debug1280×720 presente. Demo Versa da tastiera15u, Ice1, Shake da tastiera, Serve34/100, Reset0. Lab pour12/Ice1/3shake800/Serve, export14 eventi UNVERIFIED e nessuno score di riferimento, Reset15 eventi con storia conservata e gioco normale0u. Nessun nuovo test touch fisico.

Smoke produzione: prima4177 mostrava una cache preesistente di fase0.2 (index-hqeSj2Jj.js/index-C7OM6cHy.css); il reload non l’ha aggiornata durante questa prova. Questa osservazione non viene nascosta né attribuita a1D: gli output di build sono invariati. Su origine locale nuova4188 la build corrente index-Ds8N4XYh.js è verificata,14 immagini caricate, nessun Compat/Asset/VisualDebug anche con tutte le query. Preview propria fermata: reload da cache della build corrente riuscito,14 immagini decodificate, Versa15u/Serve30/100, stato Pronto anche offline. La migrazione di cache su vecchie origini resta una questione separata; non modificato il service worker in1D.

Isolamento: build guard sul dist effettivo,50 file pubblici; zero SWF/EXE/DLL/ZIP/capture/local research files nel dist e in Git. Zero diff in src/domain/src/application/src/content/public/package-lock; unico UI diff nel Lab DEV. Bundle38 moduli,264,41kB JS,16,84kB CSS,cache791c56d7c58dd2b0,shell7/artwork allowlist42. Git diff --check PASS;61 file storici identici. Nessun sito esterno/GitHub/download/commit/push/PR/remoto.

Finestra finale: diagnostiche dalle18:13:43UTC e ultimo run finito19:14:21UTC, circa un’ora. L’ultimo B treatment è stato terminato con un piano esplicito nuovo (deadline19:15) dopo che il piano originario aveva rispettato il buffer90s. Nessun guard input ridotto. Ruffle fermato, richiesta schermo rilasciata; nessun timeout persistente modificato.

Ramo locale phase1/quantitative-native-characterization creato dal ramo1C dopo autorizzazione esplicita; HEAD non avanzato. Nessun commit/push/PR, accesso GitHub, modifica remoti o bytecode. I61 file storici della snapshot restano byte-identici. Schermo: RELEASED verificato2026-10-12T19:15:13.5725526Z; settingsChanged=false; timer Windows invariati.

Fixture/catture sono ricerca. Origine binari approvata in1C; in1D nessun download. Score/stati demo, dominio, application, artwork/public/package-lock restano invariati. Le quantità canoniche sono interi deterministici indipendenti dai ms OS e da ml, che restano unità di presentazione. Nessun account/economia/progressione/backend/vault implementato. **Stop dopo1D.**
