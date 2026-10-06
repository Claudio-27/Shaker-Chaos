# Shaker-Chaos

Gioco browser indipendente, pensato prima di tutto per tablet. Questa versione completa le **fasi 0–0.3**: fondazione, storia canonica deterministica, composizione visiva e integrazione degli artwork forniti in una demo giocabile. La ricerca di compatibilità della fase 1 non è iniziata.

**NOT YET COMPATIBILITY-VERIFIED.** Formula, ingredienti, capacità, tempi e soglie della demo sono inventati per verificare l'architettura. Non costituiscono risultati di ricerca sul gioco di riferimento.

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

## Come provare la demo

1. Scegli uno dei tre ingredienti originali.
2. Tieni premuto **Versa** per aggiungerlo, oppure usa Invio/Spazio sul pulsante.
3. Aggiungi ghiaccio, tieni premuto **Agita** e scegli la guarnizione.
4. Premi **Servi il mix** per vedere punteggio, reazione e contributi.
5. Usa il pulsante di reset per ricominciare. Dopo il servizio il mix è bloccato.

Il riquadro "Obiettivo della demo" rende espliciti i parametri temporanei. Non esistono ancora ricette da scoprire, premi, XP, valuta, profili o salvataggi.

## Struttura

```text
src/
  domain/        storia canonica, unità intere, replay puro e scoring dimostrativo
  application/   ciclo della partita e composizione delle dipendenze
  content/       catalogo pubblico e configurazione temporanea
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

## Rafforzamento di fase 0.1

**Preserve information until research proves it irrelevant.** La sessione registra eventi di dominio con ordine esplicito, tempi interi, start/tick/end delle operazioni, ghiaccio, guarnizione, servizio e reset. Reset svuota il mix corrente ma conserva i fatti precedenti per l'analisi. Gli eventi restano in memoria; non è stato aggiunto un sistema di salvataggio o un'interfaccia di ricerca.

Le quantità sono `VolumeUnit` intere. La UI mantiene il layout e mostra **u**, senza assumere un fattore di conversione in ml. La composizione demo è codificata in parti intere e lo scoring usa aritmetica razionale BigInt. Nessun valore o comportamento del gioco di riferimento è stato verificato. La fase 1 non è iniziata.

## Fase 0.2: composizione e asset originali

Scena responsive con bartender centrale, bottiglie, banco/preparazione, comandi, reazione e HUD. I file visivi sono associati tramite ID nel registro `src/content/publicVisualCatalog.ts`, separati dal dominio e dal ciclo di gioco. In quella fase erano presenti soltanto SVG geometrici originali segnaposto; gli artwork forniti sono integrati nella fase 0.3 descritta sotto.

Composizione prioritaria per 1024×768 e 1280×800 landscape, riordino in portrait e colonna su mobile. `npm run dev` con query `?visualDebug=1` mostra confini, safe area, hitbox e breakpoint; il debug è escluso dalla produzione anche con la query.

[Vedere l'architettura visiva](docs/VISUAL_ARCHITECTURE.md) per mapping, separazione delle animazioni, fitting e cache della fase corrente. In fase 0.2 non erano presenti selezione ambienti o artwork finali; Asset Lab è aggiunto in fase 0.3. Nessuna fase 1, progressione o funzione vault introdotta.

## Fase 0.3 — artwork e catalogo modulare

Entrambi i bartender forniti, ambiente tiki e banco indipendente, bottiglie/shaker/calice PNG integrati; originali preservati. [Rapporto completo e inventario](docs/ASSET_INGEST_REPORT.md), [catalogo e bundle](docs/CONTENT_CATALOG.md), [architettura visiva](docs/VISUAL_ARCHITECTURE.md).

In sviluppo aprire /?assetLab=1 per cambiare bartender, ambiente, banco, bottiglie ed effetto; aggiungere &visualDebug=1 per le safe area. Nessuna persistenza o negozio. In produzione la PWA precachea solo la shell e riscalda la scena attiva: le reazioni non ancora scaricate possono usare idle offline. Controlli: npm run check, 68 test passati. Phase 1 non iniziata.
