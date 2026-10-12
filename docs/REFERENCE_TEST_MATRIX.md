# Matrice dei test sul riferimento — fase 1A

Data 2026-10-06. **Tutte le righe UNVERIFIED; nessun risultato osservato.** Questa matrice organizza test black-box futuri, senza consultare/estrarre codice o asset originali. La preparazione del laboratorio non è un'osservazione del riferimento.

> Preserve information until research proves it irrelevant.

Prima di ciascun test: identificare build/sessione e condizioni iniziali; descrivere strumento/risoluzione di misura, input controllati, ordine/timing, score e output visibili. Conservare richieste respinte, reset e prove contraddittorie. Ripetere almeno tre volte dove possibile. Annotare variazioni tra sessione fredda e reset. Cambiare un fattore per volta; non riutilizzare quantità finali come surrogato della sequenza.

q = più piccolo incremento osservato, t = periodo tick misurato, C = capacità osservata, T = durata sicura misurata. Sono simboli ignoti, non numeri della demo. Una futura associazione q→VolumeUnit richiede evidenza esplicita; ml non è l'unità interna presunta.

## A — Pour / quantità · M-001, M-002, M-010

| Caso | Variabile/test controllato | Osservazione da registrare |
| --- | --- | --- |
| A01 | Tap più breve riproducibile, da vuoto | Incremento minimo e accettazione |
| A02 | Hold di durata misurata crescente | Tick discreti, numero, quantità di ogni tick |
| A03 | Stessa durata con frame rate/condizioni temporali variate | Dipendenza da frame o tempo, frequenza e jitter |
| A04 | Incrementi fino al pieno e oltre | C, clamp/overflow/rifiuto, tick a zero, ultimo parziale |
| A05 | Quantità al confine e passi intermedi osservabili | Conteggi interi, quantum e unità native |
| A06 | Uno vs più pour a totale e durata controllati | Dipendenza da numero di operazioni/pause |
| A07 | A→B vs B→A, stessa quantità per ingrediente | Dipendenza dall'ordine, capacità e transizioni |

## B — Ingredient scoring · M-006, M-007, M-009

Per OGNI ingrediente logico identificato nel riferimento: B-ID-01 un q, B-ID-02 due q, B-ID-03 più quantità (es. quattro q e una quantità intermedia), B-ID-04 curva/seconda differenza per linearità, B-ID-05 coppie con ogni altro ingrediente, B-ID-06 ordine invertito, B-ID-07 vicino alla capacità. Lasciare costanti ghiaccio, guarnizione e shake, se accettati.

Registrare ID logico, quantità/tick, score esatto, tier/identità reazione, fallimenti e azioni accettate. Cercare contributi lineari, non lineari, cap, condizioni e interazioni. Una retta su pochi punti non verifica tutti gli input. Non assumere coefficienti da wiki/forum/video o skin della bottiglia.

## C — Ghiaccio · M-001, M-003, M-004

| Caso | Test | Osservazione |
| --- | --- | --- |
| C01 | Nessuno vs singola aggiunta a liquidi identici | Quantità, score, capacità consumata |
| C02 | Aggiunte ripetute e limite | Conteggio, effetti distinti, rifiuto |
| C03 | Ice prima/dopo liquidi, a stesso conteggio | Ordine, overflow e totali |
| C04 | Ice prima/dopo shake | Interazione, score e disponibilità azione |
| C05 | Ice a recipiente vuoto/pieno | Capacità e phase behavior |

## D — Guarnizione · M-005, M-010

D01 assente/presente; D02 prima/dopo shake; D03 ripetizioni/rimozione se possibile; D04 tipo logico distinto da decorazione; D05 ordine rispetto a ice/pour/serve. Registrare score, accettazione, quantità/phase e reazione senza presumere un bonus o un booleano unico.

## E — Shake · M-004, M-007, M-010

| Caso | Test | Osservazione |
| --- | --- | --- |
| E01 | Una durata T vs più durate sommate a T | Count vs durata cumulativa, pause controllate |
| E02 | Conteggi 0/1/2/più con durata controllata | Crediti discreti o operazioni indipendenti |
| E03 | Sweep grossolano poi raffinato intorno a transizioni | Threshold, inclusività e precisione |
| E04 | Durata massima sicura e primo fallimento | Explosion/failure se presente, condizioni e reset |
| E05 | Immediatamente prima/esattamente/dopo ciascun confine | Score e tier/failure |
| E06 | Shake a vuoto o senza ingredienti specifici | Accettazione, durata effettiva e state transition |

## F — Transizioni · M-002…M-005, M-010

F01 prima agitazione chiude o meno il versamento; F02 Pour dopo Shake; F03 ice/garnish in mixing/shaking/served; F04 Serve a vuoto, durante operazioni e ripetuto; F05 azioni respinte ignorate o con effetti successivi. Annotare ogni tentativo e acceptedActions usando la sequence del fatto corrispondente; non assumere il blocco della UI demo.

## G — Score · M-007, M-009

G01 minimo/massimo osservati (senza generalizzare); G02 negativi/frazioni; G03 arrotondamento e mezzi punti; G04 additive vs multiplicative attraverso controlli fattoriali piccoli; G05 caps; G06 confini esatti. Registrare numeri esatti, non il rapporto visivo della barra. Formule alternative compatibili con le stesse osservazioni restano ipotesi.

## H — Reazioni · M-008

H01 numero di tier e identità logiche; H02 ricerca dei confini numerici; H03 uguaglianza e ±quantum di score realmente raggiungibile; H04 stesso score con storie diverse; H05 sequenze speciali che prevalgono sul tier numerico. Non mappare i tier ai soli rough/balanced/excellent degli artwork del progetto.

## I — Reset / replay · M-010

I01 identico input ripetuto dopo Reset; I02 nuova sessione fredda vs Reset; I03 reset durante pour/shake/after failure; I04 eventuale stato nascosto tra tentativi. Registrare storia completa pre/post reset, build, ripetizioni e differenze. Se gli input non sono deterministici, prima isolare la causa invece di promuovere una media a valore esatto.

## Primi dieci esperimenti consigliati

1. **Baseline:** stato iniziale noto, Serve a vuoto se disponibile, Reset e ripetizione identica. Registrare accettazione, fase, score/reazione e qualsiasi stato residuo.
2. **Quantum minimo:** sul primo ingrediente logico, pressione/rilascio più brevi controllabili; ripetere da vuoto fino a identificare q e la precisione effettiva.
3. **Tick e clock:** stesso ingrediente, hold misurati di durata crescente; contare gli incrementi. Ripetere in condizioni di frame rate diverse come controllo separato.
4. **Capacità:** aggiunte da q fino al limite, poi altri tick; cercare ultimo parziale, clamp, overflow o rifiuto. Non usare 240 come ipotesi privilegiata.
5. **Curva dei singoli ingredienti:** q/2q/4q e altri punti sicuri per ciascun ID, con extras costanti. Confrontare differenze di score senza dichiarare subito linearità.
6. **Pour separati:** totale 4q in un'operazione vs due da 2q, con durata/pause esplicitate. Distinguere count da timing come possibili fattori confondenti.
7. **Ordine di coppia:** A a 2q e B a q, invertire l'ordine mantenendo il resto uguale. Registrare score/tier/phase e capacità.
8. **Ghiaccio:** mix base identico, nessuno/una aggiunta; successivamente una prima vs dopo liquidi, con singolo fattore modificato per coppia. Misurare anche capacità.
9. **Shake:** mix base non vuoto, uno da T vs tre da T/3, scegliendo T sicuro e divisibile nella risoluzione effettivamente misurata. Registrare count, elapsed e totale; poi sweep vicino ai primi cambiamenti osservati.
10. **Guarnizione e transizioni:** coppie controllate assente/presente, prima/dopo shake; tentare pour/ice/garnish dopo Shake e dopo Serve in sottocasi distinti. Verificare Reset tra prove e registrare ogni azione respinta.

Per tutti i dieci: conservare score e tier/identità/failure osservati solo se visibili. Nessuna previsione numerica. Se q/t/identity o input esatto restano incerti, mantenere UNVERIFIED; non usare timestamp sintetici come misura del riferimento.

## Criterio di promozione

Un caso VERIFIED dimostra soltanto la propria traccia/output e ambito. Servono evidenza manuale, build/sessione, procedura, ripetizioni, input validato e confronto dei campi misurati. Un insieme di casi non promuove automaticamente una formula. Ricercare controesempi e confini, documentare la regola candidata e validare un adattatore indipendente prima della produzione. In fase 1A non esiste configurazione compatibile pronta.

## Avanzamento fase 1B (2026-10-11)

La tabella precedente è la pianificazione originaria. Sono avvenute 16 acquisizioni diagnostiche automatiche, senza baseline liquida/score: i confronti a quantità equivalenti, le curve e le soglie restano NOT TESTED. Vedi REFERENCE_FINDINGS.md per copertura per esperimento e case IDs; experiments.json prepara serie non eseguite. Nessuna riga meccanica promossa.

## Chiusura 1C

Native complete input→Serve→score ottenuto. 270 in FULL-DIAG/FULL-01/FULL-02; solo FULL-01/02 sono due script unificati identici. Terzo script interrotto da scope guard. Baseline temporizzata 113/111/110 non esatta. Nessun gate numerico/modifier/pair soddisfatto; matrice restante NOT TESTED. Raw, gap e aborti conservati; nessun valore esterno promosso. Vedi NATIVE_REFERENCE_FINDINGS.md e research/native-runner/protocols.json.

## Esito della fase 1D

Baseline nativa nuova5/5 a270; tre coppie per ciascun Pour14000/14500 ms mostrano delta0 contro15000. La matrice quantitativa ulteriore e le sue lacune sono riportate in NATIVE_CHARACTERIZATION_FINDINGS.md; non trasferire numeri della demo o di terzi nelle colonne q/C/t. Quantum, capacità numerica, coefficienti e mappatura canonica richiedono altre prove. Gli abort e i punti diagnostici errati restano nel dataset.
