# Phase 2N — Ingredient Artwork Activation

17 ottobre2026. **Attivazione completata:6 ingredienti,7 ricette e6 offerte pubblicati**, con gate e proprietà effettivi nel normale gioco. Nessuna fase successiva avviata.

## Autorizzazione e repository

Il preflight aveva confermato l'assenza dei tre artwork nel repository e nella sorgente Desktop autorizzata. L'utente ha poi richiesto «creali tu con strumento immagini e continua», autorizzando questi tre nuovi asset in sostituzione del divieto di generazione originale. Usato image_gen integrato, tre chiamate, senza CLI/API alternative o immagini sostitutive. [Provenienza e prompt completi](INGREDIENT_ARTWORK_GENERATION.md).

Branch main, HEAD iniziale/finale a0f8b21 (checkpoint2K). Il lavoro2L/2M era ancora non committato, contrariamente al checkpoint atteso dalla consegna; è stato conservato. Non è stato creato alcun commit, branch, push, PR o accesso GitHub. Nessun servizio esterno oltre allo strumento immagini esplicitamente richiesto.

## Artwork e pipeline

Tre output originali coerenti con il pack: Sottobosco verde sfaccettata con felce, Brace ambrata a decanter, Petali lilla a goccia. Riferimenti solo di stile: bottle03,02,01 rispettivamente. Originali legacy intatti. Ogni master nativo1024×1536 RGBA è copiato byte-identico nel repository, con trasparenza reale e senza lettering/UI. Nessuna modifica manuale dei pixel.

| ID | Master | Runtime1x | Runtime2x |
| --- | --- | --- | --- |
| ingredient.bottle04 | art-source/art/ingredients/bottle04.png | 84×228 (34866B) | 168×455 (113223B) |
| ingredient.bottle05 | art-source/art/ingredients/bottle05.png | 124×228 (46725B) | 248×456 (149482B) |
| ingredient.bottle06 | art-source/art/ingredients/bottle06.png | 111×228 (38736B) | 221×455 (120972B) |

Fonte registrata con hash/metadati in artwork-inventory.json, preservando identici i21 record preesistenti. Pipeline Pillow12.3.0 già installata, alpha8/padding12/opaque224–448; sei derivati PNG con nomi hash. runtimeArtManifest, runtime-art-inventory e performance rigenerati. **25 master registrati,49 PNG runtime,21 SVG,70 URL art ammessi on demand**. Nessun master pubblico;7file shell precached,zero artwork precached,cap32 invariato.

La verifica finale per hash conserva **137 file congelati**, inclusi tutti i precedenti master/raster pubblici, domini, tuning, ricette e contratti/CSS/framing legacy. I21 record storici di source inventory sono semanticamente identici. Nessuna baseline visiva sostituita.

## Pubblicazione, shop e ricette

I tre flag ingredient.published ora true derivano automaticamente visual, ContentItem, offerte e recipe dependency; nessun path hardcoded nei componenti.

| Nuovo ingrediente | Offerta | Disponibilità/prezzo | Ricetta attiva |
| --- | --- | --- | --- |
| botanical |offer.ingredient.botanical|L3,100monete|Verde in controluce|
| ember |offer.ingredient.ember|L4,175monete|Brace gentile|
| blossom |offer.ingredient.blossom|L5,225monete|Corrente di petali|

Tre starter immediati, nuovi inizialmente locked/non-owned. Livello apre l'acquisto; la spesa concede proprietà permanente, senza equip cosmetico. Prezzi2K, nuovi prezzi2M, reward e curva XP invariati. Stesso modello transazionale quote/conferma/purchase/ledger/coordinatore/repository e V3; nessuna migrazione, reset, nuovo sistema o goal.

Le ricette nuove si mostrano con livello e ingrediente richiesto, diventando selezionabili quando owned. Stessi target/extra/tolleranze2M, stessi bonus completion/perfect una tantum e quattro goal originali. Score perfetti degli esempi9052/8850/6996. Le quattro legacy mantengono definizioni/ID e4225/8800/8212/8312 punti. **3361 full RoundResult legacy identici** al golden del checkpoint locale, nessun peso/formula/scorer ritoccato.

## Mensola e correzioni minime

Tre bottiglie per pagina, starter nella prima e nuovi nella seconda; stessi slot e regione18/54/380×188 del palco600×440. Navigazione nel quarto slot già previsto, tastiera ArrowLeft/Right/Home/End, stati locked/non-owned/owned e selezione verificati. Framing nuovi PNG derivato dall'alpha nel frame118/baseline128 senza nuove costanti. L'ambrata larga resta entro64px visibili.

Il bootstrap è limitato alla prima pagina: pubblicare sei ingredienti non significa precaricarli tutti. App/prewarm seguono la pagina visibile; shop con anteprime IntersectionObserver. Unico ritocco visivo: gap/line-height/font della motivazione nelle etichette della mensola paginata, per evitare il testo tagliato; nessun box, slot, artwork o scena spostato. Aria-label dello shop ora «Offerte del bar» e Lab con conteggi/stato reali, esclusi dalla produzione.

## Collaudo reale produzione/offline/multi-tab

Origine isolata5203. Profilo di test predisposto soltanto tramite ProgressionLab DEV:700XP/L5 e500monete, senza concedere ingredienti. Poi server sostituito dalla build di produzione, nessun Lab nel gioco. Nessuno stato React/storage alterato da console.

1. GateL1 verificati prima della preparazione del profilo; aL5 le tre bottiglie non-owned rimangono disabilitate e richiedono acquisto.
2. Sottobosco100 e Brace175 acquistati tramite normale conferma, saldo500→400→225.
3. Pagine/artwork necessari cacheati; preview spento e connessione rifiutata verificata. Petali acquistato offline nella seconda scheda per225, saldo0.
4. Prima scheda già aperta aggiorna saldo e proprietà senza reload; tutti e tre gli ingredienti selezionabili. Gli aggiornamenti successivi a139monete sono visibili anche nella seconda scheda.
5. Tutte le tre nuove ricette preparate con input reali offline. Il timing manuale usa le tolleranze previste, senza modificare dati o scoring:

| Ricetta | Quantità effettive | Extra | Esito/precisione | Score drink |
| --- | --- | --- | --- | --- |
| Verde in controluce |orchard120,botanical66,citrus54|Ice1,shake1|Riuscita95%|9032|
| Brace gentile |ember87,orchard90,soda60|Agrume,shake2|Riuscita98,75%|8724|
| Corrente di petali |soda147,citrus57,blossom30|Ice2,shake1|Riuscita97,5%|6839|

6. Reload con server ancora spento: tre mastery completed e rispettivi record presenti; profilo1075XP,livello6 con75/350XP,saldo139. Nessuna ricompensa ripetuta dal reload. I test automatici verificano separatamente perfect e idempotenza, inclusi retry/race.
7. Layout effettivo320×640 verificato: navigazione48×48px, bottiglie circa86,5×128px, etichette intere e pagine leggibili. Override ripristinato.

[Evidenze e hash](phase2n-smoke/README.md). Chrome desktop con viewport mobile, non un tablet fisico.

## Test e validazioni

**371 test superati, +2 rispetto ai369 della2M**: due test mirati su master/runtime finali unici e planner della pagina attiva. Test esistenti aggiornati allo stato pubblicato conservando fixture per stato pre-attivazione/unpublished. Il test di percorso V3 ora esercita tutte e tre le ricette con cataloghi/controller production predefiniti, acquisto→uso→perfect→reload, più due writer coordinati e quota recovery.

TypeScript strict, lint, tutti i test, build produzione e audit confini DEV passano. art:verify25/49; art:measure aggiornato; shop:audit, ingredients:audit, recipes:simulate49esempi ed economy:simulate40round/bundle passano. Prezzi e milestones cosmetici2K invariati; simulazione vede le tre offerte ingredienti realmente attive. Nessun test aggiunto per mero conteggio.

## Limiti e fase successiva consigliata

Nessun artwork mancante o contenuto nuovo ancora unpublished. Permangono i limiti precedenti: asset necessari prima cacheati per l'offline, fallback2K senza garanzia nuova di atomicità cross-tab quando Web Locks manca, nessuna promessa di compatibilità esatta con il gioco di riferimento. Nessun playtest su tablet fisico o telemetria economica; stime deterministiche, non comportamento reale dei giocatori.

Passo consigliato: playtest su tablet fisico di mensola, acquisti e ricette, poi eventuali decisioni basate sul feedback. Nessuna fase successiva iniziata qui; tutto resta locale non committato su main.
