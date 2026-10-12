# Native reference runner — fase 1C

Ricerca Windows separata dalla demo. Fase chiusa con limiti: gate rigoroso 2/3 run identici; tre sessioni fredde mostrano 270 includendo una diagnostica stepwise. Non avviare la matrice successiva automaticamente. Risultati e identità complete in [NATIVE_REFERENCE_FINDINGS](../../docs/NATIVE_REFERENCE_FINDINGS.md).

## Prerequisiti locali

Windows, Node 24+, PowerShell 7 (`pwsh.exe`), Win32 e System.Drawing disponibili. Nessuna dipendenza npm aggiunta. Il helper compila Win32.cs con Add-Type. La copia SWF e Ruffle sono esclusivamente in `research/.local-reference/`, le immagini in `research/.captures/`: entrambe ignorate da Git. Non distribuire questi file.

Il SWF deve avere dimensione 693558 e SHA-256 `ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7`. Non usare un'altra versione come se fosse equivalente. Acquisire il file dalla fonte documentata rispettando l'autorizzazione; non ispezionare contenuti interni.

Il download helper accetta soltanto URL ufficiali di release Windows Ruffle e redirect asset consentiti. Il download richiede l'eccezione esplicita autorizzata dall'utente; nessuna API o repository GitHub. Consultare `download-ruffle.mjs` per gli argomenti. Gli eseguibili/ZIP/hash restano locali; `reference-builds.json` contiene solo provenienza e identità.

`research/.local-reference/runtime.json` è una configurazione locale: executable (path relativo ignorato), executableSha256, version completa dichiarata dalla CLI, environmentId registrato nel manifest, renderer, build/date/source ed expectedColdFingerprint calibrata. Il runtime usato per gli score è nightly 2026-10-11 GUI/DX12, hash exe `b0840c1db59ee428ab35015fdd155a09465d6649fb19de09ee34d352dd247656`. Stable e no-GUI hanno ambienti distinti. Non copiare una fingerprint fra versioni, DPI o viewport diversi.

## Comandi dalla radice del repository

```powershell
npm run research:native:doctor
npm run research:native:launch
npm run research:native:inspect
npm run research:native:calibrate
npm run research:native:smoke
npm run research:native:stop
```

Doctor non invia input. READY_TO_LAUNCH conferma prerequisiti, hash e isolamento; soltanto targetScreenshotVerified=true conferma una cattura del target vivo in foreground. Launch crea una sessione fredda posseduta; inspect attiva soltanto la finestra validata. Calibrate crea la cattura da ispezionare visivamente prima di fissare intro/mappe. Smoke ferma solo la sessione posseduta, lancia, confronta la fingerprint statica e usa esclusivamente il protocollo firstGate in protocols.json; non esegue la matrice futura e non riconosce score automaticamente.

Per un'azione/sequenza, creare un JSON dentro la directory ignorata:

```json
{
  "sessionId": "ID dalla sessione appena lanciata",
  "initialVisualConfirmed": true,
  "actions": [{"target": "pour", "holdMs": 1000, "captureDuring": true}],
  "afterServeWaitMs": 0
}
```

```powershell
npm run research:native:input -- research/.local-reference/request.json
npm run research:native:run -- research/.local-reference/request.json
```

L'intera richiesta viene validata prima del primo input; hold interi 0..15000 ms, attesa risultato 0..30000 ms. Le coordinate sono in targets.json e devono essere calibrate visivamente per l'ambiente: label introduttivo e orb effettivo sono diversi. Input è OS SendInput/SetCursorPos, mai dispatchEvent. Controlli su PID/avvio/path/hash/titolo, foreground, visibilità, DPI/geometria, bounds e occlusione; spostamento del cursore, Escape o file `research/.local-reference/ABORT` interrompono. Rilascia soltanto il pulsante premuto dal helper. Non rimuovere/aggirare un guard per ottenere uno score.

Non muovere il cursore né spostare/minimizzare la finestra durante il run. Se interrotto, conservare traccia/catture/abortedAction e ripartire da un cold launch; non contare un run parziale come repeat riuscito. Lacune di cattura dopo Serve non reinviano azioni. I timer sono misure OS per comando, non frame Flash, quanta o quantità canoniche.

## Registrazione e validazione

Ispezionare direttamente PNG di pieno e score. Preparare review.json ignorato con id/experimentId, traces (path locali), initialCondition, visibleNotes, limitations, repetition e visibleFill. Per score aggiungere score, visuallyVerified=true e resultCapture; per indicatore pieno fullIndicatorCapture. Non impostare score senza un'immagine effettivamente leggibile. record.mjs valida schema e identità, mantiene durata richiesta/reale separata, quantità UNMAPPED e status UNVERIFIED, e scrive raw con flag wx (nessuna sovrascrittura). Non accorpare sessioni o runtime. Tracce ordinate per creazione locale: conservarle nello stesso archivio; eventuali errori storici vanno rettificati append-only.

```powershell
npm run research:native:record -- research/.local-reference/review.json
npm run research:fixtures
npm run research:validate
npm run research:summary
npm run research:raw -- IA-NATIVE-FULL-DIAG-01
npm run research:model
```

Fixtures sono proiezioni incomplete finché mancano unità/tick canonici. La fixture aggregata Strong non è un ulteriore esperimento. Corrections modificano solo una vista posseduta, preservando raw originali. Nessuna promozione automatica a VERIFIED, nessun scorer candidato. Una cattura manuale indipendente futura deve usare la medesima build/ambiente e dichiarare metodo e procedura; non convertire una traccia automatica in osservazione umana. Se l'automazione non supera il gate con guard attivi, fermarsi e documentare il fallback manuale come lavoro non eseguito.

## Confine produzione

Helper, mappe, protocolli, record, originali, runtime e immagini locali non sono importati dal gioco. I guard del build rifiutano marker/path/binari della ricerca. Eseguire `npm run check`; controllare `git diff --check`, `git ls-files` e gli output effettivi in dist. Inventario delle sole posizioni locali: local-inventory.json. Non committare o pubblicare binari/catture; in questa sessione nessun commit o push è autorizzato.
