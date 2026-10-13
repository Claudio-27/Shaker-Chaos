# Specifica progressiva delle meccaniche

## Presentazione 2B — nessun retuning

Tutti i numeri, le equazioni e le policy 2A sotto restano identici. I seguenti valori sono esclusivamente di presentazione:

| Feedback | Derivazione / comportamento |
| --- | --- |
| Pour in preparazione | Start accettato senza tick applicati; attivo anche durante gli 800ms di avvio e fino al primo tick a 925ms. Nessun liquido inventato. |
| Gauge | Quantità applicata / capacità canonica; target CSS autorevole, transizione 100ms senza overshoot. Reset immediato a zero. |
| Rischio tranquillo | Sotto entrambe le soglie successive. |
| Energia | Count ≥ failureCount−3 oppure durata ≥ floor(warningDurationMs/2): oggi 3 / 3000ms. |
| Rischioso | Count ≥ failureCount−2 oppure durata ≥ floor(warningDurationMs×2/3): oggi 4 / 4000ms. |
| Pericolo | Count ≥ failureCount−1 oppure durata ≥ warningDurationMs: oggi 5 / 6000ms. Nessun countdown esatto nel gioco. |
| Assaggio / reveal | Score già congelato a Serve; score a 650ms, reazione a 830ms, breakdown a 1050ms. Skip/failure/movimento ridotto mostrano subito tutto. |

Disponibilità: Pour solo mixing con ingrediente e spazio; Shake solo tentativo attivo con liquido e senza Pour; Ice solo mixing e sotto max; Garnish e Serve solo ready dopo rilascio; Garnish una volta. Ingredienti non selezionabili durante Pour o dopo mixing. Dopo risultato/fallimento resta soltanto Nuovo drink.

Eccezione di feedback: Ice a 2/2 in mixing è aria-disabled, ma riceve ancora un tentativo di attivazione per mostrare “Il ghiaccio basta così”. Il handler non invia alcuna azione di dominio. Fuori mixing il pulsante è nativamente disabled. Il garnish accettato resta disabled e segnato ✓.

DOMAIN STATE: storia, quantità intere, count/durata, failure e frozen score. PRESENTATION STATE: copy, pose, colori, CSS, tappe del reveal e cue. Nessuna animazione aggiunge quantità, tempo, score o fatti. Porta audio silenziosa; nessuna nuova meccanica o economia.


## Active Phase 2A production specification — 2026-10-13

This is **ORIGINAL SHAKER-CHAOS TUNING**, not verified reference reproduction. Research is closed; old evidence statuses below describe historical research only.

Active source: `classicInspiredTuning.ts`. Capacity240u; each new Pour costs800ms startup, then3u every125ms. Integer formula and boundary cases:0/799/800/924ms→0u,925→3u,1050→6u. Full theoretical hold10800ms. Rendering FPS does not determine quantity.

MIXING permits Pour/Ice; first accepted Shake requires liquid and closes mixing. After a positive elapsed completed Shake, READY_TO_SERVE allows one garnish and Serve. RESULT freezes success or failure; Reset starts a clean attempt and retains history.
Two accepted Ice max (+500/+500), separate from liquid. Garnish +100 once after Shake. Shake bonuses by accepted count0..5:0,0,0,5,15,30. Sixth accepted start or cumulative accepted duration≥8000ms fails immediately, score0; warning at fifth action /6000ms.

Ingredient coefficients:orchard8000,citrus7200,soda4800, equilibrium bonus1800 for2:1:1 using squared rational closeness and fill weighting. Ideal full liquid-only8800, complete modifiers9930. Total integer0..10000. Nine original mechanical tiers have inclusive thresholds0,1500,3000,4500,5500,6500,8000,9000,9700; artwork mapping stays independent. See [full equations and assumptions](APPROXIMATE_GAMEPLAY_TUNING.md).

Canonical VolumeUnit and presentation units such as ml remain distinct; no physical conversion is defined. **Preserve information until research proves it irrelevant.** Start/tick/end, timing, count, requested/applied quantities and Reset remain available for original tuning/debugging. No UI coordinates or animation state enter history.

All subsequent demo/reference procedures in this document are retained historical notes. They do not authorize reference experiments during normal development.


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

## Fase 1B — acquisizioni del 2026-10-11

Vedi REFERENCE_FINDINGS.md e research/reference-builds.json. SWF Archive identificata da SHA-256 ed eseguita in Ruffle; diagnostica separata del museo con hash sconosciuto. 16 acquisizioni / 16 fixture UNVERIFIED, zero score e zero quantum/totali calibrati. M-001…M-010 restano UNVERIFIED; nessun valore del riferimento introdotto nella configurazione/demo.

Durata richiesta, intervallo DOM e durata/tick effettivi Flash sono variabili distinte. Disuguaglianze DOM osservate non dimostrano una regola di versamento/scoring. Selezionare ice/lemon non attesta IceAdded/GarnishChanged; sintesi DOM consegnata non attesta accettazione. Score non visibile non è 0; limiti dello schema non sono capacità.

ObservedQuantum ignoto, mapping a VolumeUnit non stabilito, ml esclusivamente presentazione. Preserve information until research proves it irrelevant. Conservare raw e correzioni senza promuovere input incompleti. Serie a quantità equivalenti, coefficienti, bonus ice/garnish/shake, esplosioni, soglie e 10245 restano NOT TESTED con gate espliciti; nessun massimo dichiarato.

## Stato dopo 1C

Score originali letti: 114 diagnostico; 113/111/110 per Pour5000+Shake1000 richiesti; 270 in tre processi freddi con indicatore pieno (due script unificati, uno stepwise). Sono output circoscritti, non coefficients/bonus/capacità. Gate tre script identici parziale 2/3; nessuna regola meccanica VERIFIED, nessuna conversione ml, scoring demo invariato. Serie meccaniche ulteriori e soglie restano gated. Dettagli/case IDs in NATIVE_REFERENCE_FINDINGS.md.

## Stato dopo 1D

La relazione circoscritta baseline-270-v1 → score270 passa cinque nuove sessioni fredde identiche, con un tentativo precedente interrotto. Stato STRONGLY_SUPPORTED della procedura nativa; nessuna regola VERIFIED. Il plateau osservato per Pour richiesti14000/14500/15000 ms non è una capacità numerica, un coefficiente o un quantum. Le quantità canoniche restano UNMAPPED; ml è una presentazione futura con mapping da dimostrare. Tutti i delta misurati si riferiscono a procedure e ambiente fissati, non a bonus isolati. Vedi NATIVE_CHARACTERIZATION_FINDINGS.md per prove, fallimenti e gate non raggiunti. Scoring demo invariato.

La relazione limone dopoShake sulla baseline piena mostra tre cold pair270→370 (delta100), con slice visibile sul calice: STRONGLY_SUPPORTED soltanto per quella procedura. PrimaShake una prova resta270; due click dopoShake restano370 in una prova. Ice primaPour mostra cubetti in movimento, ma accepted count/completion ignoti; due click possono lasciare senza risultato benché la sequenza OS sia completa. Questi esiti non verificano coefficienti globali e non modificano lo scoring.

Shake: conteggi1..5 a1000ms mostrano270/270/275/285/300; totale richiesto4000ms con1/2/4 operazioni mostra275/285/285. Singole prove, tempi effettivi/pause diversi: UNVERIFIED. Esplosione visibile dopo agitazione continua10000/15000ms, auto failure0 primaServe;5000ms normale275. Nessuna soglia fine, regola di count, quantum o capacità canonica stabilita. Una coppia Pour continuo/segmentato a5000ms richiesti dà111/65; quantità uguali non dimostrate.

## Protocollo1E predisposto

Separare **OBSERVED PROCEDURE EFFECT** da **INFERRED REFERENCE MECHANIC**. PourCount e durata totale richiesta restano variabili distinte; confronti causali richiedono controllo di pause, catture e hold effettivi. Il nuovo rapporto visivo di righe occupate nella ROI è solo metadata di ricerca UNVERIFIED, non VolumeUnit, non ml e non quantum. **Preserve information until research proves it irrelevant.** Nessuna nuova formula, capacità, bonus o mappatura della demo. I nuovi run devono superare entrambi i gate freschi; quelli1D non li sostituiscono.

## Chiusura1E —13ottobre2026

L’utente ha sostituito il requisito di riproduzione esatta con un tuning originale approssimativo e autorizzato ricerca pubblica online, interrompendo le prove native. Stato CLOSED_WITH_APPROXIMATION.53nuovi raw/56fixture;totali151/160/2,0VERIFIED/9Strong/151Unverified.52sequenze OS complete,45score,7senza score,1abort al preflight (targetPID14452 assente, nessun input confermato).204file storici intatti.

Controlli4repeat ciascuno:270 e111. Pour1/2/3/4/5press a5000ms:111/111/111;89/87/87;63/63/65;39/38/41;17/17/20.10×500:3volte senza score. Due nuovi pairPour matched≤100ms conservano delta−48/−46; altri4unmatched restano espliciti. Niente capture durantehold:63/63/63;gap+2s:65/65/63. Short500/750 senza score2volte,1000→5/3,1500→15/17. Garnish3pairmatched270→370.

Nessun quantum, capacità canonica, coefficienteingrediente, bonusIce o formula di riferimento verificati. Nuovo profilo originale:240u, startupPour800ms,3u/125ms, garnish100, Ice500×2 cap1000, Shakebonus0/5/15/30, rischio8s/6azioni, scorebudget10.000. Sono scelte UNVERIFIED pronte per la prossima implementazione; demoPhase0/artwork invariati. Ml resta solo presentazione futura, mapping=null. Preserve information until research proves it irrelevant.

Fonti pubbliche e44punti:CAUSAL_MECHANICS_FINDINGS.md e APPROXIMATE_GAMEPLAY_TUNING.md. Nessuna Phase1F iniziata; niente commit/push/PR/GitHub/remoti/storia Git. SchermoRELEASED07:51:47UTC, Ruffle posseduto assente, ABORT conservato.
