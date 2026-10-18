# Progressione locale — stato corrente2N

Tre nuovi acquisti2M ora attivi:100/L3,175/L4,225/L5. Nessun grant gratuito aggiunto, stessa V3/curva/reward e proprietà permanente. Sette ricette raggiungibili con ingredienti owned, stessi quattro goal; bonus complessivi205XP/85monete una tantum, premi base separati. [Sistema corrente](INGREDIENT_SYSTEM.md). Le sezioni sotto documentano i checkpoint precedenti.


## Checkpoint storico2M

FormatoV3 invariato. Ownership generica accoglie i ContentItem ingredienti; riconciliazione aggiunge i tre starter legacy mancanti conservando ogni dato2L. I tre nuovi sono acquisti gated, non grant:100/L3,175/L4,225/L5, attualmente unpublished. Quattro goal originali invariati; bonus attualmente raggiungibili130XP/55monete, totale configurato futuro205XP/85monete. Nessuna V4 o nuova curva/reward. [Sistema e simulazione](INGREDIENT_SYSTEM.md). La sezione2L seguente descrive il checkpoint originale.

PlayerProfileV3 aggiunge recipeProgress (mastery, goal claim e watermark) con migrazione conservativaV1→V2→V3. XP/monete base, curva e politica shop2K invariati. Bonus ricette/obiettivi separati e una tantum, massimo130XP/55monete nell'intero catalogo; medesimo coordinatore e unico write con reward base. [Specifica corrente](RECIPES_AND_GOALS.md), [rapporto2L](PHASE_2L_REPORT.md).

## Checkpoint storico2K

Il formato resta **PlayerProfileV2**, con migrazioneV1,64ricevute acquisti e128reward settlement. La2K cambia solo la politica di acquisizione: **il livello apre un acquisto; la spesa concede proprietà; un free grant è una regola separata e intenzionale**.

Scia azzurra:150monete dal livello2. Bartender02:300 dal livello3. Bundle: livello6,382 completo/255 senza Bartender/127 senza Scia. Le due vecchie regole di grant gratuito2/3 sono rimosse dalla configurazione di produzione, senza toccare le proprietà già salvate. Starter invariato. progressionTuning.unlocks è ora vuoto ma continua a rappresentare soltanto veri grant gratuiti. ContentItem.unlock/currency.availableFromLevel definisce disponibilità per acquisto e non viene letto da evaluateProgressionUnlocks.

Reward e curva2C invariati: successo20+floor(score/100)XP e5+floor(score/250)monete; failure5XP/2monete. Soglie lifetime livelli2/3/4/5/6:100/250/450/700/1000XP. Nessuna valuta, proprietà o livello entra nello scorer del cocktail. Il reward registra unlockedContentIds soltanto per nuove concessioni effettive; una disponibilità d'acquisto non è uno sblocco gratuito.

Nessuna migrazione nuova: i vecchi grant/acquisti, ricevute e loadout valido restano intatti; nessun addebito retroattivo. Il livello corrente non revoca proprietà. Non vengono ricreati vecchi grant mai presenti nel salvataggio. Una futura modifica della curva richiederebbe una decisione e migrazione distinta: qui la curva non cambia.

Tutte le scritture continuano a usare ProfileWriteCoordinator/Web Locks, rilettura e confronto raw/revision, BroadcastChannel/storage events e transizione unica wallet/proprietà/ricevuta. Bootstrap, acquisto, equip e reward restano coordinati. Senza Web Locks il fallback rileva conflitti noti, senza promettere atomicità fra writer simultanei. Scrittura negata: intera transizione in memoria con avviso. Nessuna modifica ai servizi di persistenza/coordinamento in2K.

Simulazione riproducibile: npm run economy:simulate -- --rounds=60 --strategy=bundle. Scenari basso/medio/alto/misto; nessun salvataggio del browser toccato. [Decisioni e traguardi](PHASE_2K_REPORT.md), [catalogo/shop corrente](SHOP_SYSTEM.md), [checkpoint2J](PHASE_2J_REPORT.md).

## Fondazione2C — documentazione storica

Le sezioni seguenti sono storiche: descrivono il disegno originaleV1/2C, inclusi i vecchi grant gratuiti2/3 sostituiti dalla2K; le limitazioni sullo shop, sul momento di riserva dell'ordinal e sul coordinamento tra schede sono state superate o precisate nell'aggiornamento2J sopra.


### Confine con il cocktail

La sessione canonica produce il risultato congelato 2A. La progressione lo consuma **dopo** lo scoring: non legge il livello, il wallet o i cosmetici per calcolare ingredienti, Ice, Shake, Garnish, tier o failure. Il risultato diventa definitivo a Serve o al fallimento; la ricompensa viene liquidata nel medesimo comando applicativo, prima del render e prima dell’assaggio. Non viene usato un React effect, timer, animazione o callback di reveal per assegnarla.

```text
canonical session → production scorer → frozen RoundResult
                                            ↓
                                 settleRoundReward (puro)
                                            ↓
                          PlayerProfileV1 + ProgressionReward
                                            ↓
                         repository locale → HUD / Collection
```

Il dispatcher UI mantiene la transizione del cocktail pura, aggiorna il riferimento della partita e chiama il controller del giocatore soltanto quando appare un nuovo risultato definitivo. Il controller non può modificare la partita o il risultato. Skip, reduced-motion, Reset e reload non assegnano nuove ricompense al risultato già liquidato.

### Tuning originale approvato

Fonte: `src/content/progressionTuning.ts`, ID `shaker-chaos-progression-v1`.

| Caso | XP | Monete |
| --- | --- | --- |
| Successo | 20 + floor(score / 100) | 5 + floor(score / 250) |
| Successo score 0 | 20 | 5 |
| Successo score 5000 | 70 | 25 |
| Successo score 10000 | 120 | 45 |
| Failure/explosion | 5 | 2 |

Monete fittizie con currency ID `coins`; nessun equivalente monetario reale o valuta premium. Calcoli interi deterministici, ingressi non interi/negativi/non sicuri rifiutati. `earnCoins`, `canAfford`, `spendCoins` sono primitive centralizzate; spend è un confine futuro testato, senza transazione di acquisto o negozio.

Da livello L a L+1 servono `100 + (L−1)×50 XP`: 100,150,200,250... La soglia lifetime al livello L è `(L−1)×100 + (L−1)×(L−2)/2×50`, calcolata con BigInt. Ricerca binaria del livello evita cicli enormi; un premio può superare più livelli e conserva tutto l’XP residuo. Massimo tecnico: 1.000.000, con lifetime XP e residuo conservati e barra piena “Livello massimo”. Tutti i contatori rispettano `Number.MAX_SAFE_INTEGER`; overflow interrompe l’aggiornamento dei progressi e mostra una nota, senza rompere il cocktail.

La curva è in configurazione. Una futura curva diversa richiede una migrazione deliberata dei salvataggi/proiezioni: non si interpreta un vecchio livello incoerente come un formato automaticamente compatibile.

### PlayerProfileV1

- `schemaVersion:1`, `profileId` locale non segreto, `createdAt`/`updatedAt` in epoch ms interi.
- `progression`: level/currentXp/lifetimeXp. Livello e XP corrente sono una proiezione validata del lifetime XP.
- `wallet`: coins/lifetimeCoinsEarned/lifetimeCoinsSpent; balance + spent = earned.
- `ownership`: ID canonico, fonte e grantedAt. Un array unico di entitlements sostituisce un secondo array ridondante di ownedContentIds.
- `equippedLoadout`: bartenderId/environmentId/counterId/bottleSetId/effectOverride; soltanto ID canonici o null per disattivare l’effetto.
- `stats`: roundsPlayed, successfulDrinks, failedDrinks, bestScore, lifetimeScore, legendaryCount.
- `nextAttemptOrdinal`, `lastSettledOrdinal`, `rewardSettlementLedger`.

Oggetti/array prodotti sono immutabili. Il profilo non contiene copie dei ContentItem, artwork, prezzi o dialoghi. Il suo ID distingue il salvataggio; non è account, login, identità personale o autorizzazione.

### Identità e liquidazione una volta sola

Ogni istanza della partita ha un sessionId locale non segreto. `currentAttemptStart` della cronologia canonica distingue i tentativi in quella sessione. Al primo fatto accettato di un tentativo, il controller riserva un ordinal persistente; lo stesso tentativo conserva quella identità per tutti i tick. Reset apre un nuovo tentativo e può riservare un ordinal senza premio: i buchi sono intenzionali.

Identità: profileId + sessionId + attemptStartSequence + ordinal. Settlement ID: profileId:ordinal. Il servizio puro accetta il risultato definitivo, identità già emessa, profilo, tuning, policy di ownership e timestamp esplicito. Restituisce profilo/ricompensa immutabili e stato duplicate.

Il ledger conserva **gli ultimi 128 settlement** con timestamp, XP/monete, livelli prima/dopo, XP prima/dopo, livelli guadagnati e ID sbloccati. `lastSettledOrdinal` conserva il massimo liquidato: un vecchio ordinal non può pagare di nuovo **anche dopo l’evizione dal ledger**. Voci ancora disponibili devono corrispondere alla sessione/tentativo; collisioni e identità non emesse sono rifiutate. Questa strategia assume un solo flusso attivo e ordinato del giocatore, coerente con il gameplay corrente; non supporta consegna tardiva di ricompense da partite parallele.

La scrittura include XP, monete, stats, ownership e ledger in un solo JSON. In caso di quota/storage bloccato si continua in memoria e si avvisa: quella ricompensa non è garantita oltre un reload finché il salvataggio non riesce. Un futuro servizio remoto richiederebbe una transazione autonoma, non fiducia nel client.

### Starter e unlock

Starter: livello1, XP0, monete0. Proprietà immediata:

- bartender.b01 — Bartender 01;
- environment.e01 — Bar tiki al tramonto;
- counter.c01 — Banco in legno intarsiato;
- bottles.supplied — set delle bottiglie attuale;
- effect.sparkles — Scintille condivise.

Shaker/calice, Ice/garnish e comandi sono asset condivisi indispensabili del gioco, già forniti dal planner; non vengono trasformati in articoli bloccabili.

Loadout iniziale da productionBootstrap, con effect.sparkles esplicitamente persistito: è l’effetto già predefinito di Bartender01. In questo modo cambiare bartender mantiene anche la scelta dell’effetto, oltre ad ambiente/banco/bottiglie.

Unlock di configurazione: `level-2-bartender` → bartender.b02 al livello2; `level-3-effect` → effect.ice-blue al livello3. La verifica usa `level >= minimumLevel`, concede tutti i requisiti attraversati e ignora quelli già posseduti. Scene tiki/banco rimangono starter; nessun nome finale inventato. I segnaposto legacy hanno metadata development e restano ispezionabili in Asset Lab, fuori dalla collezione normale.

OwnershipSource prepara starter/progression/currency-purchased/bundle-granted/promotional/private. Solo starter e progression hanno concessioni reali. Prezzi e BundleDefinition/includedContentIds rimangono metadati compatibili per una fase futura; nessun finto acquisto o grant di bundle è eseguito.

### Repository e riconciliazione

`PlayerProfileRepository` è il contratto applicativo; l’adapter locale centralizza l’accesso a browser storage. Chiave: `shaker-chaos.player-profile`; copia di recupero: `shaker-chaos.player-profile.recovery`. Nessuna chiamata localStorage sparsa nei componenti.

| Caricamento | Policy |
| --- | --- |
| Nessun save | Crea starter e tenta il salvataggio. |
| V1 valido | Valida gli interi e le invarianti; riconcilia gli ID col catalogo; salva soltanto se riparato. |
| JSON/schema corrotto | Copia prima il raw esatto nello slot recovery; solo dopo crea/salva starter sicuro. Preview DEV limitata a 4000 caratteri. |
| Recovery già diverso o backup fallito | Conserva entrambe le copie originali; usa profilo in memoria senza sovrascriverle. |
| Versione vecchia senza migratore o futura | Conserva il raw originale; profilo starter temporaneo, scrittura della chiave protetta. |
| Storage assente, lettura negata o quota | Memoria e nota discreta; il gioco continua. Scrittura successiva riuscita può conservare l’intero stato in memoria. |
| Save cambiato da altro writer | Confronto del raw atteso; non sovrascrive, passa a memoria con diagnostica. |

V1 è il primo schema realmente distribuito; nessun V0 è inventato. Il dispatcher di migrazione riconosce current/older-unsupported/future-unsupported/corrupt e accoglierà migratori espliciti per future versioni. Diagnostica limitata alle ultime 16 voci. Storage è locale all’origine browser: cambiare protocollo/host/porta crea un diverso spazio di salvataggio; cancellare dati del browser li elimina.

Riconciliazione: conserva ownership di ID rimossi come entitlements inattivi; aggiorna starter mancanti e unlock già soddisfatti; loadout mancante/non posseduto/wrong-kind/private torna allo starter. displayName può cambiare senza perdere proprietà. Il resolver trasforma gli ID ContentItem persistiti in visualDefinitionId soltanto alla presentazione. Nessuno slot cosmetico diventa input dello scorer.

Il confronto del raw evita sovrascritture già osservabili fra schede; localStorage non offre una transazione atomica fra writer simultanei. Uso simultaneo in più schede non è una modalità supportata in 2C: coordinamento Web Locks o altro storage transazionale resta un lavoro futuro. Per l’uso corrente, reload/remount/effects ripetuti e skip non duplicano ricompense.

### UI, accessibilità e offline

HUD compatto: Livello, XP nel livello corrente e Monete, con progressbar nominata. Collezione è un dialog nativo con focus iniziale, Escape/chiusura e ritorno al trigger; card Owned/Equipped/Locked e pulsanti chiari, senza affidarsi solo al colore. Equipaggiamento consentito solo per cosmetici pubblici posseduti. Lo slot cambiato è l’unico aggiornato; il focus rimane sulla card dopo equip.

La ricompensa compare al breakdown della sequenza 2B: XP/monete, eventuale livello e piccolo sblocco con displayName/categoria e artwork esistente. Non blocca Nuovo drink. Reduced-motion elimina il glow, preservando informazioni e matematica. La porta audio 2B resta silenziosa e invariata; nessun audio reale aggiunto.

Tutto funziona senza rete: liquidazione, livelli, proprietà ed equipaggiamento. La cache PWA rimane selettiva: shell, soli path pubblici ammessi, scena attiva. Card bloccate non richiedono portrait; i nuovi sblocchi caricano soltanto la loro immagine se disponibile. Per un bartender appena equipaggiato ma mai scaricato, il renderer usa l’idle dello starter già in cache; il loadout scelto rimane persistito. Pose/reazioni/effetti mai visitati possono usare i fallback previsti. Non si precachea il catalogo dei contenuti bloccati.

### DEV e confini futuri

`?progressionLab=1`: schema, save status, livello/XP/next, wallet, ownership, loadout, stats, ledger e diagnostica; aggiunte esplicite di XP/monete di test, rivalutazione sblocchi e reset con checkbox di conferma. Reset tocca soltanto le due chiavi del profilo Shaker-Chaos. Adapter di reset, UI, CSS e testi DEV sono lazy e rifiutati dall’audit della produzione. Non è stato aggiunto import/export JSON opzionale.

Nessun negozio, acquisto, bundle settlement, backend/account/login, cloud save o vault. Una futura proprietà locale di un ID privato **non autorizza** accesso a file privati: servono autorizzazione e consegna server, mai file in public nascosti da UI. Ricerca fase1 chiusa, nessun nuovo esperimento. Fermarsi dopo 2C.
