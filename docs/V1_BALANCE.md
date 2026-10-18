# Bilanciamento v1 — Shaker-Chaos

Phase 2O, 17 ottobre 2026. Source of truth leggibile del tuning corrente. Configurazioni canoniche: `src/content/progressionTuning.ts`, `ingredientCatalog.ts`, `recipeCatalog.ts`, `publicContentCatalog.ts` e `storeCatalog.ts`. Sei ingredienti, sette ricette, sei offerte. Nessuna nuova infrastruttura o contenuto.

## Progressione e premi ripetibili

| Livello | XP lifetime all’ingresso | XP verso il successivo | Novità nel catalogo |
| --- | --- | --- | --- |
| 1 | 0 | 100 | 3 starter, Primo raggio |
| 2 | 100 | 150 | Intesa, Scia acquistabile |
| 3 | 250 | 200 | Fresco, Sottobosco e Bartender acquistabili |
| 4 | 450 | 250 | Ultimo lampo, Brace acquistabile |
| 5 | 700 | 300 | Petali acquistabile |
| 6 | 1000 | 350 | Bundle acquistabile |
| 7 | 1350 | 400 | Mastery/obiettivi e acquisti residui |
| 8 | 1750 | 450 | Nessun nuovo contenuto promesso |

Successo meccanico: 20 + floor(score/100) XP; 5 + floor(score/250) monete. Fallimento meccanico: 5 XP e 2 monete. Un target ricetta mancato non equivale a un fallimento meccanico. Le formule globali, lo scoring del cocktail e la curva XP restano quelle precedenti. Il livello apre opportunità: non concede gli ingredienti o i cosmetici a pagamento. Nessuna unità fisica ml nelle decisioni.

## Ingredienti: gate, fondi e scelte

Tre starter disponibili al livello 1. Le tre bottiglie nuove mantengono prezzi e gate della 2M. Round medi su 12 sequenze per abilità, strategia ingredienti prima. Ogni cella riporta gate XP / fondi lordi accumulati per quel prezzo / acquisto reale dopo le spese precedenti; i fondi lordi non sono un saldo spendibile e non ignorano le spese nella terza metrica.

| Ingrediente | Livello | Prezzo | Casual: gate/fondi/acquisto | Medio | Esperto |
| --- | --- | --- | --- | --- | --- |
| Amaro di sottobosco | 3 | 100 | 3.9 / 4.2 / 4.2 | 3.2 / 3.6 / 3.6 | 3.0 / 3.0 / 3.0 |
| Base di brace | 4 | 175 | 6.1 / 6.3 / 9.2 | 5.0 / 5.0 / 7.6 | 5.0 / 5.0 / 7.0 |
| Essenza di petali | 5 | 225 | 8.6 / 7.8 / 16.0 | 7.2 / 6.4 / 13.5 | 7.0 / 6.0 / 12.6 |

Il primo prezzo 100 offre un ingresso prima della Scia da 150. A 175 e 225 la seconda e terza scelta richiedono risparmio ulteriore, anche se il livello è già raggiunto. Nessun ingrediente è sostituito da un grant gratuito. Le ricette con dipendenze restano bloccate fino alla proprietà; il loro livello non le rende utilizzabili in anticipo.

## Ricette e difficoltà

| Ricetta | Livello | Target in unità canoniche | Ice | Garnish | Shake | Scarto riuscita/vicina |
| --- | --- | --- | --- | --- | --- | --- |
| Primo raggio | 1 | orchard 120 | — | — | Normale agita/servi | 12/30 |
| Intesa del banco | 2 | orchard 120, citrus 60, soda 60 | — | — | 1–2; 200–2000 ms | 12/30 |
| Fresco di lanterna | 3 | orchard 60, citrus 60, soda 120 | Ice 2–2 | — | Normale agita/servi | 12/30 |
| Ultimo lampo | 4 | orchard 90, citrus 120, soda 30 | — | Agrume | 2–2; 500–2000 ms | 12/30 |
| Verde in controluce | 3 | orchard 120, botanical 60, citrus 60 | Ice 1–2 | — | Normale agita/servi | 18/36 |
| Brace gentile | 4 | ember 90, orchard 90, soda 60 | — | Agrume | 2–2; 500–2000 ms | 15/36 |
| Corrente di petali | 5 | soda 150, citrus 60, blossom 30 | Ice 2–2 | — | 1–1; 200–1000 ms | 18/36 |

Le prime quattro definizioni rimangono byte per byte compatibili con la fixture legacy. La differenza assoluta di tutti gli ingredienti si somma; quelli extra contano. Perfect richiede sempre scarto zero e tutti gli extra, senza alcun allargamento. Verde introduce una quarta bottiglia e un cambio mensola: 18/36 rende tollerabile impararlo. Brace conserva 15/36, due agitazioni e agrume. Petali passa a 18/36 ma richiede ancora esattamente due Ice e una sola agitazione entro 200–1000 ms: difficoltà di esecuzione, non penalità aggiuntiva sulla quantità. Primo raggio è introduttiva; Intesa coordina tre pour; Fresco aggiunge Ice; Ultimo lampo aggiunge due shake e garnish. Non si dichiara che ogni coppia abbia una probabilità numerica diversa.

Frequenze relative nel campione deterministico di 120 tentativi per ricetta/abilità: Vicina / Riuscita non perfetta / Perfetta. La quota mancante è FAILED; non sono probabilità misurate su persone.

| Ricetta | Casual: near/success/perfect | Medio | Esperto |
| --- | --- | --- | --- |
| Primo raggio | 36.7% / 36.7% / 10.8% | 3.3% / 59.2% / 30.8% | 0.0% / 30.8% / 67.5% |
| Intesa del banco | 45.8% / 5.0% / 0.8% | 24.2% / 60.8% / 5.0% | 3.3% / 59.2% / 35.8% |
| Fresco di lanterna | 45.0% / 5.0% / 1.7% | 25.0% / 60.0% / 5.0% | 2.5% / 58.3% / 37.5% |
| Ultimo lampo | 45.8% / 5.0% / 0.8% | 27.5% / 57.5% / 5.0% | 5.0% / 57.5% / 35.8% |
| Verde in controluce | 47.5% / 14.2% / 1.7% | 11.7% / 73.3% / 5.0% | 2.5% / 58.3% / 37.5% |
| Brace gentile | 54.2% / 7.5% / 0.8% | 27.5% / 57.5% / 5.0% | 5.0% / 57.5% / 35.8% |
| Corrente di petali | 51.7% / 10.0% / 0.8% | 21.7% / 65.8% / 2.5% | 5.8% / 57.5% / 35.0% |

Prima del tuning Verde completava 8/120 casual e 78/120 medi; ora 19/120 e 94/120. Petali passava 2/120 casual e 41/120 medi; ora 13/120 e 82/120. Perfect resta rispettivamente 2/6 e 1/3 nei due profili: l’aiuto riguarda il completamento, non la medaglia esatta. Il tentativo intermedio Petali 12/30 produceva solo 3/120 completamenti casual, quindi è stato scartato a favore di 18/36.

## Mastery e quattro obiettivi

Ogni ricetta: prima riuscita 15 XP/5 monete; prima perfetta altri 10 XP/5 monete. Una prima perfetta assegna entrambe. Valori invariati e una tantum. Budget massimo sulle sette ricette e quattro goal: **205 XP / 85 monete**, inferiore al prezzo del primo ingrediente. Premi di round separati e ripetibili.

| Obiettivo | Requisito | XP / monete |
| --- | --- | --- |
| Il primo segno | 1 ricette diverse riuscite | 5 / 3 |
| Cinque firme sul banco | 5 ricette diverse riuscite | 10 / 5 |
| Al punto giusto | 1 ricetta perfetta | 5 / 3 |
| Firma applaudita | Ricetta riuscita con score ≥ 8500 | 10 / 4 |

Il goal ora chiamato Cinque firme conserva ID `goal.three-recipes` per compatibilità dei salvataggi; requisito da 3 a 5, premio invariato. Deve includere almeno una ricetta con ingrediente acquistato, perché le legacy sono quattro. Un claim storico a tre resta valido: nessuna revoca, rimborso, migrazione o seconda ricompensa. L’esperto rappresentativo distribuisce i goal ai round 1, 1, 3, 6 invece di 1, 1, 3, 4; con cosmetico prima l’ultimo si sposta al round 8–15. Due riconoscimenti introduttivi nello stesso primo perfect sono intenzionali. Tutto questo è opzionale: nessuna mastery blocca gli acquisti.

## Tutte le offerte e bundle

| Offerta | Gate | Prezzo | Utilità e alternativa |
| --- | --- | --- | --- |
| Scia azzurra | L2 | 150 | Cambio estetico anticipato; compete con Sottobosco 100 |
| Bartender 02 | L3 | 300 | Cambio personaggio; rinvia uno o più ingredienti |
| Amaro di sottobosco | L3 | 100 | Nuova bottiglia e Verde in controluce |
| Base di brace | L4 | 175 | Nuovo aroma e Brace gentile |
| Essenza di petali | L5 | 225 | Ultima bottiglia e Corrente di petali |
| Un nuovo turno | L6 | 382 completo | Risparmio per chi desidera entrambi i cosmetici e accetta di aspettare |

Round d’acquisto nel percorso rappresentativo (seed 0), nell’ordine casual / medio / esperto: Scia prima 5/5/4; Bartender prima 10/9/8; bundle prima 13/11/10. Sottobosco/Brace/Petali con priorità ingredienti: 4/9/16, 4/8/13, 3/7/12. Dopo Scia: 8/14/20, 7/12/18, 7/11/17. Il rinvio è una scelta reale, non un’offerta inutilizzabile. I dati completi delle altre priorità sono nel dataset.

Policy invariata: floor(somma dei prezzi degli elementi mancanti × 85/100). Zero ownership: 450 → 382, risparmio 68; Scia già owned: 300 → 255, risparmio 45; Bartender già owned: 150 → 127, risparmio 23; entrambi owned: nessun acquisto/prezzo residuo significativo. Essendo un bundle di due articoli, ownership parziale e quasi completa coincidono: manca un solo articolo. Prima di L6 i singoli danno utilità anticipata; chi vuole solo Scia paga 150, non 382. Dopo L6 il residuo scontato è intenzionalmente migliore per completare la coppia, senza duplicare proprietà. Nessuna nuova formula o architettura shop.

## Simulazioni complete

Comando: `npm run economy:simulate -- --journey --json`. Estensione DEV del simulatore esistente; profilo V3 reale, eventi Pour/Shake/Ice/Garnish/Serve, scorer reale, settlement base/mastery/goals, quote e purchase reali. Nessuna scrittura storage, clock reale o Math.random. Hash intero, cicli di errore ±tick, omissioni indipendenti degli extra, sotto-versamenti e qualche fallimento. Errori casual più ampi e frequenti, medi più stretti, esperti spesso zero. La selezione prova ricette disponibili non ancora riuscite, poi non perfette, bilanciando i tentativi. Quattro wish-list ordinate e dichiarate: ingredienti→bundle; Scia→ingredienti→bundle residuo; Bartender→ingredienti→Scia; bundle→ingredienti. Aspettare la prossima offerta desiderata è una scelta del modello, non un obbligo UI.

144 percorsi (3 abilità × 4 strategie × 12 seed), 60 round ciascuno, 8.640 round complessivi; survey indipendente 2.520 tentativi. Il dataset conserva riepiloghi per tutti i percorsi e 720 righe complete per i dodici rappresentativi: round, score/fallimento, XP/livello, guadagni/spese/saldo, proprietà e acquisti possibili, ricette, mastery, goal, offerte e bundle. Etichetta esclusa dalla produzione.

| Abilità | Priorità | Media round tutti gli acquisti | Intervallo | 7 ricette riuscite entro60 | Media ricette riuscite a60 | Media perfect a60 |
| --- | --- | --- | --- | --- | --- | --- |
| casual | ingredients | 28.2 | 27–29 | 5/12 | 5.9 | 0.8 |
| casual | style | 28.8 | 27–30 | 6/12 | 6.2 | 0.7 |
| casual | bartender | 30.5 | 30–31 | 2/12 | 5.2 | 0.7 |
| casual | bundle | 27.6 | 27–28 | 7/12 | 6.3 | 0.8 |
| medio | ingredients | 24.8 | 24–26 | 12/12 | 7.0 | 3.8 |
| medio | style | 25.4 | 25–26 | 12/12 | 7.0 | 3.5 |
| medio | bartender | 26.6 | 26–28 | 12/12 | 7.0 | 3.6 |
| medio | bundle | 24.7 | 24–26 | 12/12 | 7.0 | 3.5 |
| esperto | ingredients | 22.8 | 22–24 | 12/12 | 7.0 | 7.0 |
| esperto | style | 23.7 | 23–24 | 12/12 | 7.0 | 7.0 |
| esperto | bartender | 24.8 | 24–25 | 12/12 | 7.0 | 7.0 |
| esperto | bundle | 22.9 | 22–23 | 12/12 | 7.0 | 7.0 |

L’accesso al catalogo termina circa fra 22 e 31 round nei campioni. A 60 round medio ed esperto completano tutte le ricette in tutti i percorsi; il casual a errori costanti non sempre ottiene tutte le medaglie. Questo è un obiettivo di precisione facoltativo, non grind necessario per gli unlock. Il simulatore non assume miglioramento umano con la pratica: è deliberatamente conservativo.

Le aperture di livello avvengono presto, ma non regalano tutto: il denaro separa gli acquisti e le ricette legacy riempiono l’attesa. Il gap massimo osservato fra nuovi record/obiettivi/acquisti prima della proprietà completa è 10 round nel piano ingredienti; riguarda soprattutto l’ultimo risparmio cosmetico, con tutte le bottiglie/ricette già utilizzabili. Non è un blocco di contenuto; mastery e obiettivi restano visibili. Non si aggiungono unlock fittizi per riempirlo. Dopo aver comprato tutto il saldo cresce: è il limite dichiarato di un catalogo finito, non una ragione per aggiungere sink o sistemi non richiesti.

[Dataset finale](balance-v1-simulation.json) · [Baseline stesso modello](balance-v1-before.json) · [Report e playtest](PHASE_2O_REPORT.md). Tabelle derivate da queste sequenze, non telemetria né stime in minuti. Il playtest su tablet fisico rimane utile prima del rilascio.
