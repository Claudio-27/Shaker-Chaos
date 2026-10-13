# Shaker-Chaos — tuning approssimativo v1

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

