# Fase 2K — Economy Pacing & Meaningful Unlocks

Data:16ottobre2026. Main, checkpoint2J **d8dce00**, creato localmente su autorizzazione esplicita dell'utente prima delle modifiche2K. Verificati322test passati e worktree pulito.2K resta non committata sullo stesso main. Nessun branch, push, PR, GitHub o servizio esterno.

## Decisione

La2J vendeva Bartender02=300 e Scia=150 ma li concedeva gratuitamente ai livelli2/3, prima di poter accumulare le monete. Il difetto era nella politica di acquisizione, non nelle ricompense del cocktail.

Ora **XP apre opportunità, monete finanziano una scelta, acquisto concede proprietà**. Un vero grant gratuito è una configurazione distinta. Formule2C, curva XP, scoring, reaction tier, gameplay e scena restano invariati.

| Articolo | ID canonico | Livello d'acquisto | Monete | Concessione |
| --- | --- | --- | --- | --- |
| Scia azzurra | effect.ice-blue | 2 |150|Solo acquisto|
| Bartender02 | bartender.b02 | 3 |300|Solo acquisto|
| Un nuovo turno | bundle.b02-ice-blue | 6 |382completo|Solo acquisto|

L'effetto più economico è il primo obiettivo; Bartender il secondo. Il bundle arriva più tardi: si può aspettare e risparmiare oppure comprare/equipaggiare prima il singolo desiderato. Chi desidera un solo cosmetico spende meno del bundle completo. Nessun timer, malus o contenuto fittizio. Dopo livello6 lo sconto residuo è intenzionalmente conveniente.

## Modello e configurazione

- Starter: starterContentIds + unlock/default, cinque entitlements invariati.
- Grant gratuito: progressionTuning.unlocks (minimumLevel/requirementId), metadata progression. Lista corrente vuota; attraversamenti multipli e idempotenza restano supportati e testati.
- Acquisto: unlock/currency.availableFromLevel + PriceMetadata coins, unica fonte del prezzo. Livello omesso significa1. Nessun grant implicito.
- Offerta: pubblicazione/gate proprio. Quote ITEM/BUNDLE combina il gate dell'offerta con quelli canonici dei contenuti mancanti; i bundle non aggirano requisiti. Nessuna eccezione JSX per livello/ID.
- Collezione: “Acquistabile dal livello N · prezzo” oppure “Acquista nel Negozio · prezzo”. “Gratis al livello N” soltanto per grant intenzionali. Shop mostra livello, prezzo, proprietà e deficit; label accessibili distinguono il blocco per livello.

Tre offerte reali, stessi ID, nessun asset nuovo. I quattro bundle storici di esempio restano non venduti. [Configurazione futura starter/grant/gated/ungated/bundle](SHOP_SYSTEM.md).

## Analisi delle ricompense attuali

Successo:20+floor(score/100)XP e5+floor(score/250)monete. Fallimento:5XP/2monete. Soglie lifetime livelli2/3/4/5/6:100/250/450/700/1000XP.

| Caso ripetuto | XP/giro | Monete/giro | Round ai livelli2/3/4/5/6 | Fondi per150/300/382 |
| --- | --- | --- | --- | --- |
| fallimento | 5 | 2 | 20/50/90/140/200 | 75/150/191 |
| basso | 35 | 11 | 3/8/13/20/29 | 14/28/35 |
| medio | 70 | 25 | 2/4/7/10/15 | 6/12/16 |
| forte | 105 | 39 | 1/3/5/7/10 | 4/8/10 |
| quasi massimo | 115 | 43 | 1/3/4/7/9 | 4/7/9 |

Punteggi dei successi:1500/5000/8500/9550. Round da zero, arrotondati per eccesso e senza altre spese. La tabella separa fondi e disponibilità: fallimenti ripetuti accumulano382monete al191 ma aprono il bundle solo al200. Non è una stima in minuti né una promessa sul comportamento reale.

## Simulazione finale

Script scripts/economy-simulation.mjs, comando npm run economy:simulate. Opzioni --rounds=N (1–10000), --strategy=save|effect-first|bartender-first|bundle. Esempio: npm run economy:simulate -- --rounds=60 --strategy=bundle. API simulateEconomy anche per piani ordinati Scia→bundle o Bartender→bundle.

Riusa i servizi reali di identità/settlement/quote/purchase su un profiloV2 isolato, con timestamp e identità deterministici. Non scrive storage e non equipaggia. Report per round: livello, XP lifetime/corrente e guadagnati, monete guadagnate, saldo, offerte appena disponibili, acquisti possibili/eseguiti. Le sequenze ripetute sono ipotesi di analisi, non telemetria validata. Marker ECONOMY_SIMULATION_DEV_ONLY respinto dall'audit di produzione; nessun import dalla UI.

| Scenario | Round ai livelli2/3/4/5/6 | Prima Scia | Primo Bartender | Bundle completo |
| --- | --- | --- | --- | --- |
| basso | 3/8/13/20/29 | 14 | 28 | 35 |
| medio | 2/4/7/10/15 | 6 | 12 | 16 |
| alto | 1/3/4/7/9 | 4 | 7 | 9 |
| misto | 3/5/9/12/17 | 8 | 14 | 18 |

Acquisti della tabella indipendenti, senza spese precedenti. Misto: ciclo fallimento→1500→5000→8500→9550,330XP/120monete ogni5round; offerte Scia/Bartender/bundle aperte ai round3/5/17.

| Strategia a5000 | Primo acquisto | Entrambi posseduti | Spesa totale |
| --- | --- | --- | --- |
| Aspetta bundle |Bundle al16|16|382|
| Scia poi bundle |Scia al6|17|405|
| Bartender poi bundle |Bartender al12|18|427|
| Due singoli |Scia al6 o Bartender al12|18|450|

Il percorso è giocare→livello2→risparmiare150→confermare Scia→equip esplicito, oppure conservare le monete per Bartender/bundle. Il completamento più economico richiede attendere: l'acquisto anticipato ha valore e costo reali. A basso punteggio il primo cosmetico richiede14round; serve playtest, senza alterare ora la formula globale.

## Bundle e profili esistenti

Bundle canonico Bartender02+Scia invariato, floor(somma prezzi NON posseduti×85/100), BigInt/interi sicuri. Completo450→382/saving68; Bartender posseduto150→127/saving23; Scia posseduta300→255/saving45. Livello6 anche per il residuo. Nessun doppio grant; proprietà completa disabilita acquisto; retry/watermark impediscono nuovi addebiti.

**Resta PlayerProfileV2, nessuna nuova migrazione.** Il cambio di configurazione non altera struttura o curva. V1→V2 continua invariata. Vecchi grant gratuiti e acquisti pre-gate conservano proprietà, fonte/grantedAt, receipt, wallet, XP, watermark e loadout valido. Anche sotto il nuovo gate il cosmetico già posseduto rimane equipaggiabile. Nessun rimborso o addebito retroattivo. Un livello passato senza entitlement registrato segue la disponibilità corrente: non si ricreano grant storici mai presenti nel save. Gli ID inattivi restano conservati.

## Verifiche

- **331test passati**: copertura dei322del checkpoint conservata,+9mirati. Nessun test eliminato/skipped. Fixture esplicite rappresentano grant gratuiti storici; aspettative di grant automatico di produzione adattate alla nuova policy. Coperti gate prima/dopo e nuova conferma, ungated coins, bundle senza bypass, proprietà parziale, free grant/idempotenza, vecchiV2/pre-gate, simulazione deterministica e conservazione delle monete.
- Strict TypeScript, lint, suite completa, build/audit produzione, shop:audit e art:verify superati.22master/43runtime. Nessuna dipendenza aggiunta; package-lock invariato.
- **122file protetti byte-identici**: dominio/scorer/reaction tuning, palco/framing/CSS, artwork e fixture/baseline visive. progressionTuning modifica solo grant gratuiti/commento; reward e curva identici. Golden history/score invariati. La fixture storica reward non cambia: si verificano tutti i campi separando soltanto i vecchi grant, senza riscrivere la baseline per nascondere differenze.
- Produzione77moduli:JS344,17kB/gzip107,81;CSS63,39/gzip13,78, stesso hash CSS2J. Build index-KSERVTal.js/index-DonYw2gP.css,cache9b2ae6c9110c27e0. Service worker7shell/64path art/zero art precached/limite32 invariati.
- Chrome reale, origine isolata5195. Fondi500 e XP dalla sola UI DEV esistente, senza console/reset del profilo utente. Livello1/500monete: tutti bloccati. Livello2: Scia acquistabile senza proprietà, Bartender bloccato. Doppio clic conferma Scia150: saldo350, un grant e nessun auto-equip. Livello3: Bartender disponibile, bundle residuo255 ancora bloccato. Livello6 apre il bundle senza concederlo.
- Due schede reali: HUD secondaria aggiornata automaticamente a350/livello2 e poi livello6. WEB_LOCKS osservato. Passaggio a produzione stessa origine conserva il profilo; nessun laboratorio disponibile.
- **Stop reale preview/reload PWA offline**: conferma/doppio clic bundle residuo255 ⇒350→95; concede soltanto Bartender02, Scia conservata. Equip esplicito Bartender/reload offline conserva95 e loadout. L'altra scheda passa a95 senza reload. Servizi di storage/coordinamento non modificati.
- [Vetrina produzione](phase2k-smoke/production-level6.jpg), [proprietà offline](phase2k-smoke/offline-owned.jpg), [manifest](phase2k-smoke/manifest.json). Prove1536×730 senza override viewport. CSS/geometria intatti; matrice responsive completa2J non ripetuta. Schede e server/helper di collaudo chiusi.

## Limiti e proposta successiva

Due soli optional: niente economia di lungo periodo. Dopo livello6 lo sconto residuo è dominante per chi vuole il secondo articolo, per scelta esplicita; prima contano attesa e preferenza. Simulazione riproducibile utile per calibrare, da confermare con playtest.

Restano i limiti2J: storage locale modificabile, nessun anti-cheat; fallback senza Web Locks non atomicamente garantito fra processi simultanei; scritture negate in memoria con avviso; artwork non visitati possono mancare offline. Il browser reale usa Chrome/Web Locks; fallback/conflitti verificati dai test adapter esistenti.

Proposta successiva, non avviata: breve playtest su tablet reale per primo acquisto, chiarezza livello/prezzo e scelta singoli/bundle, prima di autorizzare ulteriori cosmetici originali. Nessun lavoro2L iniziato.
