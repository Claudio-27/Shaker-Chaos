# Phase1D — quantitative native research

Procedura immutabile in scripts/baseline-270-v1.json, ricavata dai due raw 1C unificati. Richieste: orb100, slot08 selection80, Pour15000, Shake1000, Serve80 ms; coordinate e geometria congelate nel file. L’identità dell’ingrediente resta ref.slot08-unidentified finché una label è leggibile. Nessun ID di artwork produzione è usato come ingrediente meccanico.

I cinque run completi nuovi mostrano270; un primo abort e un controllo successivo interrotto restano nei ledger. La relazione nativa è Strong: i guard VERIFIED esistenti richiedono input canonico validato, ancora UNMAPPED. Non promuovere quantità/formula/capacità. La geometria stabile e i tempi reali sono dati, non quanta Flash.

Il runner finale1C includeva un controllo di settling250 ms aggiunto dopo i due score originali. Il nuovo script conserva le azioni/richieste e i fixed sleep documentati, ma non dichiara identiche le latenze storiche: release-to-next-down e actual hold sono misurati in ogni nuovo run. Per il gate contano soltanto le nuove sessioni1D, non i run1C.

Comandi dalla radice:

```powershell
npm run research:native:doctor
npm run research:native:phase1d -- run BASELINE NN # NN: nuovo numero non presente
npm run research:native:phase1d -- gate
node research/native-runner/batch.mjs NEW_BATCH_ID # piano nuovo, IDs non riutilizzati
npm run research:native:phase1d -- review ID SCORE NEUTRAL_REACTION_ID FILL_STATUS
npm run research:fixtures
npm run research:validate
npm run research:summary
npm run research:model
```

Gli ID già presenti vengono rifiutati. Un batch archiviato non va rieseguito con gli stessi ID; creare un piano successivo se necessario. Controlli e trattamenti usano processi freddi separati e pairId; il batch si ferma al primo abort e alla scadenza. Un mancato input/score resta sconosciuto, non zero. Non mediare score instabili.

Scoring/reaction/full-indicator vengono letti direttamente dalle PNG, mai da VM né riconoscimento automatico. Ispezionare risultato, indicatore e campioni reaction prima di review. Il ledger iniziale del run è immutabile; la review è un altro file append-only. record.mjs produce raw UNVERIFIED e quantità UNMAPPED, fixtures aggiunge soltanto file assenti. Il confronto canonico dei file conserva il contenuto storico anche con newlineCRLF.

research:summary include tutti i run, cold session, score frequencies, baseline5/5, variabili, pair delta e abort. OBSERVED DELTA non significa bonus/coefficient. I confronti con baseline rimangono all’interno dello stesso ambiente/hash. Per il modello occorrono15 fixture esatte riproducibili, più livelli Pour, due ingredienti, ice/garnish e diversi Shake; nessun candidato finché mancano prerequisiti.

Il Compatibility Lab importa score nativi conservando UNKNOWN per CURRENT DEMO se manca la storia canonica. Una storia vuota UNMAPPED non viene confrontata come cocktail vuoto. Casi con storia canonica nota continuano a mostrare MATCH/MISMATCH rispetto allo scorer demo invariato. Tutto il tooling è escluso dalla build; usare i guard di produzione.

Originali, PNG, runtime e review locali sono ignorati. Non committare SWF, ZIP, eseguibili o catture. Non accedere a GitHub e non creare commit/push/PR. Vedi docs/NATIVE_AUTOMATION_SAFETY.md per guard, abort e limiti.

Diagnostiche senza Serve/score: review-no-score ID PHASE NEUTRAL_REACTION_ID FILL_STATUS. Lo score mancante non viene rappresentato con0. Le durate F-1/F-2/F-4 richieste sommano4000 ms; i tempi effettivi e le pause sono nel ledger e non sono dichiarati uguali. Le tavole di lettura rimangono research/.captures; la fonte primaria è ciascuna PNG originale. Lo schermo può essere mantenuto acceso solo nell’intervallo autorizzato tramite display-keepawake.ps1, richiesta temporanea da rilasciare a fine lavoro.

Chiusura:69 raw nuovi/74 fixture nuove;98 raw/104 fixture cumulativi.134 test e controlli passati.0 VERIFIED/6 STRONGLY_SUPPORTED/98 UNVERIFIED, no candidate. Report completo e38 richieste in docs/NATIVE_CHARACTERIZATION_FINDINGS.md; summary-final.json conserva il riepilogo effettivo, inclusi61 risultati numerici/59 servizi/2 fallimenti automatici. Nessun run successivo1D va avviato senza un nuovo incarico.
