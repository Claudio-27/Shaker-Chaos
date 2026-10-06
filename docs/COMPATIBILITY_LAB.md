# Compatibility Lab — fase 1A

Aggiornamento 2026-10-06. Infrastruttura di ricerca completata; **zero osservazioni del riferimento e zero valori compatibili VERIFIED**. Nessuna connessione al riferimento, a GitHub o ad altri servizi in questo incarico.

> Preserve information until research proves it irrelevant.

## Accesso e isolamento

Con npm run dev aprire /?compatLab=1. Si possono combinare ?compatLab=1&assetLab=1&visualDebug=1. Il laboratorio ha una sessione in memoria indipendente dal reducer del gioco normale. Asset Lab continua a cambiare solo il loadout del gioco. Un reload perde i dati non esportati.

Il componente e il suo CSS sono importati esclusivamente dietro import.meta.env.DEV; nessun laboratorio compare in produzione anche lasciando i flag nella URL. L'audit applicato agli effettivi file JS/CSS/HTML della build fallisce se trova marker di codice laboratorio. Non è un controllo di autorizzazione o un vault.

## Costruzione precisa

1. Definire id, title, purpose e notes. Usare ID logici degli ingredienti, non filename/skin.
2. Inserire quantità VolumeUnit intera, durata pour facoltativa e numero tick facoltativo, poi Aggiungi pour. Ogni click crea una distinta operazione start/tick/end.
3. Aggiungere ghiaccio e impostare una guarnizione ID, oppure ID vuoto per rimuoverla.
4. Inserire durate shake separate da virgola: 800,800,800 crea tre operazioni start/tick/end e totale richiesto 2400 ms.
5. Avanza tempo aggiunge una pausa al clock virtuale; il prossimo evento registra il nuovo timestamp. La pausa non genera un evento UI/clock nel dominio. Una pausa finale senza evento successivo non appartiene alla fixture esportata.
6. Registra Serve o Registra Reset. Reset conserva la storia precedente e riparte da un tentativo pulito. Nuovo caso vuoto crea invece una nuova sessione.

Tutti i tempi e le quantità controllate sono interi sicuri. Durata pour omessa = 0 ms sintetici, tick omessi = un tick sintetico. Il builder distribuisce la quantità con quoziente/resto interi (resto sui primi tick) e i timestamp con floor(durata × indice / numeroTick), mediante BigInt. Non significa che il riferimento operi così. Sono ammessi anche tick da zero; non è dichiarato un quantum minimo.

Per esempio 12 u in 3 tick su 600 ms genera tick da 4 u a 200/400/600 ms; poi 7 u, un ghiaccio, tre shake da 800 ms e Serve generano 19 u richieste e tre durate distinte. Sono numeri sintetici, senza mapping ml o osservazione del riferimento. Lo score visibile è **DEMO / NOT REFERENCE-VERIFIED**.

Per tick irregolari, operazioni sovrapposte, ingredienti diversi nello stesso pour o altre tracce misurate, importare gli eventi canonici direttamente in JSON. Non ricostruire arbitrariamente la traccia dai soli totali. Il laboratorio permette fatti dopo Serve e input sconosciuti alla UI normale: la proiezione demo può ignorarli/limitarli, ma la storia li conserva.

Limiti dichiarati degli strumenti: 1000 tick per click pour, 100 shake per click, 100 candidati per serie, 10000 eventi per caso importato. Proteggono l'editor, non definiscono meccaniche del riferimento; il dominio canonico non è stato limitato o compattato.

## Stato e confronto

Sono visibili cronologia ordinata con sequence/atMs, MixState, quantità per ingrediente, ghiaccio, guarnizione, fase, conteggio shake, durate trascorse, crediti richiesti/applicati, score demo, tier demo e breakdown. La diagnostica completa mostra richieste originali e quantità applicate per tick, input di scoring e tentativo corrente.

Il runner riceve regole di proiezione e ScoringEngine espliciti. Il fixture non fissa la formula demo come verità: la traccia resta utilizzabile da un adattatore futuro. Oggi la proiezione è phase-0-demo-projection-v2 e lo scorer phase-0-demo-v2.

Il confronto usa solo observedReferenceResult:
- MATCH: tutti i campi osservati sono disponibili e coincidono.
- MISMATCH: almeno un campo noto differisce, anche se altri sono incompleti.
- UNKNOWN / INCOMPLETE: nessuna osservazione, oppure un campo osservato non è implementato/disponibile e non vi sono mismatch noti.

Missing reference fields non sono errori. Per acceptedActions si confrontano soltanto le sequence osservate: azioni extra non osservate sono ignorate, una sequence non disponibile resta UNKNOWN. Le predizioni expectedObservation non entrano nel confronto.

La demo fornisce score, fase e capacità della propria proiezione. Non dichiara un tier meccanico del riferimento, identità della reazione originale, esplosione, soglia temporale o accettazione del riferimento. Non dedurre false dall'assenza di una funzionalità. MATCH sul solo score non certifica formula, input o compatibilità generale.

## Schema e fixture

Schema runtime autorevole: src/research/fixtureCodec.ts, validatore rigoroso di oggetti, enum, numeri, campi/eventi ammessi e cronologia tramite il replay canonico. research/reference-case.schema.json descrive la struttura JSON per editor; i collegamenti tra evidenze, validità del calendario, operazioni e sequence richiedono anche il validatore runtime. Non scarica schemi o dipendenze.

ResearchCase v1 separa:
- inputSequence: fatti di dominio controllati, array di MixEvent schema v1.
- inputValidation: stato e riferimenti alla verifica dell'input esatto; timestamp sintetici/unità non mappate restano UNVERIFIED.
- expectedObservation: ipotesi/predizione facoltativa, mai risultato osservato.
- observedReferenceResult: solo campi effettivamente osservati, facoltativi.
- id/title/purpose, origin DEMO o REFERENCE, status, confidence, evidence e notes.

ObservableResult supporta score numerico anche negativo/frazionario, reactionTier logico libero, reactionId, exploded, phase, capacityUnits, timingThresholdMs e acceptedActions. Le quantità/timing canoniche rimangono intere; uno score osservato frazionario non viene convertito in coefficiente o aritmetica di scoring.

Evidence contiene ID, scope reference-manual, data ISO, fonte, build/sessione identificata, procedura e ripetizioni realmente effettuate. VERIFIED richiede osservazione, evidenza e inputValidation VERIFIED collegato a evidenze esistenti. STRONGLY_SUPPORTED richiede osservazione/evidenza, conservando le incognite. Confidenza low/medium/high è separata. Questi controlli validano dichiarazioni e struttura, non possono attestare che un test sia realmente avvenuto: è necessaria revisione umana.

DEMO può contenere predizioni sintetiche ma mai observedReferenceResult, evidenza del riferimento o status VERIFIED. research/demo-cases/demo-sequence.json è l'unico esempio, separato dalla cartella research/reference-cases inizialmente vuota. I mock di validazione presenti nei test sono esplicitamente sintetici e non vengono distribuiti come fixture di riferimento.

Esporta caso JSON produce JSON leggibile con proprietà ordinate, mantenendo l'ordine degli array/eventi. Copia JSON usa la clipboard solo sul click; in alternativa copiare la textarea. Importa JSON accetta un caso o un array di 1..100 casi, validandoli tutti. Non salva file o dati automaticamente e non effettua richieste remote. Salvare manualmente gli export nel repository con ID e nomi stabili, poi revisionarli. Per un test CLI eseguire decodeResearchCase(json, regoleProiezione), poi runCase(caso, regole, scorer).

Modificare la sequenza rimuove dal nuovo caso osservazioni, stato elevato ed evidenze associati al vecchio input. La vecchia evidenza va esportata prima. Modificare il solo titolo non modifica eventi/scoring. Import/export non promuovono stati; ogni ripetizione dovrebbe avere un ID distinto o un registro esplicito.

## Serie e ricerca dei confini

Il caso corrente senza Serve è la base. Selezionare quantità o durata shake e una lista di interi. Ogni candidato parte da una copia della stessa storia, aggiunge un pour o uno shake, poi Serve. Le evidenze/predizioni del caso base non vengono ereditate. Anche una base verificata genera candidati UNVERIFIED.

Prepara quantità 1…10 e Prepara durate candidate forniscono esempi sintetici; nessuna soglia reale è implicata da 6000 ms. Il JSON della serie è un array di ResearchCase nello stesso formato. Il selettore carica un candidato per ispezione; la textarea conserva l'intera serie finché non si esporta un caso singolo.

Usare bracket/sweep più fine solo dopo avere misurato intervalli plausibili del riferimento. Annotare inclusività e precisione, ripetere sotto/esatto/sopra. Non costruire un framework scientifico o inferire coefficienti dalla demo.

## Promozione e reazioni

ReferenceCompatibilityConfig è soltanto un research-candidate, senza valori iniziali né collegamento al composition root. Ogni meccanica candidata richiede claim, value, status VERIFIED e caseIds verificati sullo stesso referenceBuild. La copertura è esplicita per quantity/pour/ingredients/ice/garnish/shake/phases/score/reactions/reset; non presume che gli ingredienti siano lineari.

validateReferenceCompatibilityConfig rifiuta evidenze non verificate, ID mancanti e build incoerenti. Espone gruppi mancanti e productionReady:false. assertProductionCompatibilityReady rifiuta anche un candidato completo in fase 1A: in futuro occorreranno equazione/adattatore indipendente validato, copertura dei confini e una promozione esplicita revisionata. Non basta cambiare un'etichetta o superare i test.

MechanicalReactionTierId è una label senza enum a tre valori o ordinamento implicito. MechanicalReactionPresentation permette mapping per bartender da N tier logici a presentation ReactionId, anche più tier su una visuale, con fallback deterministico. Nessun mapping del riferimento è fornito ora. reactionTier del risultato demo resta il precedente enum demo; il runner non lo spaccia per tier del riferimento. ScoreResult.mechanicalReactionTierId è un campo logico facoltativo già disponibile: un adattatore indipendente può fornire qualsiasi tier, e il runner lo confronta senza inferirlo dal tier demo. La conversione in artwork rimane una policy separata; nessuna è collegata ora alla UI demo. Il breakdown e gli altri campi legacy restano demo.

IngredientId resta indipendente dai bottleSet/skin: un ID logico X può avere una skin Y senza cambiare quantità o scoring. Nessuna proprietà del riferimento è dedotta dalle tre bottiglie.

## Limiti da risolvere con evidenza

Ms interi, quantità intere sicure e storia da stato vuoto sono il modello attuale. Frame IDs, risoluzione sub-ms, stato iniziale diverso, altre guarnizioni/ghiacci, fallimenti o azioni rifiutate osservate possono richiedere estensioni versionate dei fatti/proiezioni. Il parser attuale consente solo gli eventi schema v1; non eliminare fatti nuovi per adattarli alla demo.

La proiezione mantiene capacità 240, clamp, ice senza volume, shake vuoto ignorato e limite 20000 ms: sono esclusivamente demo. Il normale adapter blocca azioni dopo Serve; il laboratorio aggira quella policy ma mantiene la storia di dominio. Il risultato demo ha quattro componenti e massimo 100; non sono limiti imposti allo score osservato.

Il replay completo è lineare e gli append ripetuti rigiocano la storia; sequenze molto lunghe richiederanno ottimizzazione senza perdita d'informazione. Il calendario dell'evidenza non dimostra la fonte. Zero meccaniche promosse. Nessuna nuova dipendenza, artwork, economia, account, backend o vault.

## Validazione della consegna — 2026-10-06

- npm run check: TypeScript, lint, 91/91 test e build superati; 23 test nuovi, 68 precedenti preservati. Nessun fallimento o skip.
- Audit della produzione: 38 moduli, nessun chunk Lab, CSS normale invariato; shell 7 file, 42 immagini pubbliche on-demand, zero artwork precacheati.
- Browser DEV: esempio 12 u in tre tick su 600 ms + 7 u + un ghiaccio + tre shake 800 ms + Serve: 19 u, 3 shake, 2400 ms richiesti/applicati, score DEMO 57/100 balanced. UNKNOWN senza osservazioni. È una verifica del nostro software, non un risultato del riferimento.
- Export/import del caso e della serie, reset con prefisso storico conservato, input osservazione non valido respinto, sweep delle otto durate candidate: funzionanti. Nessuna osservazione reale inserita.
- Normale gioco indipendente: Pour/Shake/Serve/Reset da tastiera verificati, 15 u e score demo 30 (34 con un ghiaccio); Lab resta invariato. Bartender A/B, studio+tavolo fornito e tiki+banco segnaposto, Asset Lab e Visual Debug funzionanti.
- Lab a 1024×768 e 320×740: dimensioni DOM effettive verificate, nessun overflow orizzontale; scroll verticale previsto. Override del viewport ripristinato.
- Produzione con compatLab=1&assetLab=1&visualDebug=1: zero pannelli laboratorio/debug, tutte le immagini caricate, gioco funzionante.
- Offline reale su preview 4181: dopo pronto offline, server arrestato; reload, pour/shake/serve/reset riusciti e immagini disponibili. Server poi riavviato.
- Nessuna modifica ad artwork, regole demo, formula scoring, session replay, cache policy, manifest o lockfile. Nessuna dipendenza nuova. Solo tipo meccanico facoltativo aggiunto al risultato, senza modificare output del demo.

Touch fisico e pointercancel hardware non riprovati in fase 1A; HoldButton è invariato. Zero valori/finding del riferimento VERIFIED; nessun candidato reale promosso. Fermarsi dopo 1A. Nessun commit/push/PR o modifica dei remote.
