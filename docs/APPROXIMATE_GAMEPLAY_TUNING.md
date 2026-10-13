# Shaker-Chaos — approved production tuning

**APPROVED SHAKER-CHAOS PRODUCTION TUNING · Phase 2A · 2026-10-13.**
Product design for an original game inspired by the classic bartender format. No exact reference compatibility is claimed.

The active typed source is `src/content/classicInspiredTuning.ts` (`ClassicInspiredTuningProfile`, ID `shaker-chaos-classic-v1`).
The earlier `approximateGameplayProfile.ts` remains an inactive historical Phase 1E proposal. Phase 2A explicitly supersedes its eight-Ice limit, 500ms qualifying Shake, duration/effort bonus and release-only failure check.

| Production parameter | Approved value |
| --- | --- |
| Liquid capacity | 240 integer VolumeUnit |
| Startup per new Pour hold | 800ms |
| Productive Pour | 3u per completed 125ms after startup |
| Formula per individual hold | `floor(max(0, elapsedMs - 800) / 125) * 3` |
| First productive tick | 925ms; 800ms and 924ms still give zero |
| Full uninterrupted shaker | 80 steps × 125ms + 800ms = **10800ms** |
| Ice | First two accepted actions +500 each; cap two actions / +1000 |
| Garnish | First accepted agrume after valid Shake +100, no duplicates or removal |
| Shake bonus by accepted count | 0→0, 1→0, 2→0, 3→5, 4→15, 5→30 |
| Failure, inclusive | Cumulative accepted Shake duration ≥8000ms **or** accepted count ≥6 |
| Warning | Fifth accepted action or ≥6000ms cumulative; playful presentation |
| Final score | Integer 0..10000, failure zero |
| Physical display mapping | None; UI shows u. **VolumeUnit is not ml.** |

Ice counts are independent from liquid capacity. A third attempt is rejected and creates no accepted Ice fact.
An accepted Shake begins on a valid press with liquid. Its start closes mixing and increments the action count, including a cancelled/zero-duration accepted start. A valid completed Shake must contain positive integer elapsed time (at least 1ms); no invented 500ms threshold remains. Garnish/Serve require completion and release. Durations count independently of bonuses, including cancellation tails. Sixth start fails immediately without release; a late timer records duration failure at the exact canonical 8000ms deadline.

Phases: MIXING → SHAKING → READY_TO_SERVE → RESULT. Empty Shake and premature Serve are rejected. Liquid Pour and Ice close on the first accepted Shake. Both service and failure freeze the attempt; Reset closes any operation, appends Reset and starts a clean mix while retaining prior history.

## ORIGINAL SHAKER-CHAOS ingredient tuning

The only logical ingredients remain orchard, citrus and soda. **No reference/web coefficient tables are used.**

| Ingredient | Full-capacity weight |
| --- | ---: |
| orchard | 8000 |
| citrus | 7200 |
| soda | 4800 |

Target relative personality is 2:1:1; maximum balance contribution is 1800.
Let V be liquid volume, C capacity, T sum of target parts, q_i quantities and p_i target parts:

- Base = floor(sum(q_i × weight_i) / C).
- Distance D = sum(abs(q_i × T − p_i × V)); closeness = (2VT − D) / (2VT).
- Balance = floor(1800 × V/C × closeness²), zero for empty volume.
- Ingredient score = Base + Balance, limited by the score cap and space for accepted modifiers.
- Total = ingredient + Ice + Garnish + Shake. Modifiers keep their approved points; the ingredient contribution clamps if necessary so the displayed breakdown still sums to the final total.
- Failure returns zero for every contribution.

All products/divisions in scoring use BigInt rational arithmetic. Timing, event timestamps, quantities and returned scores are safe integers. No display string or ml conversion enters this calculation.
A full 120u orchard / 60u citrus / 60u soda mix gives **8800** before modifiers and **9930** with two Ice, garnish and five Shake actions.
Full single-ingredient scores are orchard **8450**, citrus **7312**, soda **4912**: fullness alone does not guarantee perfection.

## Original mechanical reaction scale

Minimum thresholds are inclusive and centralized in the profile. Titles are original Shaker-Chaos text.

| ID | Minimum | Existing artwork |
| --- | ---: | --- |
| disaster | 0 | rough |
| awful | 1500 | rough |
| bad | 3000 | rough |
| rough | 4500 | rough |
| okay | 5500 | balanced |
| good | 6500 | balanced |
| great | 8000 | balanced |
| excellent | 9000 | excellent |
| legendary | 9700 | excellent |

Mechanical IDs do not identify files. `classicPresentation.ts` resolves them through the existing asset registry for every bartender, with deterministic rough fallback. Failure has its own original message and a decorative burst around the existing shaker. Neither its animation nor the bartender animation generates events or controls scoring.

## Research freeze

**Phase 1 reference research is CLOSED BY PRODUCT DECISION.**
No Ruffle, SWF, native pointer automation, reference capture, queues, online reference mechanics search or new observations during Phase 2A. Existing Phase 1B–1E raw records, fixtures, corrections and reports remain historical.
Native commands remain explicit/manual; no npm development, test, build, startup, UI or service-worker hook launches them.
`CompatibilityLab` is DEV-only. It retains legacy synthetic/research projection, can show a production result only for a valid mapped production history, and reports UNKNOWN for unmapped observations. Historical mismatches are not product defects.

> **Preserve information until research proves it irrelevant.**

History remains useful for debugging and future original tuning even though reference research is closed. The permissive schema/legacy replay remain intact; the stricter production policy validates accepted facts in a separate replay.

## HISTORICAL RESEARCH OBSERVATIONS — inactive Phase 1E proposal

The following preserved note describes the earlier proposal and its historical sources, **not the active production rules**.

### Shaker-Chaos — tuning approssimativo v1

Decisione dell'utente del 13 ottobre 2026: terminare la ricerca di precisione e scegliere statistiche vicine alle osservazioni e alle informazioni pubbliche, per un gioco originale. **DECISIONE DI DESIGN / UNVERIFIED**, non riproduzione verificata.

Profilo versionato: [approximateGameplayProfile.ts](../src/content/approximateGameplayProfile.ts). Il profilo è pronto per la prossima implementazione; la demo Phase0 resta attiva. Non sono stati collegati uno scorer di riferimento o modelli di ricerca alla produzione.

| Parametro scelto | Valore | Motivo / limite |
| --- | --- | --- |
| Capacità | 240 VolumeUnit | Mantiene le unità originali del progetto; nessuna equivalenza con capacità nativa |
| Avvio Pour per operazione | 800 ms | Regione osservata:750 ms senza score,1000 ms con3/5; soglia della procedura completa, non attivazione interna dimostrata |
| Tick Pour del progetto | 3 u ogni125 ms; primo tick dopo800+125 ms | Scelta empirica semplice, non ReferencePourQuantum |
| Pieno da vuoto | 10.800 ms richiesti nel modello del progetto |800 ms +80 tick×125 ms; stima entro la zona fra10 s parziale e14 s pieno; non misura esatta |
| Ghiaccio |500 punti per le prime2 aggiunte; cap1000, massimo8 azioni | Bilanciamento originale; ice nativo non calibrato |
| Garnish |100 punti una volta, dopoShake/primaServe |3 pair temporali validi270→370; globalità non verificata |
| Agitazione | Bonus massimo30 punti; durata e numero di operazioni conservati | Riprende gli incrementi osservati1D, non la tabella esterna per soli click |
| Azione Shake qualificante | Almeno500 ms | Scelta antiabuso per il gioco; accettazione nativa ignota |
| Rischio | Fallimento a8 s cumulativi o alla6ª azione qualificante; valutazione al rilascio/Serve | Scelta originale fra5 s normale e10 s fallimento; non soglia nativa esatta |
| Score massimo del progetto |10.000 | Scala di design; non massimo del riferimento |
| Budget score | Composizione8870 +ghiaccio1000 +Shake30 +garnish100 | Totale intero10.000; niente coefficienti online per bottiglia importati |
| Composizione obiettivo | orchard:citrus:soda =2:1:1 | Mantiene i contenuti indipendenti già presenti |
| Reazioni del progetto | balanced5500, excellent8500 | Percentuali55/85 già familiari nella demo, non tier nativi |
| Fasi | Niente liquidi/ghiaccio dopo il primoShake; garnish dopoShake | Decisione per rendere leggibili le conseguenze, da implementare nella prossima fase |
| Unità fisiche | mlMapping=null, visualizzazione u | Non inventare conversioni |

### Regola Shake proposta

Usare la durata trascorsa delle operazioni dalla storia canonica, non il solo credito sintetico dei tick. Contare soltanto le operazioni terminate che durano almeno500 ms. Effort =min(4, secondi interi cumulativi) +1 se ci sono almeno2 azioni qualificanti +1 se ce ne sono almeno5. Bonus:effort<4→0, effort4→5, effort5→15, effort≥6→30. Rischio8 s cumulativi/6 azioni prevale sul bonus e produce0.

Questa regola semplice riprende i pattern osservati:1×1 s e2×1 s→0 extra;3×1 s→5;4×1 s e2×2 s→15;5×1 s→30;1×4 s/5 s→5. Non pretende di descrivere gli stati interni Flash; la nuova griglia1E è stata fermata prima di input confermati.

### Controllo empirico del Pour

Come confronto di sola procedura, il modello800 ms/125 ms/3 u genera per5000 ms richiesti:99 u con1operazione,78 u con2,54 u con3,36 u con4,15 u con5 e0 u con10. Le procedure native hanno score111,87–89,63–65,38–41,17–20 e nessuno score. La corrispondenza qualitativa sostiene la scelta di design; non associa un numero di VolumeUnit al liquido nativo, non dimostra una quantizzazione o una formula di score. Non usare questo calcolo per promuovere fixture canoniche.

### Fonti pubbliche consultate dopo l'autorizzazione

[CrazyGames](https://www.crazygames.com/game/bartender-the-right-mix) descrive ingredienti/proporzioni, ice/lemon, e rischio da agitazione eccessiva. È una pagina del distributore, non una misurazione del nostro build.
[1001Games](https://www.1001games.com/g/bartender-the-right-mix) conferma qualitativamente il rischio e l'importanza del mix, senza soglie numeriche.
La pagina [FlashGamePedia](https://fgp.fandom.com/wiki/The_Right_Mix), leggibile attraverso l'indicizzazione ma non nel fetch diretto, riporta garnish100, ice500 e bonus per click. Il [video di gameplay](https://www.youtube.com/watch?v=8BJ7k5D6jPw) ha una descrizione indicizzata con ice1000. Build e unità sconosciuti; valori discordanti e affermazioni non trattati come osservazioni locali. Le guide che suggeriscono10 s di Shake confliggono con il nostro fallimento osservato a10 s, quindi non guidano la scelta.

Nessun coefficiente esterno è entrato nei raw, nelle fixture o nella demo. Niente nuovi run nativi, decompilazione, download, asset del riferimento o ricette copiate.

