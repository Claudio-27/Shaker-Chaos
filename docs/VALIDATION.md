# Verifica delle fasi 0, 0.1 e 0.2

## Fase 0.2 — composizione e asset

Data di completamento: 2026-10-06. Solo software e composizione del progetto; nessuna ricerca di compatibilità Phase 1.

Ultimo `npm run check` dopo le modifiche al codice: TypeScript strict, ESLint, **53 test tutti passati** e build Vite completati. I 49 test precedenti sono conservati; aggiunti 4 test utili su asset reali/metadati, input invalidi, piano della sola scena attiva e copertura delle reazioni. Nessuna dipendenza nuova. Il dominio, la cronologia e lo scoring non sono stati modificati.

Asset attuali: 21 SVG geometrici originali, 11181 byte complessivi; build con 28 file pubblici nella precache. Bundle JS circa 79.55 kB gzip, CSS circa 4.34 kB gzip. Questi pesi non stimano gli artwork finali.

Verifiche effettive nel browser integrato:

- 1024×768 4:3 landscape: default e risultato 100/100 dentro una schermata, senza overflow orizzontale o verticale della pagina.
- 1280×800 16:10 landscape: default dentro una schermata, nessun overflow della pagina.
- 1440×900 desktop: composizione desktop dentro una schermata dopo l'adattamento dell'area del personaggio.
- 768×1024 portrait e 390×844 narrow: zone riordinate, scorrimento verticale utilizzabile, nessun overflow orizzontale; nessun bottone misurato sotto 44×44 px.
- 320×568: nessun overflow orizzontale anche con scrollbar desktop non sovrapposta; nessun bottone sotto 44×44 px. La pagina è intenzionalmente verticale.
- Mouse, Invio e Spazio: ciclo di mix completo 60/30/30 u, 4 cubetti, 6 s e guarnizione; score demo 100/100 e breakdown 60+15+20+5, comandi bloccati dopo servizio, focus sulla reazione; reset pulito e ritorno alla posa idle.
- Rilascio tramite trascinamento fuori da Versa: il dosaggio si è fermato a 30 u; quantità invariata durante la successiva interazione con Ghiaccio.
- Debug attivo in sviluppo con query: confini delle zone, area sicura, hitbox e viewport/breakpoint visibili. In produzione la stessa query non mostra overlay né classe debug.
- Nessun errore o warning di console osservato nel ciclo online di produzione.
- Con il server locale completamente arrestato: ricarica offline, asset presenti, nuova preparazione e servizio riusciti (15 u, score 30/100, posa rough disponibile offline). La cronologia in memoria non persiste attraverso reload, come nelle fasi precedenti.

La validazione non certifica tablet fisici, più dita, cancellazioni del sistema operativo, lettori di schermo, codec raster, frame rate o memoria degli artwork futuri. Le animazioni attuali sono image swap/transform decorativi; nessun timer visivo modifica eventi o scoring. La PWA precachea ancora tutti i piccoli asset pubblici della build: i futuri cataloghi grandi richiederanno una policy dedicata, come documentato in VISUAL_ARCHITECTURE.md.

Nessun artwork finale, asset del riferimento, sistema di progressione/account/vault o valore di compatibilità aggiunto. Nessun servizio esterno, commit, push o PR.

## Fase 0.1 — architettura del dominio

Data: 2026-10-05. Verifica del nostro software; Phase 1 e ricerca di compatibilità non avviate.

`npm run check` completato con esito positivo dopo l'ultima modifica al codice:

- TypeScript strict: `tsc --noEmit`.
- ESLint, incluse le restrizioni di dipendenza del dominio.
- **49 test, tutti passati**: 26 in più rispetto alla fase 0. Replay deterministico, ordine a timestamp uguali, interi sicuri e overflow, quantità richieste e applicate, sequenze diverse a totali uguali, operazioni e durate, reset con cronologia conservata, isolamento delle unità di presentazione, sostituzione dello scorer, invarianti applicative e regressioni PWA.
- Build di produzione Vite e precache dei 7 file pubblici. Nessuna modifica ai CSS o alla grafica della demo.

Prove ripetute nel browser integrato, a 1024×768:

- Mouse, Invio e Spazio: versamenti, ingredienti, ghiaccio, guarnizione e agitazioni successive funzionanti.
- 60 u frutteto, 30 u agrumi, 30 u acqua frizzante, 4 cubetti, 6 s e guarnizione: risultato demo 100/100, breakdown 60+15+20+5; servizio blocca i comandi e porta il focus al risultato.
- Reset: mix vuoto, ghiaccio e agitazione azzerati, guarnizione rimossa e nessun risultato precedente. La conservazione della cronologia è verificata dai test del dominio.
- Rilascio con trascinamento fuori dal pulsante: dosaggio fermo a 15 u anche durante l'interazione successiva.
- Nessun errore o warning di console osservato nel ciclo online.
- Server locale arrestato completamente: ricarica offline, nuovo versamento e servizio riusciti. La partita resta in memoria e non è persistita attraverso la ricarica.

L'etichetta attuale `u` rappresenta unità canoniche. I `ml` nel verbale storico sotto erano soltanto un'etichetta della UI di fase 0: non documentano una conversione fisica o una misura del gioco originale. Nessun fattore di conversione è stato stabilito.

Nessun valore di scoring del riferimento introdotto, nessun servizio esterno usato, nessun commit, push o PR creato. Restano applicabili i limiti delle prove su dispositivi reali riportati sotto.

## Fase 0 — verbale storico

Data: 2026-10-04. Verifica del nostro software; nessuna verifica del gioco di riferimento.

### Controlli automatici eseguiti

`npm run check` completato con esito positivo:

- TypeScript strict: `tsc --noEmit`.
- ESLint, incluse le restrizioni di dipendenza del dominio.
- 23 test con il runner Node: scoring, immutabilità, input invalidi, limiti del mix, ciclo partita, sostituzione engine, stati delle evidenze e service worker.
- Build di produzione Vite e generazione della precache dei 7 file pubblici della shell.

Dipendenze installate dalla cache npm in modalità offline. Nessun commit, push o PR creato.

### Prove nel browser integrato eseguite

- 1024×768 landscape: tre pannelli, comandi e footer entro il viewport, nessun overflow orizzontale.
- 768×1024 portrait: due pannelli di preparazione e risultato sotto, scorrimento verticale utilizzabile, nessun overflow orizzontale.
- 390×844: una colonna con tre selettori di ingrediente, nessun overflow orizzontale.
- Mouse e tastiera: versamento, selezione, ghiaccio, guarnizione e agitazione.
- Mix controllato: 60 ml frutteto, 30 ml agrumi, 30 ml acqua frizzante, 4 cubetti, 6 s e guarnizione. Risultato demo 100/100; breakdown 60+15+20+5. Servizio blocca le azioni e sposta il focus al risultato.
- Reset: ritorno a mix vuoto, senza score o aggiunte della partita precedente.
- Pressione con trascinamento e rilascio fuori dal pulsante: il dosaggio si ferma; nessuna aggiunta successiva durante altre interazioni.
- Offline: attivata la PWA, arrestato completamente il server locale, ricaricata la pagina, versato e servito un nuovo mix. Shell e logica restano operative. Nessun salvataggio della partita è previsto.
- Nessun errore o warning di console osservato durante la prova del ciclo di gioco.

La prova offline ha individuato un problema con `Vary: Origin` sugli asset Vite. Il lookup della cache ora ignora Vary esclusivamente per i file pubblici presenti nella allowlist; API, vault e percorsi estranei restano esclusi. Aggiunto test di regressione e ripetuta con successo la prova con server arrestato.

### Controlli ancora da svolgere

Non sono stati testati tablet fisici, penna, gesture reali con più dita, cancellazioni imposte dal sistema operativo, installazione standalone, Safari/iOS, lettori di schermo o aggiornamenti PWA su più schede. App e asset funzionanti offline non costituiscono protezione dei contenuti privati. Queste verifiche e le rifiniture appartengono alle fasi successive.
