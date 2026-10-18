# Ingredienti — Phase 2O

Tuning corrente: [V1_BALANCE](V1_BALANCE.md). Gate/prezzi invariati; Verde e Petali 18/36, goal cinque completamenti. I numeri del checkpoint 2N sotto sono storici dove esplicitamente indicato.

**6 ingredienti pubblicati, 7 ricette pubblicate, 6 offerte shop attive**. Le tre nuove bottiglie sono state generate con image_gen dopo autorizzazione esplicita dell'utente, integrate nella pipeline e verificate in produzione. [Provenienza e prompt](INGREDIENT_ARTWORK_GENERATION.md), [rapporto](PHASE_2N_REPORT.md). Il precedente stato inattivo2M è documentato nel rapporto storico2M.

## Catalogo canonico

Fonte unica: src/content/ingredientCatalog.ts. ID gameplay nelle storie di eventi, contentId canonico nell'ownership; acquisizione, pubblicazione, visual e scoring sono dati separati.

| Gameplay / ContentItem | Nome/aroma | Acquisizione | Visual finale | Peso/parti |
| --- | --- | --- | --- | --- |
| orchard / ingredient.orchard | Infuso del frutteto, fruttato | Starter,L1 | bottle03 |8000/2 legacy|
| citrus / ingredient.citrus | Cordial agli agrumi, acido | Starter,L1 | bottle02 |7200/1 legacy|
| soda / ingredient.soda | Acqua frizzante, frizzante | Starter,L1 | bottle01 |4800/1 legacy|
| botanical / ingredient.botanical | Amaro di sottobosco, bitter erbaceo | L3,100monete | bottle04 |6400/1 aggiuntiva|
| ember / ingredient.ember | Base di brace, intenso tostato | L4,175monete | bottle05 |8800/2 aggiuntive|
| blossom / ingredient.blossom | Essenza di petali, floreale | L5,225monete | bottle06 |5600/1 aggiuntiva|

Tutte pubblicate, con asset unici. Starter, acquisto con gate e grant progression sono regole distinte; nessun nuovo grant gratuito. Il livello apre l'acquisto, la spesa concede proprietà permanente. SchemaV3 invariato,8 starter complessivi; la riconciliazione aggiunge i tre ingredienti iniziali ai vecchi profili conservando wallet, XP, loadout, statistiche, ownership, mastery, obiettivi e ledger.

validateIngredientCatalog blocca pubblicazione senza runtime finale univoco, anche per hash della sorgente. Restano testati stati unpublished e asset mancanti tramite fixture dedicate; in produzione non si usano tali fixture. I tre master sono fuori da public; solo1x/2x con hash nei manifest vengono richiesti.

## Shop e disponibilità

Offerte offer.ingredient.botanical/ember/blossom ora pubblicate, derivate dai dati. Stessi quote, conferma, purchaseOffer, receipt/ordinal, coordinatore Web Locks, repository, idempotenza e fallback2K. Nessun secondo percorso transazionale. Categoria Ingredienti con bottiglia on demand, prezzo/livello, saldo e proprietà. Un ingrediente owned è «Disponibile sulla mensola», senza equip automatico o cambiamento cosmetico. Un articolo unpublished blocca anche un'offerta erroneamente pubblicata.

Prezzi2K invariati: Bartender300/L3, Scia150/L2, bundle382/L6, parziali255/127. Reward e curva XP invariati. Stime per singolo ingrediente da zero, risparmiando e senza bonus ricetta:

| Ingrediente | Round bassi1500 | Medi5000 | Alti9550 | Medi dopo acquisto Scia150 |
| --- | --- | --- | --- | --- |
| botanical,L3/100 |10|4|3|10|
| ember,L4/175 |16|7|5|13|
| blossom,L5/225 |21|10|7|15|

npm run ingredients:audit usa il simulatore reale2K. Sono scenari deterministici, non telemetria; altre spese rinviano gli acquisti. Tutti e tre costano500monete, almeno20round medi di sole ricompense base.

## Mensola, storia e scoring

Tre bottiglie per pagina: i tre starter sempre subito nella prima, i tre nuovi nella seconda. Pagina/slot riusati nella regione18/54/380×188; palco600×440 e coordinate legacy invariati. Quarto slot per la navigazione, nessuna griglia inventario. ArrowLeft/Right/Home/End, focus visibile, estremi disabilitati, navigazione44px landscape/48px flusso stretto. Locked/non-owned disabilitati e nominati; application guard ricontrolla proprietà/pubblicazione su PourStarted. Cambiare pagina sceglie il primo owned oppure nessuno. Durante hold/fase chiusa la navigazione è bloccata.

Framing nuovo derivato dai bounds alpha nello stesso frame118/baseline128; tre legacy intatti. Unico ritocco2N: spaziatura delle etichette nella mensola paginata per mostrare interamente il motivo del blocco. Nel layout320×640, bottiglie con hitbox circa86,5×128 e frecce48×48, senza ampliare la regione.

Il planner iniziale ora esplicita la prima pagina. Il passaggio alla seconda carica e riscalda la cache soltanto per la pagina visibile, senza precaricare tutti e sei all'avvio. Shop con IntersectionObserver. PWA70 URL art consentiti on demand,7file shell,zero art precached,cap32 invariato.

Gli ID nuovi entrano negli stessi eventi PourStarted/Tick/Ended; storia canonica e proiezione deterministica conservate. Nessuna quantità ml: VolumeUnit intere, timing intero e score BigInt. Il vettore legacy2:1:1 resta identico e le parti nuove entrano solo se il relativo ingrediente è presente. Nessuna proprietà/ricetta/valuta nello scorer.3361 confronti full RoundResult con golden del checkpoint locale identici; nessun tuning ritoccato in2N.

## Ricette e mastery

recipeAvailability controlla pubblicazione, livello e ingredient ownership. Tutte sette ora pubblicate; le nuove diventano selezionabili solo possedendo l'ingrediente e raggiungendo il livello. Il selettore nomina il requisito e collega il Negozio, senza auto-grant; bind/settlement ricontrollano i gate.

| Nuova ricetta | Target canonico | Extra | Scarto riuscita/vicina | Score perfetto |
| --- | --- | --- | --- | --- |
| Verde in controluce,L3 | orchard120/botanical60/citrus60 |Ice1–2|18/36|9052|
| Brace gentile,L4 | ember90/orchard90/soda60 |Agrume,2shake,500–2000ms|15/36|8850|
| Corrente di petali,L5 | soda150/citrus60/blossom30 |Ice2,1shake,200–1000ms|18/36|6996|

Quattro ricette legacy identiche:4225/8800/8212/8312. Quattro ID goal originali, nessun altro; in 2O il goal completamenti passa da tre a cinque. Bonus2M invariati:15XP/5monete completion più10XP/5monete perfect, una tantum. Budget complessivo205XP/85monete su sette ricette e quattro goal, distinto dai premi base ripetibili. Watermark e ledger V3 impediscono doppie ricompense; nessun reset/migrazione nuova.

## DEV, offline e verifica

ShopLab/RecipeLab mostrano catalogo, proprietà, regole/prezzi, scoring, dipendenze, stato reale degli asset e pagine. Diagnostic tiles dichiarate, nessuna immagine fittizia in produzione. Build boundary esclude i Lab.

371test: master/runtime, pubblicazione prima/dopo, gates, acquisti, uso in round, tre nuove recipe/perfect e reload con controller production predefinito, due writer coordinati, quota/flush, legacy e shelf/accessibilità. Nel browser: gateL1, not-ownedL5, acquisti reali in produzione, Petali acquistato con server spento, propagazione all'altra scheda senza reload; tutte le tre ricette completate offline e mastery persistente dopo reload. [Evidenze](phase2n-smoke/README.md).

L'offline richiede asset già cacheati. Prova su Chrome desktop con viewport320×640, non tablet fisico. Senza Web Locks resta il fallback2K senza nuova garanzia di atomicità fra writer simultanei. Tuning originale Shaker-Chaos, nessuna nuova rivendicazione di riproduzione esatta del gioco di riferimento.
