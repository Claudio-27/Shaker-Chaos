# Fase 1C — input nativo e risultati del riferimento

Stato: **chiusa con limiti**, 12 ottobre 2026. La sequenza completa crea e serve drink non vuoti e produce score leggibili. Il gate rigoroso di tre run automatici identici non è completato: due run unificati mostrano 270; un terzo processo freddo diagnostico, con attesa e comandi separati, mostra anch’esso 270. I tentativi ulteriori sono stati fermati dai controlli di cursore/geometria/finestra. Non dichiarare tre run unificati riusciti.

## Identità ed esecuzione

SWF: **ia-therightmix-ede221ad99e03173**, 693558 byte, SHA-256 **ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7**. Fonte preservata: https://archive.org/details/flash_therightmix. Copia locale soltanto per esecuzione/hash in research/.local-reference/reference.swf, ignorata e vietata in produzione. Nessuna lettura di bytecode, costanti, oggetti ActionScript, script o asset della SWF.

Download Ruffle individuati su [sito ufficiale](https://ruffle.rs/downloads). L’utente ha autorizzato un’eccezione limitata ai download ufficiali via GitHub e ai redirect: nessun accesso a repository/API/account GitHub, upload, commit/push/PR, cambio ramo o remoti.

| Runtime | Versione dichiarata dall’eseguibile | SHA-256 eseguibile | Fonte |
| --- | --- | --- | --- |
| Stable | Ruffle 0.7.1-stable, build 89a7049965f3090e706265670df309a5128233ac, 2026-10-07 | 7b821bac7d8accd07407902eac9544b8d906df4d6c2a099eb091f3e04512b199 | https://github.com/ruffle-rs/ruffle/releases/download/v0.7.1/ruffle-0.7.1-windows-x86_64.zip |
| Nightly utilizzata per score | Ruffle 0.8.0-nightly.2026.10.11-nightly, build 8c6f3e95203a765c39639ee9366abe8340830709, 2026-10-11 | b0840c1db59ee428ab35015fdd155a09465d6649fb19de09ee34d352dd247656 | https://github.com/ruffle-rs/ruffle/releases/download/nightly-2026-10-11/ruffle-nightly-2026_10_11-windows-x86_64.zip |

Hash ZIP: stable a5f6df9881771226e330e08a1fa7666f4caff50ddf9f2f993cdd95293edca627; nightly 0a82af1b3aa26f9d3c0e82a39d037f02c43a9079393db8e4e156282bc3c929c3. Non confondere hash archivio ed eseguibile.

Ambiente principale: **ia-therightmix-ede221ad99e03173__ruffle-desktop-nightly-20261011-win64-gui**. Windows, DX12 richiesto esplicitamente, DPI osservato 120 / scala 125%, client 600×470, toolbar 30 px, stage visibile 600×440. GPU/adattatore, fps effettivi e fedeltà Adobe Flash non misurati. Stable/no-GUI e nightly/no-GUI hanno ID separati nel manifest; non sono mescolati come identici.

## Metodo e sicurezza

PowerShell 7 + Add-Type/PInvoke Win32 SendInput/SetCursorPos; nessun dispatchEvent. Timer Stopwatch monotono ad alta risoluzione: durata richiesta intera separata dalla misura frazionaria reale del nostro down/up. Non è durata Flash né numero di frame. Coordinate stage→client→schermo, letterboxing e DPI; nessuna posizione dello schermo è una verità di gameplay. La fingerprint dell’intro usa soltanto un’area statica della cattura locale, non l’intero frame animato, ed è limitata al viewport calibrato.

Processo posseduto con PID, avvio, hash/path eseguibile e titolo; focus, visibilità, coordinate/occlusione e geometria controllati prima dell’input e durante il hold. Escape, file research/.local-reference/ABORT, spostamento del cursore, perdita del target/focus o cambio geometria fermano l’azione; viene rilasciato soltanto il tasto premuto dal helper. Nessun input a finestre arbitrarie. Cold run: termina solo il processo posseduto→lancia SWF esatta con storage memory e config/cache locali→verifica intro→esegue. Le catture GDI sono solo del client verificato, con contesto DPI fisico. Una perdita di focus dopo Serve genera una lacuna di cattura, mai uno screenshot di un’altra app o input reinviato.

## Dati e lettura degli score

**13 nuove osservazioni raw native**, **14 nuove fixture** (13 proiezioni + una valutazione aggregata); totale progetto 29 raw / 30 fixture, due correzioni append-only. Undici processi freddi distinti sono rappresentati nei record nativi, non undici drink ripetibili. Sette osservazioni numeriche originali, senza contare la fixture aggregata come un ottavo esperimento. Zero osservazioni umane indipendenti; input automatico e lettura visiva dell’agente. Nessuna OCR o riconoscimento automatico di cifre.

| Caso | Risultato letto | Procedura / limite |
| --- | --- | --- |
| IA-NATIVE-DIAG-SCORED-01 | **114**, primo score | Diagnostica: due Pour (1000+5000 ms richiesti), Serve intermedio, Shake1000, Serve; non baseline pulita |
| IA-NATIVE-TIMED-01/02/03 | **113 / 111 / 110** | Tre cold run, stessa procedura richiesta Pour5000/Shake1000: non esatta/ripetibile |
| IA-NATIVE-FULL-DIAG-01 | **270** | Full indicator dopo Pour15000; Shake1000/Serve in un secondo comando dopo attesa; risultato letto dopo lacuna di focus |
| IA-NATIVE-FULL-01/02 | **270 / 270** | Due cold run unificati: start orb→bottle08→Pour15000→Shake1000→Serve80; indicatore pieno catturato |
| IA-NATIVE-ABORT-01/02 | score assente | Hold interrotti, non ripetizioni riuscite; misura iniziale sconosciuta conservata come null, misura successiva parziale conservata |

Gli altri quattro record nativi sono click diagnostici sul label introduttivo, senza cocktail o score. La scritta non avviava il gioco; il pulsante circolare visibile sottostante lo ha avviato. La bottiglia è identificata come slot08 superiore blu/trasparente; non si impone un’identità/coefficiente senza misura sufficiente. Stream, indicatore del liquido, assaggio e schermata score sono osservazioni esterne; la sola posa non viene usata come quantità. Reazioni campionate in catture locali e schermata di risultato; nessuna soglia di reazione o esplosione dedotta dal testo finale.

## VERIFIED

**Zero regole meccaniche VERIFIED.** Hash, isolamento e validazione software sono controlli tecnici; non verificano la formula originale.

## STRONGLY SUPPORTED

**Risultato numerico circoscritto:** indicatore pieno con slot08, una richiesta Shake1000 e Serve ha mostrato 270 in tre processi freddi indipendenti. Supporto IA-NATIVE-FULL-DIAG-01/FULL-01/FULL-02, ambiente nightly GUI sopra, confidenza medium. Fixture adjudicated-IA-NATIVE-FULL-OBSERVED. Caveat: due script identici e un run stepwise; quantità canoniche, tick e terza ripetizione unificata non stabiliti. Non è una regola generale, né capacità=270, né prova di un bonus.

## UNVERIFIED HYPOTHESES

- Pieno del display potrebbe corrispondere a un clamp di quantità; controlli e massimo numerico non calibrati.
- Ritardo iniziale, frame o scheduling potrebbero spiegare differenze dei Pour temporizzati; alternative non escluse.
- Fase/numero/durata Shake, ice/garnish e formule restano ignoti. Nessun coefficiente ricavato da 114/113/270.

## REJECTED HYPOTHESES

**Stessa procedura richiesta Pour5000/Shake1000 garantisce score esatto:** respinta dalle tre letture 113/111/110 (stesso ambiente, confidenza high per diversità degli output; causa non isolata). Durata OS non è un quantum. Un esito di SendInput o una posa non dimostrano quantità accettata.

## Copertura e gate successivi

Input nativo opera il filmato; non-empty/Serve/score raggiunti. Riproducibilità del criterio pieno è promettente; gate rigoroso 3 script identici **parziale (2/3)**. Pertanto serie 100..2000 ms, empty serve nativo, confronto uno/più Pour, ordine A/B, ice/garnish, Shake0..5, durate cumulative equivalenti e overshake/coarse boundary restano **NOT TESTED come confronti controllati**. Singole azioni diagnostiche non sono quei confronti. Parità desktop vs web attuale **NOT TESTED**: il gate viene prima. Desktop fornisce ora score che la fase 1B non aveva ottenuto; causa della differenza fra hitbox/input/emulazione/focus non isolata.

Quantum, capacità in quanta, ingredient coefficients, Ice/Garnish delta, Shake count/time bonus, esplosioni e reaction thresholds: **non determinati**. Ml restano presentazione senza conversione. Preserve information until research proves it irrelevant.

## EXTERNAL HYPOTHESIS COMPARISON

Nessuna tabella esterna importata. 10245 non testato/riprodotto, massimo non dimostrato; bonus/coefficients/thresholds di terzi restano ipotesi. Nessun confronto numerico con tali valori prima di dati indipendenti sufficienti.

## Modello, cronologia e prossima prova

Nessuno scorer candidato: 7 output numerici, meno di 10 affidabili, niente modifier/multi-ingredient controllati e unità non mappate. Demo scorer invariato. Tutte le 30 fixture nel denominatore: 0 MATCH, 0 MISMATCH, 30 UNKNOWN; accuracy numerica N/A, errore massimo null. La fixture aggregata non raddoppia i dati acquisiti.

Una trascrizione iniziale di FULL-DIAG ordinava nomi abort/trace anziché i comandi reali. Raw intatto; correzione NATIVE_COMMAND_ORDER in research/raw-corrections/IA-NATIVE-FULL-DIAG-01-order.json applicata al view posseduto dalla CLI. research:raw permette leggere la cronologia normalizzata. Non riscrive score, timing o azioni, né i dati di fase 1B.

Prossima prova raccomandata: terzo cold run unificato con finestra/client/DPI stabili e cursore non interrotto; confermare pieno, risultato e reaction, poi calibrare quantum. Non serve una nuova formula demo. Questa chiusura non avvia altre fasi.

## File locali e validazione

Originali, runtime, ZIP, configurazione/cache/sessioni/tracce/review e PNG restano in research/.local-reference/ e research/.captures/, ignorati. Inventario numerico dei percorsi: research/native-runner/local-inventory.json. Nessun binario/cattura originale in produzione; build guards rifiutano SWF/EXE/DLL/ZIP/helper/mappe/capture directories e marker. AGENTS/docs/CLI/schema aggiornati, dominio/UI/artwork/sistemi prodotto invariati. Controlli finali e conteggi test sono registrati in docs/RESEARCH_LOG.md.

Controlli di chiusura: 122/122 test, TypeScript, lint, build e validazione dataset passati; smoke demo/Lab/produzione/offline riusciti. R006 in RESEARCH_LOG.md registra procedure, isolamento e conteggi. La build del gioco conserva gli stessi hash di fase1B.
