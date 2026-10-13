# Phase1E — CLOSED_WITH_APPROXIMATION

Chiusura del13ottobre2026 secondo la nuova richiesta dell'utente: gioco originale, tuning approssimativo, stop alle prove di precisione e ricerca online mirata autorizzata. La scelta supera il precedente obiettivo di riproduzione esatta per questa fase, senza trasformare stime o fonti esterne in osservazioni. Nessuna Phase1F iniziata.

**Preserve information until research proves it irrelevant.** Canonical gameplay history, proiezione, scoring, UI e progressione restano separati. VolumeUnit intere del progetto, timing OS frazionario di ricerca e pixel del gauge sono categorie differenti. Nessuna conversione ml.

## Esiti principali

CONTROL-FULL:270/270 il12 ottobre e270/270 nella ripresa del13 ottobre; CONTROL-5000:111/111 e111/111.4 cold indipendenti per controllo, medesimi hash procedurali/ambiente, nessuna deriva osservata. Fonte:run e review IA-1E-CONTROL-*.

Matrice Pour, totale richiesto5000 ms:1press→111/111/111;2→89/87/87;3→63/63/65;4→39/38/41;5→17/17/20;10→nessuno score3 volte. Niente medie o equivalenza di liquido. Gli input OS sono confermati; l'accettazione del dominio Flash non è ricostruita.

Sei nuovi controlli continui con pause aggiunte producono111. Due pair passano100 ms di tolleranza con delta−48/−46; quattro restano fuori e sono conservati come non matched. Questo rafforza la differenza di procedura indipendentemente dal solo tempo aggiuntivo nei due pair validi. Non separa ancora press/start da release, durata efficace o gating interno.

Senza capture durante i trePour:63/63/63. Con2000 ms idle aggiuntivi fraPour:65/65/63. Nessuna modifica ripristina111; effetti piccoli entro la variabilità osservata non sono esclusi.

Pour brevi con capture solo prima/dopo:500/750 ms nessuno score in entrambi i repeat;1000 ms→5/3;1500 ms→15/17. La regione750–1000 ms riguarda l'attivazione osservata della procedura completa, non prova l'istante iniziale del flusso o un quantum.

Garnish dopoShake:tre pair temporali validi270→370, fetta visibile. Scarti+43.450,−82.670,+15.568 ms. **STRONGLY_SUPPORTED, effetto procedurale sul mix pieno**; bonus globale, fase primaShake e ripetizione garnish non verificati qui.

Griglia Shake1E fermata dall'utente:un solo tentativo cold, target PID14452 assente al preflight inspect, nessuna traccia di input consegnati e nessuno score. Non è un'esplosione o un servizio con0. Le osservazioni Shake1D rimangono autorevoli ma prevalentemente singole; il nuovo evaluator confronta tutte quelle con Pour15000 e senza modifier. Spiegazioni basate soltanto sul numero di pressioni o sulla durata totale richiesta sono contraddette a livello procedurale; conteggio accettato e durata interna restano ignoti. Nessun fit di bonus o scorer di riferimento.

## Statistiche decise

Il profilo originale [approximateGameplayProfile.ts](../src/content/approximateGameplayProfile.ts) e [la motivazione](APPROXIMATE_GAMEPLAY_TUNING.md) fissano Pour800 ms +3 u/125 ms, capacità240 u, garnish100, ice500×2 con cap1000, bonusShake0/5/15/30 basato su durata/conteggio, rischio8 s/6 azioni, score massimo del progetto10.000. Queste sono **scelte di design UNVERIFIED**, versionate e non ancora applicate alla demo. La demo Phase0 rimane giocabile e il suo bundle è invariato.

## Ledger completo

| Procedura | Tentativi | Score visivi, in ordine |
| --- | --- | --- |
| CONTROL-5000 | 4 | 111 / 111 / 111 / 111 |
| CONTROL-FULL | 4 | 270 / 270 / 270 / 270 |
| G-AFTER | 3 | 370 / 370 / 370 |
| G-CONTROL | 3 | 270 / 270 / 270 |
| P-1 | 3 | 111 / 111 / 111 |
| P-10 | 3 | nessuno score |
| P-2 | 3 | 89 / 87 / 87 |
| P-3 | 3 | 63 / 63 / 65 |
| P-4 | 3 | 39 / 38 / 41 |
| P-5 | 3 | 17 / 17 / 20 |
| P-FAST-3 | 3 | 63 / 63 / 63 |
| P-GAP-3 | 3 | 65 / 65 / 63 |
| P-MATCH-2095 | 1 | 111 |
| P-MATCH-2154 | 1 | 111 |
| P-MATCH-2230 | 1 | 111 |
| P-MATCH-2332 | 1 | 111 |
| P-MATCH-2345 | 1 | 111 |
| P-MATCH-2395 | 1 | 111 |
| P-SHORT-1000 | 2 | 5 / 3 |
| P-SHORT-1500 | 2 | 15 / 17 |
| P-SHORT-500 | 2 | nessuno score |
| P-SHORT-750 | 2 | nessuno score |
| S-1x4000 | 1 | nessuno score |

Ogni singolo hold richiesto/OS, gap, prima down→ultima up, prima down→Serve down e idle è conservato in research/phase1e/summary-final.json e nei run originali. Immagini solo in cartelle ignorate.

| Pair | Delta trattamento−controllo | Timing matched≤100 ms | Scarto wall-clock ms |
| --- | --- | --- | --- |
| 1E-GARNISH-1 | 100 | SÌ | 43.450 |
| 1E-GARNISH-2 | 100 | SÌ | -82.670 |
| 1E-GARNISH-3 | 100 | SÌ | 15.568 |
| 1E-PMATCH-1 | -48 | NO | -164.898 |
| 1E-PMATCH-2 | -48 | NO | -249.578 |
| 1E-PMATCH-3 | -46 | NO | -178.354 |
| 1E-PMATCH-REFINED-1 | -48 | NO | -187.240 |
| 1E-PMATCH-REFINED-2 | -48 | SÌ | -27.786 |
| 1E-PMATCH-REFINED-3 | -46 | SÌ | -66.389 |

I controlli Pour sono del13 ottobre, i segmentati del12 ottobre: riconferma dei due controlli prima della ripresa, ambiente identico, residui espliciti; condizioni interne e frame Flash ancora non misurati. Nessun retry nascosto, tolleranza invariata.

## Misura visiva e quantità

Tentativo da2screenshot storici:ROI client x442…455/y407…444,38 righe, almeno8pixel scuri/rossi per riga. Pieno38/38; Pour5000 durantehold6/38. Frame di fasi diverse, gauge parziale che scompare al rilascio: rapporto di occupazione ROI UNVERIFIED, non capacità/volume finali. Nessun asset estratto, ReferencePourQuantum e capacità canonica ignoti. La capacità240 u e il cadence125 ms del profilo sono del nostro gioco.

## Promozione e fonti

Tre nuove adjudication STRONGLY_SUPPORTED:controllo pieno, controllo5000, proceduraG-AFTER→370. Tentativi VERIFIED rifiutati dal validatore esistente:«VERIFIED requires independently validated input evidence». Input MixEvent canonici non mappati; nessun aggiramento o storia vuota spacciata per cocktail.

Fonti esterne: [CrazyGames](https://www.crazygames.com/game/bartender-the-right-mix), [1001Games](https://www.1001games.com/g/bartender-the-right-mix), indicizzazione [FlashGamePedia](https://fgp.fandom.com/wiki/The_Right_Mix), descrizione indicizzata [video10245](https://www.youtube.com/watch?v=8BJ7k5D6jPw). Nessun GitHub/download. Garnish100:SUPPORTED BY OUR DATA soltanto nella procedura testata; bonus discreti Shake per soli click:CONTRADICTED BY OUR PROCEDURE DATA; ice500/1000:NOT YET TESTABLE; esplosione esattamente7 s:NOT YET TESTABLE; ingredienti additivi:NOT YET TESTABLE. Valori online influenzano soltanto le decisioni di design dichiarate.

## Risposte ai44 punti richiesti

| Punto | Risposta |
| --- | --- |
|1–2 controlli attuali|4 repeat ciascuno, score270 e111 concordanti;2fresh ciascuno nella ripresa|
|3 nuovi VERIFIED|0, blocco dello schema documentato|
|4 matrice|18 cold,6famiglie×3; score sopra|
|5 start-count indipendente|Procedura segmentata differisce anche con2 pair temporali validi; start isolato da release/effettivo flusso non dimostrato|
|6 inter-Pour delay|+2 s per gap:65/65/63; nessun recupero a111, piccolo effetto non escluso|
|7 attivazione breve|750 ms senza score;1000 ms con3/5,2 repeat ciascuno; soglia procedurale grossolana|
|8 curva densa|Non eseguita; livelli brevi nuovi e curva1D preservati|
|9 misura fill|Fattibilità parziale,2frame storici; finali parziali non misurabili dal gauge dopo release|
|10 saturazione|Confini ripetuti disponibili:10 s parziale1D,14 s pieno1D; fine non testato|
|11 capacità|Canonica ignota;240 u solo scelta del progetto|
|12 garnish matched|3validpair, delta100|
|13 fase garnish|Nuove prove primaShake/late non eseguite; rimane il singolo1D|
|14 garnish ripetuto|Nuovi repeat non eseguiti; il doppio click1D370 resta circoscritto|
|15 griglia Shake|1tentativo interrotto prima input confermati; nessun nuovo risultato numerico|
|16 count/duration|Vincoli procedurali valutati su tutte le osservazioni eleggibili1D/1E; nessuna regola interna promossa|
|17 pauseShake|Non eseguite|
|18 bracket esplosione|Vecchio5 s normale/10 s fallimento; nessun bracket nuovo|
|19 confidenza soglia|Bassa per soglia fine;8 s è una scelta approssimativa originale|
|20–22 Ice|Accettazione/delta/multiplo nativo non risolti; scelto500×2/cap1000 per design|
|23–26 secondo ingrediente/ordine/curva|Non eseguiti; slot08 ancora nominalmente non identificato|
|27 quantum|UNMAPPED;125 ms/3 u è cadence del progetto|
|28 reazioni|Score3…270 condividono la sequenza neutra r01;370 ha variante con garnish; non sono tier/soglie. Alias storico ref.sequence.pour-to-glass-result non prova reazione diversa|
|29 VERIFIED|0 fixture/regole|
|30 Strong|9 fixture cumulative,3nuove narrow procedure/output; contrastoPour e garnish contestuali descritti sopra|
|31 Unverified|151 fixture; quantità, startupinterno, capacità, Ice, ingredienti, formule e designprofile|
|32 ipotesi respinte|Solo spiegazioni procedurali press-count-only/requested-total-only; nessuna formula interna respinta artificialmente|
|33 fonti esterne|Confronto sopra; mai importate come dati osservati|
|34 gate full model|Non raggiunto:0 input canonici verificati e nessuna secondaidentità/meccanicaIce calibrata|
|35 candidato scorer|NO_CANDIDATE; profilo originale di tuning non è scorer di riferimento|
|36 nuovi raw|53, incluso1 abort preflight|
|37 nuove fixture|56:53 raw-linked +3adjudication|
|38 cumulativi|151 raw/160 fixture/2correzioni;0Verified/9Strong/151Unverified|
|39 test|155/155, tutti134precedenti preservati|
|40 TS/lint/build|PASS|
|41 isolamento|38 moduli, JS/CSS/cache invariati; nessuna ricerca/cattura/SWF/Ruffle in produzione|
|42 abort|1target assente al preflight; nessun risultato attribuito;52 input completati,45 score,7 senza score|
|43 lavoro successivo|Implementare il profilo originale in una fase esplicitamente richiesta; non proseguire calibrazione esatta senza nuova richiesta|
|44 Git/servizi|Nessun commit/push/PR, cambio ramo/remoto/storia o GitHub; web pubblica autorizzata dal nuovo messaggio|

## Chiusura operativa

Schermo RELEASED13ottobre07:51:47UTC, timer persistenti invariati. Ruffle posseduto già assente, nessun altro processo terminato. ABORT conservato per impedire nuovi batch accidentali.53review archiviate,0pending. Nessun ulteriore run nativo pianificato per esecuzione automatica.

TypeScript/lint/155 test/build, fixture validation, summary, model evaluator, doctor, smoke gioco/Lab/offline e audit Git/produzione sono registrati in RESEARCH_LOG.md. I204 file storici sono verificati byte-identici dal test. I risultati dei run1B/1C/1D non sono riscritti.

