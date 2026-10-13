# Shaker-Chaos

## Fase corrente: 2C — profilo e progressione locale

Livello, XP e monete fittizie salvati nel browser; ricompense assegnate una volta quando il risultato diventa definitivo. Formula successo: 20+floor(score/100) XP e 5+floor(score/250) monete; fallimento:5 XP/2 monete. La progressione non modifica lo scoring del cocktail.

Aprire **Collezione** per equipaggiare i cosmetici posseduti: Bartender02 al livello2, Scia azzurra al livello3. Ambiente e banco iniziali rimangono disponibili. I contenuti bloccati non vengono scaricati anticipatamente. Reload ripristina progressi e loadout; storage indisponibile produce una nota e un fallback in memoria, senza rompere il gioco.

[Specifica della progressione](docs/PROGRESSION_SYSTEM.md) · [Rapporto2C](docs/PHASE_2C_REPORT.md). Solo sviluppo: ?progressionLab=1, combinabile con ?tuningLab=1; reset del profilo richiede conferma nel laboratorio. Tutti i tool precedenti restano DEV. Nessun negozio o backend/account introdotto.

Le note 2B e precedenti sotto descrivono i checkpoint storici. La fase 2B è stata committata dall’utente in d2187b3; le modifiche 2C sono lasciate su main per la sua revisione/commit. Arresto dopo2C.


## Checkpoint: 2B completata

Miscela → Agita → Servi → Assaggio; selezione marcata, preparazione del versamento, gauge esterno e feedback di ghiaccio/agrume. L’avviso dello shaker cresce senza countdown tecnico. Nove dialoghi originali, tre fasce grafiche esistenti, risultato saltabile e movimento ridotto.

Controlli completati: TypeScript strict, lint, 210 test (188 precedenti + 22 nuovi), build/audit produzione e smoke offline. Layout verificati a 1024×768, 1280×800, 768×1024, 390×844 e 320×640. Touch/multitouch fisico ancora da verificare; test sintetici dei puntatori superati. Nessuna nuova dipendenza o modifica al tuning/artwork.

Solo DEV: aggiungere ?tuningLab=1 per diagnostica di presentazione e anteprima del movimento ridotto; ?assetLab=1, ?compatLab=1 e ?visualDebug=1 conservati. Il laboratorio storico non autorizza nuove ricerche. Il gioco resta silenzioso, con una piccola porta audio di presentazione pronta per suoni originali futuri.

Lavoro locale su main; modifiche 2B non committate, da revisionare in GitHub Desktop. Arresto dopo 2B.


Gioco browser indipendente per tablet. La fase 2B rifinisce il giro di produzione della fase 2A, preservandone le regole: capacità240u, Pour temporizzato, due aggiunte di ghiaccio, agitazioni con rischio e risultato0–10000. Artwork e architettura delle fasi0–0.3 sono preservati.
Il tuning è originale Shaker-Chaos. La ricerca di fase1 è chiusa per decisione di prodotto; non si dichiara riproduzione esatta. Vedere [tuning approvato](docs/APPROXIMATE_GAMEPLAY_TUNING.md) e [rapporto2A](docs/PHASE_2A_REPORT.md). La fase corrente è documentata nel [rapporto 2B](docs/PHASE_2B_REPORT.md).

## Avvio locale

Richiede Node.js 24 o successivo, per eseguire direttamente i test TypeScript con il runner nativo.

```sh
npm ci
npm run dev
```

Aprire l'indirizzo locale stampato da Vite. Se tutte le dipendenze sono già in cache, usare `npm ci --offline`. Le versioni sono fissate nel lockfile. L'installazione iniziale di questa fondazione è stata eseguita offline.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

`npm run check` esegue tutti i controlli. Nessun comando crea commit, pubblica il progetto o contatta GitHub. `npm ci` senza `--offline` può accedere al registro npm; audit e notifiche automatiche sono disabilitati.

## Come giocare

1. Scegli uno dei tre ingredienti originali.
2. Tieni premuto **Versa** per aggiungerlo, oppure usa Invio/Spazio sul pulsante.
3. Aggiungi ghiaccio, tieni premuto **Agita** e scegli la guarnizione.
4. Premi **Servi il mix**: il risultato si congela subito; il bartender assaggia, poi arrivano punteggio, reazione e contributi in circa un secondo. **Mostra il risultato** salta l’attesa.
5. Dopo il risultato premi **Nuovo drink**. Durante la preparazione il reset resta secondario. Il nuovo giro annulla anche i reveal ancora in attesa.

Ogni nuova pressione di Versa ha800ms di avvio; uno shaker pieno continuo richiede10,8s. Dopo il primo Shake non si aggiungono liquidi o ghiaccio. Servire richiede prima un Shake completato. Alla sesta agitazione o a8s cumulativi il mix fallisce; Reset ricomincia. Non esistono ancora ricette da scoprire, premi, XP, valuta, profili o salvataggi.

## Struttura

```text
src/
  domain/        storia canonica, unità intere, replay e scoring originale
  application/   ciclo della partita e composizione delle dipendenze
  content/       catalogo pubblico e profilo di tuning tipizzato
  research/      esecuzione di casi di ricerca, senza promuovere le evidenze
  boundaries/    contratti e direzioni dei domini futuri, solo documentazione
  platform/      registrazione della PWA, separata dal dominio
  ui/            React, Pointer Events, scena modulare e layout responsive
scripts/         generazione della cache PWA, test e rigenerazione delle icone
public/          manifest, icone originali e artwork pubblici registrati
```

Lo scoring viene iniettato attraverso `ScoringEngine.evaluate(CompatibilityInput)`, con cronologia completa e proiezione derivata. Il mix finale non sostituisce la cronologia. Un dataset futuro può sostituire i coefficienti; una formula diversa richiederà un nuovo adattatore di dominio. In entrambi i casi il ciclo della partita e la UI non devono conoscere l'equazione. Vedere [ARCHITECTURE](docs/ARCHITECTURE.md).

## PWA e offline

La build genera un service worker che precachea sette file minimi della shell. Gli artwork registrati si caricano su richiesta; la scena pubblica attiva viene riscaldata e confermata prima dello stato offline pronto. La registrazione avviene solo in produzione, su HTTPS o localhost. Per provare: build, preview, attendere "Pronto anche offline", ricaricare, quindi disattivare la rete in DevTools e ricaricare ancora. Un primo caricamento senza rete non è supportato.

Il manifest supporta installazione dove disponibile; non blocca l'orientamento. Landscape usa tre pannelli, portrait riorganizza il risultato e gli schermi piccoli usano una colonna. Il supporto all'installazione dipende dal browser. Test su tablet fisici e rifiniture PWA appartengono alla fase 4.

La cache esclude API, contenuti privati, altri siti e richieste non GET. Un aggiornamento attende la chiusura delle schede controllate dal worker precedente. In sviluppo non viene registrato un worker; se si riusa una porta già usata dalla preview, rimuovere il worker precedente in DevTools.

Le icone PNG sono già versionate; `scripts/generate-icons.ps1` permette di rigenerarle su Windows da forme originali. Non è un requisito della build.

## Documenti

- [Visione prodotto](docs/PRODUCT_VISION.md)
- [Architettura e decisioni costose da cambiare](docs/ARCHITECTURE.md)
- [Roadmap, fasi 0–8](docs/ROADMAP.md)
- [Specifica progressiva delle meccaniche](docs/MECHANICS_SPEC.md)
- [Registro delle evidenze](docs/RESEARCH_LOG.md)
- [Istruzioni per contribuire](AGENTS.md)

Il progetto è una implementazione indipendente: nessun codice, asset, nome di prodotto, dialogo, file proprietario o fotogramma del gioco di riferimento è utilizzato. Nessuna meccanica originale è stata ancora verificata. La futura area privata richiederà autenticazione e consegna dei contenuti lato server; non viene implementata in questa fase.

## Note storiche delle fasi 0–1E

**Preserve information until research proves it irrelevant.** La sessione registra eventi di dominio con ordine esplicito, tempi interi, start/tick/end delle operazioni, ghiaccio, guarnizione, servizio e reset. Reset svuota il mix corrente ma conserva i fatti precedenti per l'analisi. Gli eventi restano in memoria; non è stato aggiunto un sistema di salvataggio o un'interfaccia di ricerca.

Le quantità sono `VolumeUnit` intere. La UI mantiene il layout e mostra **u**, senza assumere un fattore di conversione in ml. La composizione demo è codificata in parti intere e lo scoring usa aritmetica razionale BigInt. Nessun valore o comportamento del gioco di riferimento è stato verificato. La fase 1 non è iniziata.

## Fase 0.2: composizione e asset originali

Scena responsive con bartender centrale, bottiglie, banco/preparazione, comandi, reazione e HUD. I file visivi sono associati tramite ID nel registro `src/content/publicVisualCatalog.ts`, separati dal dominio e dal ciclo di gioco. In quella fase erano presenti soltanto SVG geometrici originali segnaposto; gli artwork forniti sono integrati nella fase 0.3 descritta sotto.

Composizione prioritaria per 1024×768 e 1280×800 landscape, riordino in portrait e colonna su mobile. `npm run dev` con query `?visualDebug=1` mostra confini, safe area, hitbox e breakpoint; il debug è escluso dalla produzione anche con la query.

[Vedere l'architettura visiva](docs/VISUAL_ARCHITECTURE.md) per mapping, separazione delle animazioni, fitting e cache della fase corrente. In fase 0.2 non erano presenti selezione ambienti o artwork finali; Asset Lab è aggiunto in fase 0.3. Nessuna fase 1, progressione o funzione vault introdotta.

## Fase 0.3 — artwork e catalogo modulare

Entrambi i bartender forniti, ambiente tiki e banco indipendente, bottiglie/shaker/calice PNG integrati; originali preservati. [Rapporto completo e inventario](docs/ASSET_INGEST_REPORT.md), [catalogo e bundle](docs/CONTENT_CATALOG.md), [architettura visiva](docs/VISUAL_ARCHITECTURE.md).

In sviluppo aprire /?assetLab=1 per cambiare bartender, ambiente, banco, bottiglie ed effetto; aggiungere &visualDebug=1 per le safe area. Nessuna persistenza o negozio. In produzione la PWA precachea solo la shell e riscalda la scena attiva: le reazioni non ancora scaricate possono usare idle offline. Controlli: npm run check, 68 test passati. Phase 1 non iniziata.

## Fase 1A — Compatibility Lab

Solo sviluppo: /?compatLab=1, combinabile con &assetLab=1&visualDebug=1. Sequenze esatte in VolumeUnit e ms virtuali, stessi eventi canonici del gioco, JSON import/export, osservazioni manuali separate e sweep. [Guida](docs/COMPATIBILITY_LAB.md), [matrice A–I e primi dieci esperimenti](docs/REFERENCE_TEST_MATRIX.md). Zero fixture VERIFIED reali e nessuna modifica allo scorer demo. La build controlla che i laboratori DEV non siano distribuiti. Nessun servizio esterno, account o sistema prodotto introdotto.

## Fase 1B — ricerca black-box

[Findings e limiti](docs/REFERENCE_FINDINGS.md), [runner riproducibile](research/reference-runner/README.md). 16 acquisizioni diagnostiche / 16 fixture UNVERIFIED; nessuno score o modello numerico calibrato. Comandi: npm run research:reference, research:fixtures, research:validate, research:summary, research:model. Solo ricerca, assente dal bundle. Scoring demo invariato; nessuna compatibilità dichiarata.

Ricerca locale 1C: npm run research:native:doctor / calibrate / smoke / run; read-only dataset npm run research:raw -- ID. Binaries/catture soltanto ignorati, nessuna distribuzione. Stato e limiti: docs/NATIVE_REFERENCE_FINDINGS.md. Il gioco/build normale non avvia il riferimento.

## Fase 1D — caratterizzazione quantitativa nativa

Baseline congelata e cinque cold run nuovi a270; prove control/treatment, ledger append-only e dashboard per frequenze, tempi e abort. [Rapporto e limiti](docs/NATIVE_CHARACTERIZATION_FINDINGS.md), [procedura e comandi](research/phase1d/README.md), [sicurezza](docs/NATIVE_AUTOMATION_SAFETY.md). Le fixture importano lo score originale nel Lab, mantenendo CURRENT DEMO UNKNOWN quando manca la mappatura canonica. Nessuna formula o meccanica dichiarata VERIFIED; scoring e contenuti del gioco invariati. Stop dopo1D, nessun commit/push/PR.
