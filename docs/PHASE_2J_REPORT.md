# Fase2J — negozio, monete fittizie e bundle

Data: 16 ottobre 2026. Ramo main, HEAD iniziale/finale53722a9. Worktree iniziale pulito. La2J aggiunge il negozio nel dialogo Collezione, senza modificare il palco bloccato2I. Nessun commit, push, ramo o accessoGitHub.

## Risultato

Tre offerte reali: Bartender02=300monete, Scia azzurra=150, bundle “Un nuovo turno”=floor(costo residuo×85/100). Conservati starter e unlock dei livelli2/3. Transazioni pure nel livello application, conferma deliberata, wallet/ownership/ricevuta coerenti e idempotenti, equip separato. SchemaV2 con migrazioneV1, ledger acquisti64 e coordinatore condiviso per salvataggi/premi/acquisti/equip. Scoring, formule XP/monete, artwork, stage/CSS e sette baseline invariati.

[Architettura e policy complete](SHOP_SYSTEM.md). [Vetrina finale](phase2j-smoke/shop-production.jpg), [conferma parziale](phase2j-smoke/confirmation.jpg), [mobile](phase2j-smoke/shop-mobile.jpg), [proprietà offline](phase2j-smoke/offline-owned.jpg), [round offline](phase2j-smoke/offline-round.jpg), [manifest/hash](phase2j-smoke/manifest.json).

## Prove eseguite

- Suite finale: **322 test passati**,293 preesistenti conservati,+29 significativi. Due vecchie aspettative di persistenza sono aggiornate al nuovo formato: futura versione3 e stato conflict esplicito. Nessun test eliminato o skipped. TypeScript strict,lint,build/audit isolamento,shop:audit,art:verify e diff check completati.
- Produzione77moduli,JS343,54kB/gzip107,63;CSS63,39kB/gzip13,78. Build finale index-ByAmgkIl.js,index-DonYw2gP.css,cache15c8965166af90ee.7shell,64path art ammessi,zero art precached,limite32 invariati. Nessuna dipendenza aggiunta; package-lock invariato.
- **123 file protetti byte-identici**: dominio del cocktail, tuning gameplay/progressione, stage/framing/CSS, artwork e baseline. Nei servizi di progressione cambiano tipi/integrazione del coordinatore, senza modificare formule o soglie.
- Chrome reale, solo origini di prova nuove5185/5187/5191; salvataggi preesistenti dell'utente non resettati. Fondi di test500 concessi dalla UI Shop Lab DEV, senza XP. Nessuna scrittura diretta ai save tramite console browser.
- Profilo senza fondi: prezzi300/150/382, alternative livelli2/3, deficit e pulsanti disabilitati. Conferma/Annulla/Escape verificati; Escape chiude soltanto la conferma e riporta il focus all'acquisto, mentre la Collezione resta aperta.
- B02: doppio clic su conferma ⇒ una spesa300, saldo500→200, un entitlement e nessun auto-equip. Equip esplicito, Collezione e reload conservano B02. Un'altra scheda reale aggiorna200monete e B02 senza reload, con modalità WEB_LOCKS osservata nel laboratorio.
- Bundle completo su5187: doppio clic ⇒ una spesa382, saldo118, grant esatti B02+Scia, stato completo non acquistabile. Receipt nel laboratorio: un ordinal e un transactionId con nonce, nessuna copia di asset. Il loadout non cambia automaticamente.
- Produzione su5185: round reale frutteto240u/Ice2/Shake/agrume/Servi ⇒9550=8450+1000+100+0,excellent,115XP/43monete. Saldo200→243,livello2. B02 già comprato non genera un doppio sblocco. Shop riaperto usa saldo corrente e bundle residuo127/risparmio23.
- **Stop reale preview, reload PWA offline**, apertura Shop, conferma/doppio clic bundle residuo127 ⇒243→116; concede soltanto Scia azzurra, B02 resta posseduto. Equip Scia esplicito, reload ancora offline: entrambi equip mantenuti. Round completo offline con B02+ice-blue ⇒stesso9550,115XP/43monete,saldo159,livello2XP130/150. Nuovo drink/reload mantiene159; nessun premio duplicato. CLEAN,calice,host,effetto caricati,zero errori asset sul palco.
- Verifiche acquisti/round offline sulla build index-pkfzRZKz.js/cachea701d2a373c7f7e5. L'ultimo aggiustamento successivo riguarda soltanto il feedback di un reward ancora in coda sul drink successivo: nuova protezione esercitata nel test di completamento inverso. Transazione shop, prezzi e palco identici. La build finale ByAmgkIl è stata poi avviata su5191 e ricaricata con server spento: starter/Shop funzionano, prezzi e disabilitazione a saldo0 corretti. La vetrina screenshot è della build finale.
- L'avvio a Shop chiuso non monta anteprime: inventario risorse osservato con i15asset della scena, più icone shell; nessuna richiesta ice-blue o altra anteprima extra dello shop. L'apertura carica il solo contenuto visibile/prossimo tramite IntersectionObserver.
- Reduced-motion DEV: flag true, animazioni card/feedback none; nessun effetto economico. Focus visibile, frecce tabs, conferme native, proprietà/deficit testuali, lettura inclusioni del bundle. Non è una certificazione completa con screen reader o tablet fisico.

## Responsive

| Viewport | Shop dialog CSS | Overflow orizzontale stabile | Palco sottostante |
| --- | --- | --- | --- |
| 1280×800 | 780×768 | Nessuno;client/scroll763/763 |1058,182×776,come prima |
| 1024×768 |780×736|Nessuno;763/763|1000×733,333,come prima |
| 768×1024 |714,8×987|Nessuno;713/713|Flow portrait preesistente |
| 390×844 |337,2×812|Nessuno;320/320|Flow mobile preesistente |
| 320×640 |266,8×608|Nessuno;250/250|Flow mobile preesistente |

Nuovi controlli negozio misurati minimo54×48. Collezione verificata anch'essa a tutti i cinque viewport, senza overflow interno. Una misura immediata durante resize1024 coglieva il frame precedente del ResizeObserver; la verifica stabile separata conferma pagina1024/1024 e palco1000×733,333. Non è stata introdotta una correzione CSS. Apertura/chiusura del dialogo non cambia le dimensioni del palco nello stesso viewport. Vista DEV esatta misurata600×440 anche dopo Shop e reduced-motion.

## Economia e limiti

| Offerta | Prezzo | Round da saldo0 a score1500/5000/9550 |
| --- | --- | --- |
| B02 |300|28 /12 /7 |
| Scia azzurra |150|14 /6 /4 |
| Bundle completo |382|35 /16 /9 |

Premi rispettivi11/25/43monete. Parziali: con B02 già posseduto150→127,saving23; con Scia già posseduta300→255,saving45; completo450→382,saving68. Il floor comporta frazioni di moneta scartate, senza floating-point. I prezzi rispettano le fasce indicate; XP e earning non sono ritoccati.

**Limite di prodotto reale:** con soli due cosmetici che si sbloccano ai livelli2/3, l'utente normale li ottiene gratis prima di accumularne il prezzo. Il negozio è completo tecnicamente ma la vetrina è piccola e l'acquisto anticipato ha utilità limitata nella progressione corrente. Non sono stati inventati bartender/ambienti o rimossi starter per creare domanda. Servono futuri cosmetici originali legittimi e una politica di acquisizione deliberata, in una nuova fase.

Senza Web Locks, confronti raw/revision e coda locale non equivalgono a una transazione atomica fra processi. Il comportamento FALLBACK e i conflitti sono verificati con adapter/mock; Chrome reale supportava Web Locks. Anche con lock, writer manuali esterni possono cambiare un save locale: niente promessa anti-cheat. Un acquisto solo in memoria è dichiarato non durevole. Artwork pubblico mai scaricato può mancare offline senza bloccare la transazione.

## Rapporto richiesto —54 punti

| # | Voce | Esito |
| --- | --- | --- |
|1|Ramo|main invariato |
|2|HEAD prima2J|53722a9 |
|3|Worktree iniziale|Pulito |
|4|Schema dopo lavoro|PlayerProfileV2,versione2 |
|5|Migrazione|V1→V2 necessaria per ledger/revisione, conserva i dati completi e timestamp |
|6|StoreOffer|ITEM/BUNDLE,availability,ordine esplicito,quote e servizio puro application |
|7|Numero offerte|3:2item+1bundle |
|8|Ogni item/prezzo|bartender.b02=300;effect.ice-blue=150 |
|9|Ogni bundle|offer.new-shift→bundle.b02-ice-blue,Un nuovo turno |
|10|Politica bundle|floor(solo prezzo residuo×85/100); supporto prezzo catalogo esplicito proporzionato |
|11|Alternative acquisizione|B02 livello2 OR coins;Scia livello3 OR coins;starter invariato |
|12|Flusso item|Quote→conferma→lock/rilettura→validazione→spend+grant+receipt→un save→feedback |
|13|Idempotenza|Intenzione catturata con ordinal/nonce,guard inFlight e watermark; retry non addebita |
|14|Retention ledger|64acquisti recenti,separati da128reward;watermark oltre evizione |
|15|Wallet|Interi sicuri≥0;coins+spent=earned |
|16|Lifetime spent|Aumenta solo dell'importo effettivo;earned non diminuisce |
|17|Conferma|Nome,prezzo finale,contenuti,savings;Annulla/Escape/focus verificati |
|18|Fondi insufficienti|Pulsante disabilitato e deficit esatto;nessun debito |
|19|Successo|Acquistato! con nomi nuovi;session-only esplicito se salvataggio fallisce |
|20|Collezione|Stesso dialogo,tab distinta;gestione owned/equip e anteprime unlock preesistenti |
|21|Equip dopo acquisto|Esplicito,stesso servizio,nessun auto-equip o cambio di altri slot |
|22|Bundle parziale|Grant solo residui,già posseduti elencati |
|23|Bundle completo|OWNED,nessun acquisto disponibile |
|24|Savings|450→382:saving68;150→127:saving23;300→255:saving45 |
|25|Coordinatore|Coda per client+adapter browser condiviso fra tutti i writer di produzione |
|26|Web Locks|Nome shaker-chaos.player-profile.write;modalità reale osservataWEB_LOCKS |
|27|Fallback|Raw/revision,refresh e conflitto;non si garantisce atomicità cross-tab senza Web Locks |
|28|Sincronizzazione|BroadcastChannel+storage;saldo/ownership/equip aggiornati nell'altra scheda reale |
|29|Fallimento persistenza|Un solo oggetto coerente in memoria,warning;retry può renderlo durevole;conflitto non sovrascrive |
|30|Catalogo/private|Solo opzionali pubblici con currency+price;default/DEV/tecnici/private rifiutati |
|31|PWA/asset shop|On demand visibili,nessun preloadcatalogo;7shell/64allowlist/0artprecache/32limite |
|32|Acquisto offline|Bundle parziale127,grant Scia, equip/reload/round9550 riusciti con preview spento |
|33|1280×800|Dialogo leggibile,nessun overflow;palco invariato |
|34|1024×768|Stesso risultato dopo assestamento resize |
|35|Portrait/mobile|768×1024,390×844,320×640 validati,scroll verticale e hitbox nuove≥48 |
|36|Accessibilità|Semantica dialoghi/tabs,focus,Escape,deficit/prezzi/inclusioni testuali,nuovi controlli nominati |
|37|Reduced motion|Nessuna animazione acquisto;anteprima ridotta verificata,regole identiche |
|38|Pacing|Tabella11/25/43monete e round28/12/7,14/6/4,35/16/9;limite unlock precoci dichiarato |
|39|Indipendenza scoring|Stessa cronologia→identico RoundResult;golden e due round reali9550con cosmetici diversi |
|40|Indipendenza XP|Acquisti non cambianoXP/stats;premi115/43 invariati,nessun doppio unlock |
|41|Scene lock|123file protetti identici,600×440 misurato,7baseline immutate |
|42|DEVShopLab|?shopLab=1:coin,quote/stati/residui,ledger,mode,revision,diagnostica,+500test,simulazione senza scritture |
|43|Test|322passati,293conservati,+29 significativi |
|44|TypeScript/lint/build|Tutti superati,incluso audit isolamento e configurazione |
|45|Questioni residue|Pacing/storepiccolo,FALLBACK non pienamente atomico,artcoldoffline e test fisici futuri |
|46|Art necessario|Nuovi cosmetici reali opzionali per ampliare la vetrina;nessun artwork inventato |
|47|Prossima fase consigliata|Solo futura curatela contenuti/acquisizione e playtest economia su superfici secondarie;non avviata |
|48|Denaro reale|Nessun sistema monetario reale o premium currency |
|49|Backend/account/private|Nessuna implementazione o consegna protetta |
|50|Riferimento|Nessuna ricerca o esecuzioneRuffle/SWF |
|51|Main stage|Nessun redesign o modifica ad artwork/CSS/coordinate/baseline |
|52|Rami|Nessun ramo creato o cambiato |
|53|Commit/push/GitHub|Nessuno;la precedente autorizzazione locale era soltanto per2I |
|54|Consegna|Tutte le modifiche2J restano non committate su main per GitHub Desktop |

## Chiusura

docs/SHOP_SYSTEM.md e i quattro documenti richiesti sono aggiornati. I report storici e i file di baseline2I non vengono riscritti. Server temporanei fermati, sole schede di test chiuse e viewport browser ripristinato. Arresto dopo2J.
