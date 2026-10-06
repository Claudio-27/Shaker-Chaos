# Istruzioni per Shaker-Chaos

## Ambito

La radice del repository è il workspace di progetto. Rispettare le autorizzazioni esplicite dell'utente: niente commit, push, PR, servizi esterni o pubblicazione senza una richiesta che li autorizzi. La fase attuale è 0.3 (artwork forniti e catalogo modulare); le fasi successive richiedono un nuovo incarico. Non aggiungere backend, database, account, XP, valuta, sblocchi o un vault funzionante in questa fase.

## Implementazione indipendente

- Non scaricare, copiare, estrarre, decompilare, incorporare, tracciare o riusare codice e file proprietari del gioco di riferimento.
- Non usare asset, personaggi, frame, audio, dialoghi, loghi, nomi o font del gioco di riferimento come contenuti del progetto.
- Produrre codice e asset originali. Le forme segnaposto non devono imitare visivamente il gioco originale.
- Ogni affermazione di compatibilità deve avere un ID nel registro di ricerca, una procedura riproducibile e uno stato di evidenza. Non trattare descrizioni di terzi come verità numeriche.

## Architettura

- **Preserve information until research proves it irrelevant.** Conservare la storia canonica e derivare il MixState tramite replay; non sostituire i fatti con i soli totali finali.
- Usare VolumeUnit intere sicure. Ml e altre unità fisiche appartengono solo alla presentazione e richiedono una mappatura esplicita sostenuta da ricerca; non inventarla.
- Lo ScoringEngine riceve CompatibilityInput con storia e proiezione; mantenere accessibili start/tick/end, ordine, timing e reset. Non aggregare o scartare tick limitati dalla demo.

- `src/domain` contiene solo TypeScript puro: nessun React, DOM, clock, rete, storage, catalogo globale o dato del giocatore. Passare configurazione e input espliciti.
- Tenere il ciclo applicativo in `src/application`; rendering e Pointer Events in `src/ui`; contenuti pubblici in `src/content`; integrazione browser in `src/platform`.
- Definizioni e contenuti sono guidati dai dati. Usare ID stabili e unità esplicite.
- Non inserire XP, profilo, economia o sblocchi nel calcolo dello score compatibile.
- L'interfaccia di scoring deve restare sostituibile. Un dataset non può trasformare automaticamente una formula inventata in una formula verificata.
- Lo scoring dimostrativo deve restare `UNVERIFIED` e dichiarare **NOT YET COMPATIBILITY-VERIFIED**.
- Password JavaScript, route nascoste e localStorage non proteggono contenuti privati. Non includere segreti o asset del vault nel bundle pubblico o nella cache PWA.

- File e formati visivi si associano soltanto nel registro degli asset; i componenti risolvono ID. Non introdurre path di immagini nel dominio o nei componenti di gioco.
- Animazioni decorative, timer e callback di completamento non devono generare eventi canonici, determinare score o ritardare il servizio. Tenere hitbox e safe area separate dalla silhouette dell’artwork.

## Ricerca

Usare esattamente `VERIFIED`, `STRONGLY_SUPPORTED`, `UNVERIFIED`. Distinguere risultati del software del progetto da osservazioni del gioco originale. Un test automatico superato non promuove un'ipotesi. Aggiornare specifica, registro e fixture quando arriva un'evidenza nuova; annotare contraddizioni e versione del dataset.

## Controlli

Dopo modifiche al codice eseguire `npm run check` e correggere i fallimenti. Testare logica pura con fixture sintetiche dichiarate, casi limite e input non validi. Per cambiamenti di interazione verificare pressione/rilascio/cancellazione e tastiera; per layout provare landscape, portrait e schermi stretti. Non dichiarare controlli non eseguiti. Non scrivere test che attestino una compatibilità non osservata.

Usare dipendenze minime. Mantenere TypeScript strict. Non lasciare artefatti temporanei nel versionamento; `node_modules`, `dist` e log locali sono ignorati.

