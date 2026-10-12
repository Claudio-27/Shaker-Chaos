# Sicurezza dell’automazione nativa — fase 1D

Il runner usa esclusivamente la SWF e il Ruffle Desktop già approvati, con SHA-256 invariati. Non legge ActionScript, VM, oggetti o costanti. Nessun download o accesso GitHub in 1D. Il ramo locale phase1/quantitative-native-characterization è stato creato da phase1/reference-characterization soltanto dopo autorizzazione esplicita dell’utente; nessun commit/push/PR.

## Aborti precedenti e cause osservate

La fase1C ha rilevato spostamenti del cursore durante hold, cambi di geometria durante cattura, target nascosto/minimizzato/assente e lacune di focus dopo Serve. Le cause esterne del movimento/focus non sono state identificate. Non attribuirle automaticamente all’utente, all’emulatore o a un bug DPI. I log conservano il motivo effettivo.

In 1D BASELINE-01 è stato interrotto durante Pour: expected244,641/actual232,614, hold parziale1109,3458 ms. CONTROL-01: expected212,609/actual218,609, hold parziale6734,4875 ms. Entrambi hanno rilasciato il pulsante posseduto; nessuna schermata score. Il batch si è fermato al primo controllo, senza trattamento. Le cinque baseline successive complete sono indipendenti da questi fallimenti; i retry usano ID/pair distinti e gli abort restano nel report.

## Rafforzamenti 1D

- Il runtime locale deve corrispondere anche all’ambiente registrato nel manifest: hash SWF/eseguibile e versione completa. Non basta una configurazione locale autocertificata.
- La geometria viene riletta dopo la cattura e confrontata con quella usata per il mapping, prima del down. Posizione, bounds e DPI rimangono fissi fra tutte le azioni dello stesso run.
- La richiesta della procedura congelata include width600/height470/DPI120: un mismatch abortisce prima dell’input. L’origine sul desktop può differire fra cold launch, ma non durante il run; i target sono relativi allo stage.
- Se l’input è completato ma la cattura successiva fallisce, la telemetria già consegnata viene conservata in deliveredPending e nel record d’errore, invece di scomparire.
- Il motivo di perdita foreground include l’HWND diagnostico senza leggere contenuti di app estranee.
- Batch sequenziali, arresto al primo abort, ID append-only e scadenza dell’intervallo concordato. Nessun run nuovo parte se non resta il budget prudente di90 s. Nessuna ripetizione automatica dello stesso ID e nessun retry nascosto.

I limiti non sono stati estesi: hold0..15000 ms, max30 azioni, risultato0..30000 ms, tolleranza cursore4 px, validazione foreground/processo/titolo/visibilità/occlusione/DPI, Escape e ABORT sentinel sempre attivi. Non viene usato dispatchEvent.

## Target e dialoghi

Ogni sessione posseduta identifica PID, ora d’avvio, path/hash runtime, HWND/titolo e hash SWF. Il cold launch termina soltanto il processo posseduto, avvia l’esatto file con storage memory e rete/file-access denied, poi controlla intro statica e geometria. Il doctor distingue READY_TO_LAUNCH dalla conferma di una cattura su target vivo.

Attivazione consentita soltanto durante setup sul Ruffle validato. Durante le azioni, perdita di focus, cambio finestra/dialogo, occlusione del punto o movimento geometrico/cursore causano abort: nessun click-through e nessuna riattivazione per proseguire un hold. Finalmente viene rilasciato soltanto il pulsante premuto dal helper. Errori dopo Serve sono lacune di cattura, senza reinvio di azioni né cattura di altre app.

Escape o research/.local-reference/ABORT interrompono. Gli originali e le catture restano ignorati e vietati in produzione. Non diminuire questi controlli per completare una serie. Il report favorisce un esito incompleto rispetto a dati contaminati.

## Schermo attivo durante l’intervallo autorizzato

Su richiesta esplicita dell’utente, display-keepawake.ps1 usa SetThreadExecutionState (ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED), senza modificare i timeout o il piano energetico. Una richiesta iniziale con flag errato è fallita ed è stata rilasciata; il flag corretto 0x80000003 ha prodotto HELD. Il processo è hidden, posseduto e limitato a65 minuti, interrompibile dal sentinel display-keepawake.stop. Il finally rilascia la richiesta (0x80000000). Lo stato RELEASED deve essere verificato alla chiusura. La richiesta non aggira lock, dialoghi, input dell’utente o i guard del runner.

Le nuove coordinate candidate sono registrate senza cancellare quelle storiche. I primi punti iceChunks/garnishLemons selezionavano bottiglie; i punti iceVisible/garnishVisible sono diagnosticati separatamente. Una cattura che mostra un oggetto in movimento non prova da sola una quantità o un bonus. Le tavole review-sheet.ps1 accostano soltanto PNG locali per lettura visiva; restano ignorate sotto research/.captures e non sostituiscono gli originali.

Chiusura1D:69 cold run,2 abort di sicurezza conservati;67 sequenze OS complete non equivalgono a67 servizi. Due fallimenti automatici del gioco (esplosione, score0 primaServe) sono distinti da due procedure senza risultato e da quattro diagnostici senza Serve. La review valida fill prima dell’ingestione e conserva tentativi locali falliti; nessun raw storico riscritto. Il piano originario B ha rispettato il buffer90s; la sua ultima metà è terminata con un piano esplicito finale (deadline19:15UTC), dentro circa un’ora autorizzata, mantenendo tutti i guard. Ultimo run19:14:21UTC. Richiesta schermo RELEASED verificata19:15:13UTC, settingsChanged=false; Ruffle posseduto chiuso.
