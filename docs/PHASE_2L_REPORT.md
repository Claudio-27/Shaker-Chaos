# Phase 2L — Recipes, Goals & Mastery

16 ottobre2026. Ramo main, checkpoint iniziale/finale **a0f8b21**. La2K era già committata e il worktree pulito: non è stato creato un commit vuoto o duplicato. Verificati331test al checkpoint. Tutte le modifiche2L restano non committate; nessun branch, push, PR, GitHub o servizio esterno. Stop dopo2L.

## Risultato e decisioni

Quattro ricette originali e quattro obiettivi trasformano il giro in una scelta esplicita, con mastery persistente. **RoundResult e RecipeResult sono separati**: lo score generale non dipende dal target selezionato. Una buona composizione generale può mancare la ricetta e una ricetta precisa può avere uno score generale inferiore.

| Ricetta | Livello | Target frutteto/agrumi/bollicine | Extra | Score drink dell'esempio esatto |
| --- | --- | --- | --- | --- |
| Primo raggio |1|120/0/0|Normale agita/servi|4225|
| Intesa del banco |2|120/60/60|1–2 agitazioni,200–2000ms totali|8800|
| Fresco di lanterna |3|60/60/120|Ghiaccio2|8212|
| Ultimo lampo |4|90/120/30|Agrume,2 agitazioni,500–2000ms totali|8312|

Stessi tre ingredienti, capacità240 e tick3. Nessuna unità ml o conversione nuova. I target sono quantità assolute intere e raggiungibili; non si accetta una semplice riduzione proporzionale del totale. Per tutte: perfezione a scarto0, riuscita fino a12, vicina fino a30. Lo scarto è la somma delle differenze assolute su tutti gli ingredienti, compresi quelli inattesi. Extra mancanti impediscono riuscita/perfezione; fallimento meccanico impedisce il completamento. Precisione ingredienti in basis point con BigInt/interi. [Specifica completa](RECIPES_AND_GOALS.md).

Disponibilità è un obiettivo gratuito, non un asset da comprare. Si entra da Collezione→Ricette; nessun nuovo trigger nel palco. La selezione si blocca al primo fatto accettato, resta per i nuovi drink della stessa scheda e si può rimuovere con Gioco libero prima di iniziare. Non è persistita al reload. Il dettaglio e l'esito stanno nelle superfici esistenti; geometria invariata, con scroll del pannello risultati ancora necessario per contenuti lunghi.

## Premi, obiettivi e pacing

Per ogni ricetta: prima completion15XP/5monete, prima perfect altri10XP/5monete. Una prima perfetta assegna entrambi. Obiettivi: prima ricetta5XP/3monete, tre ricette diverse10/5, prima perfetta5/3, ricetta riuscita con score≥8500 nello stesso giro10/4. ID persistenti e condizioni data-driven.

Budget totale finito **130XP/55monete**: permette progressione aggiuntiva senza pagamenti ripetibili. Gli oggetti più economici costano150; non si regala il negozio completando un solo obiettivo. Configurazioni2K300/150/bundle382, livelli3/2/6 e riduzioni parziali255/127 sono byte-identiche. Reward base e curvaXP restano identici; economy:simulate riproduce il percorso base precedente (misto: bundle al18), senza i nuovi bonus opzionali.

## Persistenza e concorrenza

**PlayerProfileV3** necessario perché cambia la struttura persistita: recipeProgress con mastery, claimedGoalIds e lastSettledOrdinal. V2→V3 conserva integralmente dati e timestamp precedenti e aggiunge stato vuoto, con watermark seminato all'ultimo round storico. V1→V2→V3, nessun premio retroattivo. Validatori storici mantenuti; future versioni>3 protette. I test preservano wallet, loadout, proprietà, shop receipt/ledger, statistiche, livelli e XP. Nessuna proprietà revocata.

Premio base e bonus ricette/goal vengono salvati nello stesso JSON sotto il coordinatore esistente. Prima si rilegge lo stato corrente; i flag permanenti impediscono due primi bonus anche fra schede. Watermark copre retry/evizione del ledger e avanza nel gioco libero, impedendo assegnazioni retroattive. La selezione viene catturata dal tentativo, senza poterla cambiare prima di Serve. I bonus sono distinti dal ProgressionReward base e non alterano score/storia.

## Tooling ed esempi

npm run recipes:simulate verifica28 casi da vere storie prodotte dal dispatcher, sette per ciascuna ricetta: esatto, dentro12, appena fuori15, fuori30 (33), senza ghiaccio, senza agrume e agitazione errata. I casi mancanti richiesti sono Vicina, quelli irrilevanti rimangono Perfetta. Risultati ripetuti identici; niente prove lunghe o dati del riferimento.

Lab DEV recipeLab=1: catalogo, selezione, esempi, target/tolleranze, mastery/goals, applicazione di round sintetico tramite lo stesso coordinatore e reset delle sole ricette/goal con conferma. Reset conserva saldi/ownership/equip/receipt; dichiara che i futuri round DEV possono riprovare bonus senza sottrarre quelli passati. Lab/script/esempi non compaiono in produzione e l'audit ne respinge i marker.

## Verifiche effettive

- **350test passati**,331precedenti conservati come copertura,+19mirati. Nessun test eliminato/skipped. Le aspettative del repository ora sono schema3/future4; il test di acquisto conta un solo write della transazione dopo la migrazione iniziale. I test puriV1/V2 restano validi.
- Copertura: catalogo/ID/ingredienti/target, exact e confini, requisiti Ice/Garnish/Shake, precisione intera, stato peggiore che non degrada mastery, first/repeated completion/perfect, goal counts e score, retry con ledger evicto, gioco libero senza assegnazione retroattiva, migrazioneV1/V2, validazioneV3, quota/recovery, persistenza, stesso score/storia, shop e rendering italiano.
- Due controller con adapter Web Locks condiviso completano contemporaneamente la stessa prima perfetta: due premi base, **un solo totale bonus35XP/16monete**, un record mastery e due goal claim. Subscriber aggiornato; feedback di tentativo precedente non riappare dopo Reset. La prova simultanea è automatizzata; la prova reale browser verifica propagazione, non finge simultaneità di due mani.
- TypeScript strict, lint, suite completa, production build/audit, recipes:simulate, economy:simulate, shop:audit e art:verify riusciti.22master/43runtime, nessuna nuova dipendenza/package-lock.
- **127file protetti byte-identici**: scorer e meccaniche, tuning del cocktail/reaction tier, reward e shop2K, geometria/framing/CSS originali, artwork e baseline. Il contratto600×440 e i golden history/score/reward continuano a passare. Nuovo CSS confinato a ricettario e contenuto del pannello esistente.
- Build finale83moduli:JS358,67kB/gzip112,44;CSS64,88/gzip13,99. index-Ca8EkI3z.js/index-BNnq6izH.css,cache1460971a4942ea62.7shell,64path art su richiesta,zero art precached,limite32 invariati.

### Browser reale e offline

Origine isolata127.0.0.1:5197, Chrome. Nessun reset/scrittura console ai salvataggi utente. Primo giro reale DEV con ricetta1,114frutteto/una agitazione: **score4013**, ricetta Riuscita95%, premio base60XP/21monete +completion15/5 +goal5/3 ⇒80XP/29monete. Selezione bloccata durante il giro; nessun auto-equip o premio da reveal.

Il Lab è stato aperto: preview di Fresco di lanterna senza ghiaccio mostra ingredienti100%, CLOSE/missing ice e pulsante applicazione disabilitato sotto il gate. Non sono stati applicati fondi o esempi sintetici al profilo usato per il round reale. I percorsi di pagamento perfetto/reset sono coperti dai servizi/test; non si dichiara una verifica manuale di ogni pulsante DEV.

A320×640 il dialogo ha clientWidth/scrollWidth250/250; le schede hanno48px di altezza,105/105/218px di larghezza su due righe e tutti i nuovi pulsanti misurati almeno48px in altezza. A larghezza normale tre schede in riga. Override viewport ripristinato. Nessuna matrice completa su tablet fisico dichiarata.

Passaggio alla build produzione, reload: completion95%/goal/profilo e29monete mantenuti. **Stop reale preview, reload PWA offline**, scelta ricetta1 e nuovo giro reale123frutteto/una agitazione: score4330, ricetta Riuscita97,5%/nuovo record. Soltanto63XP/22monete base, **nessun secondo bonus** ⇒143XP lifetime,livello2 con43/150XP e51monete. L'altra scheda passa allo stesso HUD senza reload. Reload ancora offline conserva record97,5% e51monete. Shop offline conserva gate3/2/6, prezzi300/150/382 e deficit Scia99. La perfezione esatta è dimostrata dai test deterministici, non spacciata per un input manuale riuscito.

[Selettore produzione](phase2l-smoke/recipe-selector.jpg), [mobile DEV](phase2l-smoke/mobile-recipes.jpg), [round produzione offline](phase2l-smoke/offline-result.jpg), [manifest](phase2l-smoke/manifest.json). Le immagini sono prove nuove, non sostituzioni delle baseline2I. Schede create e server/helper chiusi.

## Limiti e proposta successiva

I quattro target sono un primo catalogo, non un generatore di ricette. Tolleranze assolute identiche sono semplici da spiegare ma percentualmente più permissive per il target120: i dati sono visibili nel ricettario e da playtestare. La perfezione esatta richiede un controllo del pour accurato; il completion resta tollerante. Il pannello classico compatto richiede scroll per leggere score, breakdown e dettagli ricetta; non è stato allargato.

La mastery conserva solo il miglior risultato/completamento, senza storico dei tentativi. Selezione locale alla scheda e gioco libero dopo reload sono decisioni esplicite. Budget finito e nessun farming ordinario; DEV reset permette volutamente ripetizioni di prova. Nessun account/cloud, anti-cheat o garanzia transazionale assoluta del fallback senza Web Locks. Storage negato mantiene tutto in memoria con avviso; restano le policy offline/asset precedenti.

Proposta successiva, non iniziata: breve playtest su tablet di scoperta del ricettario, raggiungibilità della perfezione e lettura del risultato compatto; regolare solo dopo evidenze, senza aprire nuovi artwork o cambiare scoring. Nessun lavoro della fase seguente avviato.
