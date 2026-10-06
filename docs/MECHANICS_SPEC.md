# Specifica progressiva delle meccaniche

Versione: 0.3 · aggiornamento: 2026-10-06 (fase 1A) · stato: **nessuna meccanica originale verificata**.

Questo documento separa ciò che osserviamo sul gioco di riferimento da ciò che abbiamo inventato nel prototipo. Nessun dato del prototipo deve essere copiato nella sezione compatibilità come se fosse evidenza.

## Stati di evidenza

- `VERIFIED`: osservazione diretta documentata, ripetibile, con input e risultati precisi; evidenze e limiti del claim espliciti.
- `STRONGLY_SUPPORTED`: molte osservazioni coerenti, ma almeno una variabile, copertura o alternativa causale resta da escludere.
- `UNVERIFIED`: ipotesi, descrizione di terzi, dato mancante o valore di prototipo. Non promuovere a verità di produzione.

La confidenza è separata dallo stato. Un claim verificato ha un ambito limitato: non prova automaticamente tutti i casi possibili. Fonte e procedura sono nel [registro](RESEARCH_LOG.md); ogni regola candidata deve referenziare ID di evidenza.

## Inventario di compatibilità (tutto da misurare)

| ID | Meccanica/valore | Valore e unità osservati | Stato | Evidenze | Casi da esplorare |
| --- | --- | --- | --- | --- | --- |
| M-001 | Capacità del recipiente e overflow | Da misurare; unità non note | UNVERIFIED | Nessuna | Vuoto, pieno, oltre capacità, ghiaccio prima/dopo |
| M-002 | Quantità e velocità di versamento | Da misurare | UNVERIFIED | Nessuna | Tap, pressione, rilascio fuori, ingredienti diversi |
| M-003 | Ghiaccio | Da misurare | UNVERIFIED | Nessuna | Quantità, limiti, volume, temperatura/diluizione se osservabili |
| M-004 | Agitazione e tempo | Da misurare | UNVERIFIED | Nessuna | Vuoto, durate, limite, pause, frame rate, eventi cancellati |
| M-005 | Guarnizioni | Da misurare | UNVERIFIED | Nessuna | Tipo, presenza, quantità, ordine |
| M-006 | Identità degli ingredienti e contributi | Da misurare | UNVERIFIED | Nessuna | Singoli ingredienti e coppie, proporzioni controllate |
| M-007 | Equazione e coefficienti score | Da misurare | UNVERIFIED | Nessuna | Variare un fattore per volta, isolare interazioni |
| M-008 | Soglie delle reazioni | Da misurare | UNVERIFIED | Nessuna | Valore sotto, esatto e sopra ciascun confine |
| M-009 | Precisione e arrotondamenti | Da misurare | UNVERIFIED | Nessuna | Frazioni, mezzi punti, saturazione, eventuali negativi |
| M-010 | Ordine delle azioni e reset | Da misurare | UNVERIFIED | Nessuna | Stesso mix finale con sequenze diverse, doppio servizio |

Non abbiamo scaricato o osservato il gioco di riferimento in questo incarico. Non esiste un dataset di compatibilità.

## Scheda per ogni futura meccanica

```text
ID meccanica:
Affermazione precisa e ambito:
Stato: VERIFIED / STRONGLY_SUPPORTED / UNVERIFIED
Valore, unità e precisione:
Condizioni iniziali:
Sequenza di azioni e timing:
Risultato numerico/reazione osservati:
Evidenze: ID R-..., fonte e data/versione della sessione
Ripetizioni e controlli:
Alternative ancora possibili:
Input invalidi / casi limite:
Arrotondamento e inclusività delle soglie:
Dipendenze da altre meccaniche:
Fixture collegata e versione del dataset:
Limiti e prossima prova:
```

## Protocollo di ricerca futuro

Partire da uno stato noto e ripristinarlo tra prove. Cambiare un fattore per volta; annotare ordine, quantità, durata, ambiente e versione osservabile. Ripetere i casi e cercare controesempi. Per le soglie verificare entrambe le parti e l'uguaglianza; per la formula distinguere coefficienti, interazioni, saturazione e arrotondamento. Non usare codice o asset proprietari per ricavare i valori.

La fixture di ricerca conserva claim, stato, evidenza, procedura, risultato atteso facoltativo, confidenza e note. `runResearchFixture` restituisce il confronto numerico ma non cambia lo stato dell'evidenza. L'assenza di risultato atteso è `null`, non un test superato.

## Parametri del nostro prototipo: NON verificati per compatibilità

Dataset `phase-0-demo-v2`, stato `UNVERIFIED`; sorgente `src/content/demoConfiguration.ts`.

| Campo demo | Valore inventato |
| --- | --- |
| Capacità | 240 unità canoniche u; versamento limitato alla capacità, senza overflow |
| Ghiaccio | 0–8 unità; non sottrae volume ai liquidi |
| Agitazione | 0–20.000 ms; ignorata a recipiente vuoto |
| Input | 15 u subito e ogni 180 ms durante Versa; 100 ms subito e ogni 100 ms durante Agita |
| Composizione obiettivo | 1/2 frutteto, 1/4 agrumi, 1/4 acqua frizzante |
| Ghiaccio/agitazione obiettivo | 4 unità e 6.000 ms |
| Guarnizione | ID citrus-wheel |
| Pesi | Proporzioni 60, ghiaccio 15, agitazione 20, guarnizione 5 |
| Soglie demo | balanced >= 55, excellent >= 85; sotto 55 rough |

Formula inventata: proporzioni effettive = quantità / volume totale; distanza = somma delle differenze assolute tra frazioni effettive e obiettivo, inclusi ingredienti non noti. Fattore composizione = clamp(1 - distanza/2, 0, 1). Fattori ghiaccio e agitazione = max(0, 1 - abs(effettivo - ideale)/ideale). La guarnizione ha fattore 1 solo se coincide. Ogni contributo è arrotondato con arrotondamento half-up razionale esatto con BigInt; lo score è la somma esatta dei contributi interi. Un mix vuoto ha sempre score 0 e tier unrated, anche con altri parametri ideali. Quantità e tempi non interi, non sicuri o negativi causano errore esplicito. I coefficienti sono codificati come parti intere 2:1:1; la descrizione in frazioni è solo notazione matematica.

La scala del volume, l'ordine delle azioni e la durata reale delle operazioni non cambiano lo score demo, ma la cronologia conserva questi dati: queste sono scelte temporanee, non fatti del gioco originale. Nessun premio è calcolato. Se le osservazioni future richiedono altre variabili o una diversa equazione, evolvere il modello o sostituire l'adattatore; non attribuire retroattivamente compatibilità alla demo.

## Principio di compatibilità introdotto in fase 0.1

> **Preserve information until research proves it irrelevant.**

Non assumere che un mix finale descriva tutte le variabili meccaniche. Conservare la cronologia completa con sequence, timestamp interi, singoli pour, tick richiesti, inizio/fine, durate per agitazione, ordine di ghiaccio/guarnizione, servizio e reset. Il replay è una derivazione sostituibile; la formula compatibile può usare direttamente il log. Un limite della demo non elimina il tick che lo supera.

I finding futuri devono includere la traccia canonica (schema, regole/proiezione, sequenza, tempi e operazioni), non soltanto i totali. Confrontare anche coppie di storie che producono gli stessi totali ma differiscono per ordine, numero di versamenti, tick o durate. Nessuna di queste variabili è dichiarata irrilevante per il riferimento.

## Distinzione delle unità

- **Canoniche:** `VolumeUnit`, conteggi interi sicuri senza significato fisico assunto. Capacità e granulosità originali restano UNVERIFIED. Le richieste non sono convertite da stringhe o valori ml della UI.
- **Presentazione:** label e formattazione della UI; oggi `u`. Ml o altre unità richiederanno una mappatura esplicita con evidenza e ambito. Non esiste un fattore ml/u di produzione.
- **Tempo:** ms interi relativi nel prototipo, distinti dai crediti di agitazione sintetici. Non sono un claim sulle unità temporali o sul frame rate del riferimento.

I test di presentazione usano scale inventate esclusivamente per verificare che non cambino storia, quantità o scoring. Non costituiscono ipotesi sul riferimento. La cronologia conserva reset e azioni precedenti; la view corrente riparte pulita dopo Reset, mentre l'engine può scegliere la porzione di storia pertinente.

Per nuove informazioni meccaniche: estendere/versionare gli eventi o l'input di compatibilità, documentare le evidenze e aggiungere fixture. Non cancellare dettagli dal log prima che la ricerca ne dimostri l'irrilevanza. La fase 1A costruisce il laboratorio; nessun comportamento del riferimento è stato ancora osservato o promosso.

## Quattro categorie separate in fase 1A

| Categoria | Fonte e contenuto attuale | Uso |
| --- | --- | --- |
| Observed Reference Behavior | ZERO osservazioni reali; futuro observedReferenceResult con evidenze manuali | Descrive solo output effettivamente visibile per input validato |
| Verified Compatibility Rule | ZERO regole promosse; ReferenceCompatibilityConfig è solo research-candidate | Richiede regola esplicita, casi VERIFIED sullo stesso build, controesempi/confini e adattatore indipendente |
| Current Demo Behavior | phase-0-demo-v2, valori inventati elencati sopra | Gioco e proiezione del Lab, DEMO / NOT REFERENCE-VERIFIED |
| Hypothesis / Unverified | expectedObservation facoltativa o test pianificati nella matrice | Non è un risultato osservato e non entra nello scoring |

ResearchCase v1 registra inputSequence come MixEvent schema v1, inputValidation indipendente dallo stato di output, origine DEMO/REFERENCE, evidenze, confidenza e note. La [matrice](REFERENCE_TEST_MATRIX.md) copre A–I; [Compatibility Lab](COMPATIBILITY_LAB.md) documenta tempo virtuale, schema e promozione. Tempi/tick distribuiti dal builder sono sintetici fino a validazione; non dichiarare VERIFIED un input con quantum o timing ignoti.

La demo non implementa tier del riferimento, esplosioni o classificazione originale delle azioni respinte: tali confronti restano UNKNOWN. MechanicalReactionTierId è distinto da ReactionId visuale, con mapping per bartender e fallback; nessun mapping reale fornito. IngredientId resta distinto da skin della bottiglia.
