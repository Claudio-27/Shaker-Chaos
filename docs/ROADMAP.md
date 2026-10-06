# Roadmap

Fasi 0–0.3 completate. Fase 1A completata come infrastruttura di ricerca; osservazioni/meccaniche verificate e fasi successive restano da svolgere.

| Fase | Obiettivo | Criterio di uscita |
| --- | --- | --- |
| 0 — Architettura e harness di ricerca | React/TS/Vite, dominio puro, catalogo originale, demo esplicitamente non verificata, schema delle evidenze, test e PWA minima | TypeScript, lint, test e build superati; dipendenze sostituibili; istruzioni di prova documentate |
| 0.1 — Storia e unità canoniche | Eventi deterministici, replay, VolumeUnit intere, input scoring completo | Completata: storia preservata; nessuna conversione ml presunta |
| 0.2 — Composizione e segnaposto | GameStage responsive, registro visuale, animazioni e visualDebug | Completata: safe area e hitbox distinte; 53 test alla chiusura |
| 0.3 — Artwork e catalogo modulare | Entrambi i bartender forniti, environment/counter indipendenti, bundle dichiarativi, Asset Lab dev, cache selettiva | Inventario/hash/provenienza, slot indipendenti, controlli e rapporti; nessuna economia o consegna privata |
| 1A — Compatibility Lab e fixture | Sequenze canoniche controllate, osservazioni manuali separate, confronti parziali, sweep e guard di promozione | Lab DEV isolato, schema validato, zero fixture reali inventate, test e build/audit superati |
| 1B — Meccaniche di miscelazione verificate | Osservare capacità, versamento, ghiaccio, agitazione, guarnizioni e ciclo della partita | Specifica con unità, procedure, evidenze e casi limite riproducibili; nessun coefficiente presunto |
| 2 — Compatibilità comportamentale 1:1 dello scoring | Dataset ed equazione sostenuti da evidenza indipendente | Fixture di riferimento con punteggi numerici esatti, soglie e arrotondamenti; discrepanze spiegate; interfaccia invariata |
| 3 — Bartender, arte, animazione e suoni originali | Sistema espressivo e identità propria | Asset originali e provenienza documentata; reazioni coerenti con gli eventi di dominio |
| 4 — Rifinitura tablet/PWA | Ergonomia, accessibilità, installazione e offline | Verifiche su tablet fisici, entrambi gli orientamenti, penna/touch, riduzione movimento e ciclo di aggiornamento |
| 5 — Progressione, XP, valuta e sblocchi | Politiche premio separate e profilo del giocatore | Stesso mix e dataset producono sempre lo stesso score, indipendentemente dal profilo; premi non duplicati |
| 6 — Contenuti estesi | Altri ingredienti, bartender, ricette e scoperte | Catalogo validato e versionato; contenuto e policy distinti dalla UI |
| 7 — Area privata/vault sicura | Autenticazione/sessioni server e consegna autorizzata dei contenuti | Endpoint protetti, asset non presenti nel bundle pubblico, cache e revoche testate; niente sicurezza solo client |
| 8 — Account/cloud/backend opzionali | Salvataggi remoti e sincronizzazione, se richiesti | Contratti versionati, conflitti e migrazioni definiti; trattamento dei dati e disponibilità chiariti |

La PWA minima e le icone geometriche della fase 0 sono infrastruttura della demo; non completano le rifiniture della fase 4 né il sistema artistico della fase 3. La promozione di una meccanica a compatibile richiede evidenza, non il solo superamento dei test del progetto.

La fase 0.3 anticipa l'integrazione degli artwork forniti, senza completare la direzione artistica o il suono della fase 3, la validazione su tablet fisici della fase 4, l'economia della fase 5 o il vault della fase 7. Il rapporto ASSET_INGEST_REPORT.md documenta limiti e verifiche. La fase 1A successiva è stata autorizzata esplicitamente e documentata. Fermarsi dopo 1A: osservazioni black-box sul riferimento e implementazione compatibile richiedono un nuovo incarico.
