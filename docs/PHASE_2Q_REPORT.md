# Phase 2Q — Release Candidate & Tablet QA

18 ottobre 2026. Candidata **1.0.0-rc.1**, main. Checkpoint iniziale effettivo a0f8b21 con 2L–2P ancora non committate; salvato integralmente in **b8f1015** prima della 2Q. L’utente ha espressamente richiesto commit e push: questa istruzione prevale sui divieti del prompt allegato/AGENTS precedente. Nessun branch, PR, deploy o pubblicazione di release. Nessuna fase post-v1 iniziata.

## Fix e freeze

1. **MEDIUM — hold al resize:** il test aggiunto falliva prima del fix (isRunning=true dopo resize). bindHoldInterruptions ora ascolta anche resize e rimuove il listener nel cleanup, usando la cancellazione esistente con flush temporale. Non cambia quantità/tick/formule. Test verde e Chrome: Versa attivo, viewport1280→1024, torna idle in 174 ms mentre lo Spazio rimane premuto4000 ms. Nessun tick dopo il rilascio. Non si confonde il resize desktop con una rotazione fisica verificata.
2. **LOW — metadati obsoleti:** manifest e description HTML indicavano ancora fase 0/scoring prototipo. Corrette le descrizioni per il prodotto attuale, senza cambiare UI/artwork o promesse di compatibilità.
3. Versioning già esistente in package/lock aggiornato da0.0.1 a1.0.0-rc.1, senza dipendenze nuove. Nessun nuovo sistema di versioning.

Nessun cambiamento a dominio/scoring, balance2O, ricette/cataloghi, economy, shop/controller/repository, PlayerProfileV3, geometria600×440, CSS o artwork. La sola modifica runtime comportamentale è l’interruzione di input al resize. Diff rispetto al checkpoint controllato prima del commit.

## Automatico

**388 test PASS,0 fail/skip**, contro 383 della 2P. Cinque test aggiunti: resize,100 cicli listener/timer, tre casi espliciti di migrazione/reload. TypeScript strict, lint, build e audit isolamento DEV passati tramite npm run check. art:verify, shop:audit, ingredients:audit, recipes:simulate ed economy:simulate tutti PASS. Restano25 master/49 PNG runtime,6 ingredienti/7 ricette/6 offerte. Nessun riferimento di ricerca nella produzione. I3361 confronti completi dei risultati legacy restano identici.

Matrice repository V1→V3, V2→V3, V3→V3: confronto di **ogni campo originale** tranne schemaVersion, input immutato, reload stabile e chiave estranea intatta. V1 usa fixture con progressi/statistiche ed effetto disattivato; V2 acquisto pagato e Bartender 02 equipaggiato; V3 mastery/goal e loadout non predefinito. Non si alterano salvataggi reali. Suite precedenti coprono corruzione/backup, future schema protetto, read/write denial, quota/flush, concorrenza, duplicate reward/purchase, ledger, five-distinct goal e bonus completion/perfect.

I guasti storage sono validati mediante adapter di test, NON presentati come test manuali di policy browser. I test dei pointer sono unit/integration del controller/capture, NON touch sintetizzato presentato come hardware.

## Browser e input

Chrome desktop Windows, unico browser normale collegato. Edge, Safari/iPadOS e Android tablet: **NOT TESTED**. Nessun tablet o screen reader reale controllabile collegato. Audit semantico DOM/AX eseguito; nessuna certificazione vocale.

Origine isolata5227; salvataggio abituale4193 intatto. Nessun grant DEV, scrittura console di profilo o iniezione React: fondi guadagnati con i round reali. Helper temporaneo in work, solo loopback: serve copie delle build, mostra cache/profilo in sola lettura e registra PerformanceObserver/heap/DOM. La sonda viene aggiunta all’HTML soltanto nella risposta del server QA; **non entra in dist né nello ZIP**. Questa strumentazione e le estensioni desktop limitano le conclusioni prestazionali.

Percorso tastiera con Tab/Spazio/Invio, hold reali temporizzati, Servi, salto reveal e Nuovo drink. Negozio e Ricette aperti/chiusi ripetutamente, cambi mensola, effetto disattivato/riequipaggiato; conferma acquisto ed Esc annidato mantengono il negozio e riportano focus all’acquisto. Audit: un main e un h1; nessun button senza nome; selezione ingrediente annunciata; progressbar XP/mix con nome, valore e massimo; requisiti e stato proprietà testuali. Focus e semantica non equivalgono alla lettura vocale verificata.

Venti round di soak sulla RC più primo giro2P, ricetta offline e fallimento: **23 round persistiti**. Test100 bind/cleanup verifica assenza di listener e timer residui. Capacità UI240, stop automatico/focus Agita, hold Agita8300 ms produce esplosione0 punti e premio fallimento5 XP/2 monete. Tutti i reaction tier e le formule sono regressi dalla suite; non si afferma di aver ottenuto manualmente ogni tier.

## Responsive

Cinque dimensioni reali del renderer:1280×800,1024×768,768×1024,390×844,320×640; quattro schede ciascuna. [20 misure](phase2q-smoke/responsive.json), screenshot Aiuto320 e scena1280. Zero overflow orizzontale dopo assestamento e nessun dialogo fuori viewport; target secondari min44 px e 48 px sui piccoli formati. Result scroll e scroll delle superfici secondarie raggiungibili; geometria invariata.

Durante la prima raccolta il resize era applicato alla scheda diagnostica invece che al gioco: quelle misure sono state scartate, poi ripetute verificando innerWidth/innerHeight sul gioco. Un’altra lettura troppo anticipata mostrava10 px transitori a1024; ripetuta dopo rendering effettivo dà0. Non si tratta di un fix arbitrario della scena. Gesti touch, inset fisici, OS background/foreground e rotazione hardware restano NOT TESTED.

## PWA, aggiornamento e offline

Manifest: id/scope/start_url relativi, standalone, icone PNG192/512 presenti. Chrome emette beforeinstallprompt: criteri di installabilità osservati su secure loopback. **Installazione OS e avvio da icona non eseguiti**; nessun supporto Safari dedotto da Chrome.

Aggiornamento reale fra copia2P e copiaRC: cache **d14b2181971f4c4a → e2c6aca9b2803142**. Worker nuovo installed/waiting mentre client vecchio è aperto; reload resta sul vecchio JS BQF3_n7D e conserva31 XP/9 monete. Chiuse tutte le schede di quell’origine, riapertura usa DqLhSz0r, worker activated, vecchie cache eliminate, stesso profilo e guida già chiusa. Nessuno skipWaiting forzato o nuovo flusso di update.

Warm offline: server arrestato e fetch Node conferma irraggiungibile. Reload dal worker; acquisto Sottobosco100: **165→65 monete**, seconda scheda aggiornata65. Ricetta Primo raggio scelta via UI: **117unità,1 shake,score 4119,SUCCESS97,5%**; base61 XP/21 monete +completion15 XP/5 +goal5 XP/3 ⇒ **+81 XP/+29 monete**. Entrambe le schede raggiungono669 XP/94 monete. Reload conserva mastery/goal/proprietà/equip e non ripaga; guida assente. Successivo round esplosione porta a 674 XP/96 monete,23 round e1 receipt acquisto. Nuovo drink torna pulito.

Cold offline: origine localhost mai visitata con server spento mostra pagina nativa comprensibile ERR_CONNECTION_REFUSED. Primo accesso senza una cache non è supportato: non è una shell magicamente disponibile né un bug riparabile dall’app non scaricata. Aiuto dichiara il primo caricamento necessario e i fallback per immagini mai visitate. Nessun nuovo precache del catalogo.

Console: nessun errore applicativo, unhandled rejection, warning React, marker immagine fallita o loop SW osservato. Chrome riporta errori di connessione di **Zotero** con sorgente chrome-extension: classificati come ambiente, senza disabilitare estensioni dell’utente. La sonda temporanea non è una risorsa della produzione e non estende le promesse offline dell’app.

## Prestazioni e memoria

[Misure grezze indicative](phase2q-smoke/performance.json). Build91 moduli: JS379,92KB (gzip119,19), CSS68,47KB (gzip14,74). Rispetto2P: circa+0,06KB JS per due listener, CSS identico. Output78 file/19.319.953 byte, incluso catalogo pubblico su richiesta; non tutti sono scaricati all’avvio. Shell7 file,70path art consentiti,0art precache, cache runtime max32 come prima.

Primo campione RC a 5040 ms: **15 richieste art /4.636.830 byte codificati** inclusi warm della scena, CLS iniziale0, LCP4116 ms, long task327 ms. Altra riapertura registrava LCP2292 ms e un task795 ms; la2P sullo stesso ambiente aveva816 ms con task268/308/79 ms. Sono navigazioni locali non controllate, con schede in background, estensioni e sonda: **non costituiscono confronto causale o budget prestazionale superato**. Nessuna immagine fallita nella scena osservata. Il CLS cumulato dopo rotazioni simulate/cambio layout non viene confuso con CLS iniziale.

Soak 20 round e dialoghi: DOM idle **162**, risultato169–175, fino275 con superfici aperte, torna162 alla chiusura. Heap campionato circa **5,4–15,5MB**, con calo osservato15,5→12,3MB; nessun GC forzato. La crescita include storia della sessione e bookkeeping di osservazione; non si dichiara memoria costante, assenza assoluta di leak o uso GPU misurato. La suite100 cleanup protegge specificamente lifecycle input, non tutti i listener del browser. Nessuna ottimizzazione speculativa o benchmark framework aggiunto.

## Issue e classificazione

| ID | Severità | Stato | Nota |
| --- | --- | --- | --- |
| Q-01 | MEDIUM | FIXED | Hold non interrotto esplicitamente al resize |
| Q-02 | LOW | FIXED | Description HTML/manifest ancora fase 0 |
| Q-03 | MEDIUM | OPEN, non-blocker | Task lunghi e heap da profilare su device reale; regressione causale non dimostrata, nessuna perdita funzionale osservata |
| Q-04 | MEDIUM | NOT TESTED | Touch/rotazione/safe-area e lettura vocale reali: checklist manuale pronta |
| Q-05 | LOW | NOT TESTED | Installazione OS/avvio standalone, altri browser non collegati |

**0 BLOCKER e 0 HIGH confermati aperti.** Le lacune di validazione non sono trasformate in PASS. Nessuna modifica al prodotto per aggirare un test. [Checklist riutilizzabile e procedure hardware](V1_RELEASE_CHECKLIST.md); [bozza note giocatore](V1_RELEASE_NOTES.md).

## Artefatto e decisione

Versione candidata già nel versioning esistente. ZIP locale: work/phase2q/Shaker-Chaos-1.0.0-rc.1.zip (18.996.671 byte), SHA256 **a9f81fd7ae2670b3c3641418d8436aae3f116fcaa9738771b9507d32d468d8ea**. [Manifest SHA256 dei 78 file](phase2q-smoke/build-manifest.json). L’archivio contiene solo dist, nessun helper/fixture/Lab/source/master/reference. Conservato localmente, non allegato a una release né distribuito. Riprodurre con npm run check; servire dist tramite HTTP/HTTPS, non file://.

**V1 RELEASE CANDIDATE: READY**

Pronta come candidata per revisione e collaudo hardware: controlli automatici, Chrome desktop, responsive, aggiornamento e offline eseguiti, nessun BLOCKER/HIGH aperto. Questa decisione non dichiara tablet, screen reader, installazione nativa o browser non disponibili già certificati, né autorizza una pubblicazione. Stop dopo 2Q.
