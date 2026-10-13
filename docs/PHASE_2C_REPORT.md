# Phase 2C — profilo locale, XP ed economia core

Data: 2026-10-13. Lavoro locale, ricerca fase1 chiusa. Nessuna fase shop iniziata.

1. **Ramo/checkpoint:** main verificato; fase2B committata dall’utente in d2187b3, worktree inizialmente pulito. HEAD conservato e nessun lavoro estraneo scartato.
2. **Schema:** PlayerProfileV1 immutabile, schemaVersion1, ID locale non segreto, timestamp interi; progression, wallet, ownership, equippedLoadout, sei stats, counters/ledger. Ownership è l’unica fonte degli ID posseduti, senza array ridondanti o copie di catalogo.
3. **Storage:** PlayerProfileRepository applicativo; adapter locale centrale per shaker-chaos.player-profile. React non usa direttamente localStorage.
4. **Migrazione:** boundary current/corrupt/older-unsupported/future-unsupported. V1 è il primo formato realmente esistente. Corrotto copiato byte-per-byte nella chiave recovery prima di sostituirlo; versioni sconosciute conservate senza scrittura, profilo temporaneo. Diagnostica DEV limitata16/preview4000 caratteri.
5. **Starter:** livello1, XP0, monete0; nessun login o grant monetario artificiale.
6. **Owned starter:** bartender.b01, environment.e01, counter.c01, bottles.supplied, effect.sparkles. Asset comuni necessari al cocktail restano disponibili, senza lock.
7. **Loadout iniziale:** scena produttiva attuale, con effetto sparkles già predefinito salvato esplicitamente. Slot indipendenti bartender/ambiente/banco/bottiglie/effetto; null disattiva l’effetto.
8. **XP:** successo20+floor(score/100), quindi0→20,5000→70,10000→120; failure5. Costanti nella ProgressionTuningProfile originale, non nel JSX.
9. **Monete:** successo5+floor(score/250), quindi0→5,5000→25,10000→45; failure2. Solo coins fittizie, nessuna valuta reale/premium.
10. **Curva:**100+(L−1)×50 XP per avanzare. Soglie lifetime con BigInt e ricerca binaria; massimo tecnico1.000.000, residuo conservato anche al cap. Configurazione sostituibile attraverso una futura migrazione deliberata.
11. **Level-up:** salti multipli e leftover XP corretti; reward registra level/XP prima/dopo, XP earned e levelsGained. Test vicino soglia, salti1→5 e cap sicuro.
12. **Settlement:** servizio puro downstream dal frozen RoundResult; controller riserva identità del tentativo e liquida nel comando che finalizza il cocktail, prima del render/assaggio. Il risultato originale rimane intatto.
13. **Duplicati:** profileId/sessionId/attemptStartSequence/ordinal emesso, settlement ID e watermark persistente. Effect, skip, remount, reload e chiamate ripetute non pagano lo stesso tentativo. Collisioni/ID non emessi rifiutati; stale tentativi del controller ignorati.
14. **Retention:** ultimi128 reward completi; lastSettledOrdinal protegge anche quelli evitti. Ordinali inutilizzati dopo Reset ammessi. Strategia del flusso singolo ordinato documentata; niente crescita infinita della cronologia economica.
15. **Stats:** roundsPlayed, successfulDrinks, failedDrinks, bestScore solo successi, lifetimeScore dei successi, legendaryCount dal tier meccanico. Nessuna telemetria personale, analytics o stats aggiuntive presunte.
16. **Unlock rules:** ID requisito + ID canonico + minimumLevel in configurazione; verifica >=, grant unico e valutazione di tutti i requisiti attraversati. Riconciliazione concede anche sblocchi già soddisfatti.
17. **Livello2:** bartender.b02, displayName Bartender02 esistente, effettivamente sbloccato ed equipaggiato nel browser.
18. **Livello3:** effect.ice-blue, Scia azzurra, effettivamente sbloccata/equipaggiata. Ambiente e banco polished non sono stati bloccati.
19. **Ownership:** grant metadata separati dal ContentItem. Fonti future currency-purchased/bundle-granted/promotional/private previste; soltanto starter/progression attivi. Nessun acquisto finto o grant di bundle.
20. **Equip persistence:** solo owned public cosmetics, un solo slot aggiornato per comando; salvataggio ripristinato al reload. AssetLab mantiene preview non persistente indipendente dalla collezione del giocatore.
21. **Riconciliazione:** ID inattivi mantenuti nell’ownership; loadout mancante/non-owned/wrong-kind/private ripiegato sullo starter; starter e unlock mancanti concessi una volta. Cambio displayName non cambia identità; resolver visualDefinitionId separato dagli ID salvati.
22. **Save failure:** memoria e nota discreta, gioco funzionante; quota recuperabile con successiva scrittura completa. Backup fallito o save di versione sconosciuta non viene distrutto. Confronto raw rileva altri writer e conserva il loro save.
23. **HUD:** Livello/XP correnti/Monete compatti nella topbar; barra XP nominata e valori leggibili, nessun lifetime field tecnico esposto al giocatore.
24. **Reward card:** dopo breakdown del reveal2B, +XP/+monete e sblocchi; già liquidati durante tasting. Skip produce lo stesso premio e non blocca Nuovo drink.
25. **Level-up visivo:** badge/copy e breve glow CSS originale; reduced-motion lo elimina senza cambiare reward.
26. **Unlock card:** nome/categoria canonici, portrait/icona esistenti caricati soltanto per l’elemento concesso; nessun catalogo locked scaricato.
27. **Collection:** dialog nativo per Bartender/Ambienti/Banchi/Effetti; tastiera/Escape/close, scroll verticale e equip. Nessun shop.
28. **Owned/Locked/Equipped:** testo e ✓ oltre ai colori; requisiti di livello sui card bloccati, nessuna azione fake purchase. Target44px o più. Focus iniziale sul titolo, ritorno al trigger, focus sulla card dopo equip.
29. **DEV Lab:** ?progressionLab=1; XP/next/coins/schema/save status/ownership/loadout/stats/ledger/diagnostica; aggiunte XP/monete di test e rivalutazione unlock. Reset disabled senza checkbox di conferma; adapter scoped alle due chiavi del profilo. Conferma UI verificata come obbligatoria; reset destructive non eseguito sui salvataggi del browser, adapter verificato con storage sintetico. Import/export JSON opzionale non introdotto.
30. **Audio:** porta silenziosa2B invariata, nessun file o suono aggiunto.
31. **Accessibilità:** XP progressbar con nomi/min/max/value, card e azioni nominate, stati leggibili senza solo colore, focus e dialog nativo, reduced-motion. Tastiera Pour/Shake/chiusura collezione verificata; screen reader e tablet fisico non certificati.
32. **Responsive:**1280×800,1024×768,768×1024,390×844,320×640; HUD e Collection senza overflow orizzontale, target card44px o maggiori. Landscape conserva controlli e bartender; risultato più ricco può richiedere lieve scroll. Portrait/mobile scorrono senza scaling uniforme.
33. **Offline:** produzione con server spento, reload del profilo e del bartender/effetto equipaggiati, cambio tra bartender owned e giro con premio/reload riusciti. Cache selettiva7 shell/42 path pubblici/zero art precache, niente immagini locked. Artwork mai scaricato può usare idle starter, mantenendo equip persistito.
34. **Scoring indipendente:** test esplicito stesso input a livello1/livello20 con0/100000 monete e cosmetici diversi: risultato e storia identici. Nel browser stesso drink pieno con Ice2/agrume vale9550 con entrambi i bartender; bonus progressione115XP/43monete. SHA-256 dei703 file preservati contro baseline: dominio cocktail, core/bootstrap/tuning/cataloghi visuali, artwork, ricerca e dipendenze invariati.
35. **Test:**243/243, tutti i210 precedenti più33 significativi. Profilo/schema/curve/multilevel/wallet/bounds, reward/idempotenza/ledger/stats/unlock, recupero/quota/conflict, equip/reconcile/IDs, controller/score indipendente e rendering reale React SSR di HUD/reward/Collection.
36. **Controlli:** TypeScript strict, lint, tutti i test, build/audit produzione e Git diff check PASS. CSS/adapter di reset/lab/debug reward labels esclusi dalla produzione. Nessuna dipendenza nuova.
37. **Limiti:** salvataggio per origine browser, locale/modificabile dal client, senza backup cloud. LocalStorage non offre atomicità fra writer simultanei: confronto raw protegge conflitti già osservabili, multi-tab simultaneo richiede coordinamento prima di diventare modalità supportata. Versioni/curve future richiedono migratori reali. Su quota/storage bloccato la memoria può perdersi al reload; warning esplicito. Asset offline non visitati usano fallback. Playtest fisico/accessibilità completa resta da svolgere.
38. **Prossima fase proposta:** SHOP / PURCHASES / BUNDLES, soltanto con nuovo prompt: prezzi in coins, transazione wallet/ownership atomica/idempotente, bundle di ID canonici, validazione e UX. Prima chiarire coordinamento multi-tab/migrazioni; nessun pagamento reale o private delivery client-only.
39. **Backend/account/vault:** nessuna implementazione. Il profilo è locale non segreto; futura private ownership non autorizza download protetti, che richiederanno server.
40. **Ricerca:** nessun Ruffle/SWF, esecuzione nativa, ricerca web o nuova osservazione. Materiale storico preservato.
41. **Rami:** nessun ramo creato o cambiato, main conservato.
42. **Git/pubblicazione:** nessun commit/push/PR/accesso GitHub o modifica remoti/storia; soltanto inspect locali.
43. **Consegna:** cambiamenti2C non committati su main per Changes/commit dell’utente in GitHub Desktop. Arresto dopo2C.

## Smoke riproducibili eseguiti

Origini di prova agent-owned, separate da5173. Primo profilo0XP/0monete, Bartender01. Drink pieno240u con Ice2/Shake/garnish →9550,115XP/43monete, livello2 con15XP; reward già liquidato durante tasting, poi carta di level-up/Bartender02. Equip Bartender02 e reload → stessi valori e ambiente/banco originali.

Secondo stesso drink con Bartender02 →9550,+115XP/+43monete, livello2 con130XP/86monete. Terzo drink12u →422,+24XP/+6monete, livello3 con4XP/92monete e Scia azzurra. Equip effetto/reload mantiene bartender/ambiente/banco. Failure per hold lungo →0,+5XP/+2monete, livello3 con9XP/94monete; reload non ripaga.

Preview spento: reload con immagini valide e valori confermati9XP/94monete, Bartender02. Collection equip1→2 offline funziona. Altro drink12u →422,+24XP/+6monete, livello3 con33XP/100monete; reload mantiene i valori, nessun doppio award.

DEV separato: +250XP di test, rivaluta sblocchi, +25monete; livello3 e owned corretti. Reset non confermato disabled. Reduced preview: round12u→422 mostra immediatamente breakdown,+24XP/+6monete; reload conserva24XP/31monete. Nessuna emulazione OS di prefers-reduced-motion disponibile, preferenza testata tramite observer unitario e anteprima DEV.

I controlli dei cinque viewport e delle card locked sono DOM/misure/screenshot del browser, non prove touch hardware. Le interazioni mouse/tastiera di questa fase riguardano soltanto il nostro gioco locale nel browser, senza automazione di ricerca storica.

Vedere [PROGRESSION_SYSTEM](PROGRESSION_SYSTEM.md) per schema, retention, recovery e confini.

## Ultima build e consegna locale

Build finale: 59 moduli; index-BbqtMXqe.js300,80kB (gzip93,37kB), index-DZJT5DU_.css27,45kB (gzip6,95kB); cache f9317a97e288671f. Nuova origine4201 con tutte le query DEV: zero laboratori, warmup completato; preview arrestato, reload e round12u→422 con24XP/6monete riusciti. Reload conserva24XP/6monete. Focus dopo equip verificato sulla card Scintille condivise; min target44px nei cinque viewport, zero overflow orizzontale.

DEV Lab: schema1, sette ownership, una voce ledger, watermark1 e stats di un unico successo422 osservati nel JSON visibile. Reset del profilo non eseguito sui dati browser. Prova visiva in work/phase2c-profile.jpg (ignorata da Git): profilo naturale al livello3,33XP/200 e100monete con Bartender02. Schede/server aperti per le prove chiusi e viewport ripristinato.
