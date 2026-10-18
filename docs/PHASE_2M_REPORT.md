# Phase 2M — Ingredient Expansion & Unlockable Bar

16 ottobre2026. **Supporto completato, nuovi contenuti non pubblicati per artwork mancante**, secondo l'eccezione esplicita della consegna. Nessuna fase successiva avviata.

## Repository e perimetro

main, HEAD iniziale/finale a0f8b21 (checkpoint2K). Il lavoro2L era presente ma non committato: baseline verificata350test, conservata. La consegna2M vieta commit, quindi non è stato creato il checkpoint2L mancante. Tutte le modifiche2L/2M restano locali per revisione. Nessun branch, commit, push, PR, GitHub, servizio esterno o nuovo artwork.

Confronto hash con lo stato iniziale2M: **106 file congelati identici**, inclusi art-source/public, inventari artistici, CSS/layout/framing/AssetVisual e prove/rapporto2L. La sola nuova CSS Shelf.css riguarda paginazione/framing di bottiglie aggiuntive dentro la regione esistente; nessun redesign.

## Catalogo finale

| ID | Starter/nuovo | Livello/prezzo | Visual finale | Pubblicazione | Peso/parti |
| --- | --- | --- | --- | --- | --- |
| orchard, Infuso del frutteto | Starter |1/gratis|bottle03 presente|Sì|8000/2|
| citrus, Cordial agli agrumi | Starter |1/gratis|bottle02 presente|Sì|7200/1|
| soda, Acqua frizzante | Starter |1/gratis|bottle01 presente|Sì|4800/1|
| botanical, Amaro di sottobosco | Nuovo erbaceo |3/100|bottle04 manca|No|6400/1|
| ember, Base di brace | Nuovo intenso |4/175|bottle05 manca|No|8800/2|
| blossom, Essenza di petali | Nuovo floreale |5/225|bottle06 manca|No|5600/1|

Sei definizioni canoniche,17 ContentItem,8 starter complessivi. Tre nuove offerte derivano dai dati e rimangono indisponibili/nascoste. I tre SVG esistenti sono fallback legacy, non nuove bottiglie. Non sono stati riutilizzati come nuovi ingredienti giocabili.

Stime dal simulatore reale2K, partendo da zero e risparmiando, senza bonus: botanical10/4/3 round a score1500/5000/9550; ember16/7/5; blossom21/10/7. Dopo comprare Scia al round6, a score medio i tre acquisti diventano raggiungibili rispettivamente10/13/15. Sono alternative di spesa, non tre acquisti simultanei. Prezzi cosmetici300/150, bundle382 (parziali255/127), reward e curva XP invariati. [Sistema e pacing](INGREDIENT_SYSTEM.md).

## Architettura e gameplay

BarIngredient separa identità, acquisizione, pubblicazione e visual. Ownership genericaV3, acquisto attraverso quote/conferma/purchaseOffer/controller/coordinatore/repository esistenti. Un livello apre un acquisto, non concede proprietà. I grant progression deliberati sono supportati e filtrati per pubblicazione; nessuno aggiunto. Proprietà permanente rende utilizzabile la bottiglia; nessun equip cosmetico automatico.

Shelf a3 elementi per pagina, starter subito nella prima. Riusa i tre slot originali e il quarto slot per la navigazione condizionale. Regione18/54/380×188 e palco600×440 intatti. Frecce/Home/End, focus, estremi bloccati,44/48px, locked disabilitati con motivo e controllo applicativo di PourStarted. Cambiare pagina aggiorna selezione e precarica soltanto la pagina corrente. Nel layout stretto soltanto la mensola quando è paginata si compatta per lasciare spazio ai controlli, senza ampliare la scena. Framing futuro derivato dall'alpha runtime nello stesso frame118/baseline128; legacy intatti.

Replay conserva i nuovi ID nella medesima storia di eventi. Scoring aggiunge metadati soltanto agli ingredienti nuovi presenti: assenti non alterano il vettore legacy2:1:1 o il denominatore. Calcolo intero/BigInt, nessuna conversione ml, capacità240/tick3 e regole precedenti intatte.

## Prova numerica legacy e ricette

**3361 confronti dell'intero RoundResult, zero differenze**: matrice quantità, ordine inverso, ghiaccio0–2, garnish,1/2/3/5/6shake, fallimento per conteggio e per durata. Oltre al confronto con configurazione senza estensioni, digest golden generato dallo scorer realmente letto dal Git locale a0f8b21. Anche il tuning senza metadati nuovi deve coincidere con quello del checkpoint. Fonte e hash in src/content/legacyScoring.fixture.json. Digest dei3361 risultati:

055f99cb7e5085d618cd7e94a15723a095d9d3cf2828201f0473290ceb9b31c3

Le quattro ricette2L sono identiche alla fixture salvata prima delle modifiche:4225/8800/8212/8312 punti agli esempi esatti. Nuove ricette:

| Ricetta | Target | Extra | Tolleranza riuscita/vicina | Score esatto |
| --- | --- | --- | --- | --- |
| Verde in controluce,L3 | orchard120/botanical60/citrus60 |Ice1–2|12/30|9052|
| Brace gentile,L4 | ember90/orchard90/soda60 |Agrume,2shake,500–2000ms|15/36|8850|
| Corrente di petali,L5 | soda150/citrus60/blossom30 |Ice2,1shake,200–1000ms|9/24|6996|

Sette configurate, quattro visibili. Disponibilità ricette verifica pubblicazione, livello e proprietà; mostra ingrediente richiesto e accesso al Negozio quando pubblicata. Bind e settlement ricontrollano i gate, senza auto-grant. Quattro goal originali conservati: non servono nuovi obiettivi irraggiungibili mentre mancano asset. Nuovi bonus configurati una tantum15XP/5monete più10XP/5monete perfect; budget aggiuntivo75XP/30monete attualmente non raggiungibile.

## Profili, offline e verifiche

**Nessuna V4**. Riconciliazione aggiunge i tre starter mancanti ai profili2L conservando proprietà precedenti, wallet/XP, loadout, statistiche, mastery/perfect, goal e ledger. Test con salvataggio realmente privo dei nuovi ID starter e acquisto precedente.

Configurazione futura pubblicata testata con soli riferimenti sintetici di test: acquisto→selezione→drink→ricetta/perfect→reload, identità acquisto, due schede con medesimo Web Lock e addebito unico, propagazione e quota failure/flush. Nessuna rete o seconda infrastruttura acquisti. Cataloghi opzionali del controller consentono questo collaudo senza alterare i flag production.

Nel browser su origine nuova5199: tre starter, tre offerte cosmetiche, quattro ricette; server spento e connessione rifiutata verificata;120frutteto, agitazione breve, servizio→Primo raggio perfetto,4225punti,97XP/37monete, mastery100% persistente dopo reload offline. DEV5201: pagina2/2 via End, tre nuovi tasselli marcati artwork mancante; Home ritorna1/2. [Prove e hash](phase2m-smoke/README.md).

**369 test superati, +19 rispetto ai350 iniziali**. Copertura nuova: catalogo/publication/asset unici, starter, gate/prezzi/purchase/idempotenza, dominio guarded, persistenza storica, offline/multi-tab/quota, shelf/keyboard/accessibilità/framing, ricette e regressione numerica. Suite2K/2L preservate con i conteggi ownership aggiornati ai tre starter aggiuntivi.

TypeScript strict, lint, tutti i test, produzione/build-service-worker e boundary DEV passano. art:verify:22master/43file runtime invariati. shop:audit, economy:simulate40round/bundle, recipes:simulate49esempi e ingredients:audit passano. Shell7file,64percorsi artistici ammessi solo on demand, nessun nuovo precache del catalogo.

## Limiti e passo successivo

Mancano tre PNG finali distinti: [brief](ART_REQUEST_NEW_INGREDIENTS.md). I nuovi ingredienti, acquisti e ricette restano non pubblicati; il percorso browser completo con questi artwork reali NON è stato eseguito. Dopo consegna/revisione servono registrazione nei dati d'inventario, derivazione runtime e flag editoriale; il collegamento visuale e le offerte/ricette sono già automatici. Successivamente verificare nuove pagine e acquisti offline con asset cacheati, senza cambiare motore/JSX/layout.

Le stime sono scenari deterministici di risparmio, non telemetria; bonus e altre spese cambiano il pacing. Senza Web Locks resta il fallback2K, senza nuova promessa di atomicità cross-tab. Tuning originale esteso, nessuna nuova rivendicazione di riproduzione esatta del riferimento. Stop alla2M.
