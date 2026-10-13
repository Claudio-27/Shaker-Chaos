# Reference findings — fase 1B

Data: 2026-10-11. Dataset: 16 acquisizioni diagnostiche automatiche, 16 ResearchCase UNVERIFIED, una rettifica di trascrizione append-only. Zero score numerici; zero input canonici calibrati. La caratterizzazione numerica non è riuscita. La fase si arresta qui come richiesto; nessuna compatibilità dichiarata.

> Preserve information until research proves it irrelevant.

## Build e ambiente

Riferimento primario: [Internet Archive — flash_therightmix](https://archive.org/details/flash_therightmix), attribuito a Liquid Light Group; [Web Design Museum](https://www.webdesignmuseum.org/flash-games/the-right-mix-in-2013) lo collega e mostra un player Flash. Titolo visibile The Right Mix, branding LandSecurities; nessuna versione del gioco visibile. Il 2013 del catalogo museale non è una data di compilazione dimostrata.

referenceBuild: **ia-therightmix-ede221ad99e03173**. SWF 693558 byte, SHA-256 **ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7**. Byte ottenuti dal download pubblico soltanto per hashing/esecuzione, mai salvati. Il server accetta la fonte Archive o il link pubblico FlashGa.me soltanto quando l'hash coincide; non mescola build differenti. HTTP 500 intermittenti documentati.

Primo tentativo nel museo: **wdm-rightmix-2013-observable-20261011**, hash sconosciuto. Non è dimostrata l'identità dei suoi byte con Archive: i cinque record museali restano separati dagli undici Archive.

Windows, browser Codex in-app e Chrome tramite estensione. Versioni browser non esposte dall'interfaccia di controllo, quindi non inventate. Ruffle **0.7.1** osservato nel menu e fissato nel wrapper via CDN npm. Renderer automatico iniziale; Canvas richiesto successivamente, backgroundExecutionMode mainThread. Nessun override del frame rate. Non confrontato con Adobe Flash originale; fps, tick effettivi e correttezza dell'emulazione restano ignoti. [API pubblica Ruffle](https://ruffle.rs/js-docs/master/interfaces/Player.PlayerV1.html), [opzioni del player](https://ruffle.rs/js-docs/master/interfaces/Config.BaseLoadOptions.html).

## VERIFIED

**Nessuna regola meccanica del riferimento.** Hash e isolamento sono controlli sull'identità/esecuzione e sul nostro software, non prove di scoring. Non confondere i test passati con compatibilità.

## STRONGLY SUPPORTED

**Nessuna regola meccanica promossa.** Non è stata ottenuta una coppia input/output numerico affidabile, neppure un baseline non vuoto ripetibile. Tooltip, selezione della bottiglia e movimento della mano non provano una quantità aggiunta.

## UNVERIFIED HYPOTHESES

| ID / claim candidato | Case IDs | Build | Confidenza e caveat |
| --- | --- | --- | --- |
| H-B01: Serve a vuoto potrebbe essere ignorato | case-WDM-EMPTY-01/02/03; case-IA-EMPTY-01 | WDM / IA separatamente | low: schermata preparazione invariata, score assente; affidabilità del comando irrisolta. Repeats museali nella stessa sessione; Reset non verificato. Score assente NON significa 0. |
| H-B02: Pour potrebbe avere latenza, tick o dipendenza da scheduling | case-WDM-POUR-DIAG-01; case-IA-POUR-DIAG-01; case-IA-CHROME-DIAG-01/02 | WDM / IA separatamente | low: gesti cambiano la posa, ma quantità e score non misurati. Non si attribuisce il fallimento al gioco anziché all'ambiente. |
| H-B03: prima agitazione potrebbe limitare successive aggiunte | case-IA-PHASE-EXTRAS-DIAG-01 | IA | low: Shake→Pour tentato senza baseline liquido noto; niente conclusione su accettazione/fase. |
| H-B04: ice e limone potrebbero richiedere selezione e un'altra azione | case-IA-ICE-DIAG-01; case-IA-PHASE-EXTRAS-DIAG-01 | IA | low: tooltip/selezione osservati; quantità, ripetizioni e bonus non stabiliti. |
| H-B05: scoring additivo, modificatori, count shake, soglie, massimo 10245 | nessun caso probante | IA futura | low: NOT TESTED. Valori di terzi non usati come dati. Nessun coefficiente, bonus, soglia o massimo proposto. |

## REJECTED HYPOTHESES

Queste confutazioni riguardano la **misura**, non la formula del gioco.

| ID / claim respinto | Case IDs | Build | Confidenza e caveat |
| --- | --- | --- | --- |
| H-M01: durata richiesta = durata DOM esatta = durata Flash esatta | case-IA-EMPTY-01; case-IA-POUR-DIAG-01; case-IA-CHROME-DIAG-01; case-IA-PHASE-EXTRAS-DIAG-01 | IA | high per disuguaglianza richiesta/DOM: 100→123, 300→322, 5000→5021, 3000→3014, 1500→1532 ms. Durata Flash non misurata; nessuna precisione al millisecondo rivendicata. |
| H-M02: evento sintetico consegnato implica operazione accettata e quantità nota | case-IA-SYNTH-MOUSE-01; case-IA-SYNTH-POINTER-01 | IA | high come criterio di prova insufficiente; low sulla causa tecnica. Eventi non fidati, una pressione sovrapposta e un right-click non pianificato invalidano l'inferenza meccanica. |

## Esperimenti effettivi e copertura

**AUTOMATED OBSERVATION:** tutti i 16 record. Click, hold richiesti, selezione, attese e drag tramite API browser; rendering letto visivamente dall'agente. I fallback DOM asincroni sono etichettati sintetici, non simulati come input fisici. Nessuna OCR, lettura di variabili Flash, bytecode, costanti, sorgente o trace interno.

**MANUAL OBSERVATION:** zero. La lettura visiva dell'agente dopo input automatici non è un esperimento umano indipendente.

| Esperimento richiesto | Stato raggiunto |
| --- | --- |
| 1 vuoto | quattro tentativi Serve osservati (tre museo + uno Archive); Reset non disponibile/verificato |
| 2 minimo / 3 repeatability | hold 100/300/500/1000/2000/3000/4000/5000 ms tentati in diagnostica; nessun quantum affidabile, nessun cocktail ripetibile |
| 4 capacità/ultimo incremento | NOT TESTED: quantum/quantità e aggiunta affidabile mancanti |
| 5 Pour→Shake→Pour | sottosequenza tentata; ice/limone selezionati dopo Shake, esiti meccanici sconosciuti |
| 6 uno vs più pour a stesso totale | NOT TESTED: impossibile attestare totali uguali |
| 7 A→B vs B→A | NOT TESTED: quantità e identità meccaniche non calibrate |
| 8 ice / 9 garnish | tentativi di selezione/aggiunta, senza baseline né delta di score; confronti controllati NOT TESTED |
| 10 count/durata | un hold Shake 1500 ms richiesto / 1532 ms DOM, senza liquido noto; serie controllate 0..5 e 1/2/4 NOT TESTED |
| shake coarse/fine, esplosioni | NOT TESTED: non stabilita una condizione non vuota sicura |
| ingredienti, finite differences, coppie, rounding | NOT TESTED: nessuna misura di q o score |
| soglie reazioni e 10245 | NOT TESTED; 10245 non riprodotto, massimo non dimostrato |

Nessuna conversione ml. **ObservedQuantum** resta un simbolo ignoto; non viene costruito un PourTick a partire dalla durata richiesta. VolumeUnit intere della demo restano indipendenti. Limiti MAX_SAFE_INTEGER nel manifest sono una busta di validazione/replay, mai una capacità del riferimento.

## Modello e metriche

Nessuno scorer numerico candidato: dati insufficienti. L'evaluator indipendente è pronto per modelli futuri che ricevano CompatibilityInput completo e build corrispondente; input non validati non arrivano allo scorer. Nessun lookup dello score osservato come formula. Marchio RESEARCH CANDIDATE — NOT PRODUCTION READY; productionReady=false.

research:model: 16 fixture, 0 MATCH, 0 MISMATCH, 16 UNKNOWN, 16 campi sconosciuti; errore numerico massimo null; 0% di confronti completi sull'intero dataset. **Accuratezza numerica esatta N/A**, perché non esistono input esatti né score. Non si escludono gli UNKNOWN per gonfiare la percentuale.

## Blocco e prossime prove

Blocco osservato: selezione/tooltip/pose rispondono, ma Pour→Serve non fornisce un cocktail con quantità e score leggibili; in Chrome Canvas si vede anche il comando Stop transitorio. Il renderer automatico Chrome era vuoto. I tempi DOM differiscono dalle richieste; i frame Flash non sono misurati. La causa non è isolata: input/emulazione/scheduling/hitbox/stato sono alternative, non fatti dimostrati. Anche il fallback asincrono non ha risolto la calibrazione. HTTP 500 della fonte ostacola i riavvii; hash obbligatorio evita di cambiare riferimento inavvertitamente.

Prossimo gate: eseguire lo stesso hash con puntatore umano nel wrapper, dimostrare visivamente un primo liquido e Serve con score, poi tre sessioni fredde controllate. Separare prima selezione, tilt iniziale e riempimento; confrontare il player conservato in primo piano con un secondo runtime autorizzato. Solo dopo cercare q, capacità e una baseline stabile; poi count/totale Shake, confini, ingredienti/coppie, reazioni e massimo. I piani in research/reference-runner/experiments.json sono **non eseguiti**.

## Validazione e modifiche

107 test passati (91 precedenti + 16 nuovi). TypeScript/lint/test/build e research:validate/summary/model eseguiti; smoke dev gioco/Lab e reload offline di produzione passati, documentati a chiusura in RESEARCH_LOG. Il bundle di produzione resta quello della demo; nessun asset originale o SWF salvato/distribuito.

Aggiunti raw/correzione/build manifest/fixture/runner, rawObservation/modelEvaluation e test, CLI research. Evidence scope esteso a reference-automated mantenendo reference-manual. Guard del build esteso alla ricerca/SWF. Domini, scoring demo, artwork e sistemi di prodotto invariati. Nessun commit/push/PR, modifica remoti/storia o ramo. Ramo esistente phase1/reference-characterization conservato.

## Aggiornamento 1C

Il dataset e gli esiti descritti sopra sono quelli storici della fase 1B. La fase 1C aggiunge 13 raw native, 14 fixture e risultati numerici reali, senza riscrivere quei record. Totale 29 raw/30 fixture, 1 adjudication STRONGLY_SUPPORTED e 0 regole VERIFIED. Gate rigoroso di tre run unificati ancora parziale; vedi NATIVE_REFERENCE_FINDINGS.md.

## Aggiornamento 1D

Il gate nuovo baseline-270-v1 passa cinque cold run a270, dopo un abort conservato. La caratterizzazione prosegue in NATIVE_CHARACTERIZATION_FINDINGS.md, con ledger e coppie in research/phase1d. I risultati precedenti di questo documento restano storici e non vengono riscritti. Nessuna regola VERIFIED o formula di compatibilità introdotta; quantità ancora UNMAPPED.

## Avvio1E — isolamento causale predisposto

Nessuna nuova osservazione nativa. Due procedure1D congelate; riconferma minima2cold ciascuna obbligatoria prima dei trattamenti. Scoring e mapping canonici invariati. Gli idle sono input di ricerca senza click; hold richiesti/OS, pause e wall-clock non rappresentano volume. La misura preliminare del gauge da screenshot storici non stabilisce quantità finali. Vedi CAUSAL_MECHANICS_FINDINGS.md.

## Chiusura1E —13ottobre2026

L’utente ha sostituito il requisito di riproduzione esatta con un tuning originale approssimativo e autorizzato ricerca pubblica online, interrompendo le prove native. Stato CLOSED_WITH_APPROXIMATION.53nuovi raw/56fixture;totali151/160/2,0VERIFIED/9Strong/151Unverified.52sequenze OS complete,45score,7senza score,1abort al preflight (targetPID14452 assente, nessun input confermato).204file storici intatti.

Controlli4repeat ciascuno:270 e111. Pour1/2/3/4/5press a5000ms:111/111/111;89/87/87;63/63/65;39/38/41;17/17/20.10×500:3volte senza score. Due nuovi pairPour matched≤100ms conservano delta−48/−46; altri4unmatched restano espliciti. Niente capture durantehold:63/63/63;gap+2s:65/65/63. Short500/750 senza score2volte,1000→5/3,1500→15/17. Garnish3pairmatched270→370.

Nessun quantum, capacità canonica, coefficienteingrediente, bonusIce o formula di riferimento verificati. Nuovo profilo originale:240u, startupPour800ms,3u/125ms, garnish100, Ice500×2 cap1000, Shakebonus0/5/15/30, rischio8s/6azioni, scorebudget10.000. Sono scelte UNVERIFIED pronte per la prossima implementazione; demoPhase0/artwork invariati. Ml resta solo presentazione futura, mapping=null. Preserve information until research proves it irrelevant.

Fonti pubbliche e44punti:CAUSAL_MECHANICS_FINDINGS.md e APPROXIMATE_GAMEPLAY_TUNING.md. Nessuna Phase1F iniziata; niente commit/push/PR/GitHub/remoti/storia Git. SchermoRELEASED07:51:47UTC, Ruffle posseduto assente, ABORT conservato.
