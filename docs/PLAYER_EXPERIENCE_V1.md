# Esperienza giocatore v1

Phase 2P, 18 ottobre 2026. Sei ingredienti, sette ricette e sei offerte. [V1_BALANCE](V1_BALANCE.md) rimane la fonte del tuning: nessun prezzo, gate, premio, tolleranza o risultato di scoring modificato. Palco 600×440 e artwork invariati.

## Primo avvio

La guida appare solo per un profilo con zero round e senza preferenza di chiusura. Non è un pop-up: usa il pannello messaggi del gioco. Un suggerimento breve segue la fase attuale: scegli una bottiglia e Versa; versa ancora o aggiungi ghiaccio; Agita e rilascia; Servi con eventuale agrume; infine XP, monete e accesso alle superfici secondarie. La spunta della bottiglia e il nome nel comando Versa indicano la selezione. L’avvio ritardato di ogni pour resta descritto in Aiuto e nelle Note del banco.

Il pulsante Salta guida riusa il posto già riservato al salto del risultato. Rimane visibile accanto a Ricomincia, senza ampliare pannello o geometria. Dopo il primo risultato completo diventa Ho capito. Anche chi salta può leggere Collezione → Aiuto e scegliere Rivedi la guida del primo drink. La riapertura è volontaria e riporta il focus sul pannello.

Persistenza minima: la chiave UI tipizzata shaker-chaos.guide-dismissed.v1 contiene soltanto l’ID del profilo corrente. Non entra nel PlayerProfile, nei suoi ledger o nelle transazioni. Nessuna V4, migrazione o nuova ricompensa. Skip e completamento usano la stessa preferenza; il reset DEV crea un nuovo profilo e quindi può offrire di nuovo la guida. Con storage negato la chiusura resta valida nella sessione; dopo almeno un round, la statistica già esistente evita la ripetizione anche senza preferenza. Una chiusura in un’altra scheda viene recepita dall’evento storage.

## Giocatore che ritorna

Chi ha già giocato non riceve onboarding automatico, anche se manca la nuova chiave. XP, monete, ownership, equip e mastery continuano a usare lo stesso profilo V3 e gli stessi servizi. Non ci sono pop-up di riapertura, reset o auto-equip. La selezione ricetta mantiene il comportamento della 2L: resta nella scheda durante i nuovi drink; il reload riparte dal gioco libero, conservando i risultati e i progressi.

## Terminologia e feedback

- **Livello / XP / monete:** il livello apre un’opportunità; l’acquisto con monete concede proprietà. Non si chiamano sbloccati oggetti soltanto acquistabili.
- **Posseduto / Equipaggiato / Equipaggia:** proprietà permanente e cosmetico attualmente usato sono distinti. Gli ingredienti acquistati sono subito sulla mensola. Il cambio equip produce un breve stato testuale, senza toast ripetuti.
- **Riuscita / Completata / Perfetta:** Riuscita è l’esito del giro, Completata è una ricetta riuscita almeno una volta; Perfetta richiede quantità esatte e requisiti rispettati. Mastery conserva il meglio. Bonus e obiettivi sono una tantum.
- **Versa / Agita / Servi / Ghiaccio / Agrume:** stessi comandi e regole. Le descrizioni accessibili spiegano perché un comando è disabilitato; ad esempio prima versare, rilasciare il hold, aggiungere ghiaccio prima di agitare.
- **Ricomincia / Nuovo drink:** svuotano solo il mix. Nessun reset del profilo in produzione; quello DEV rimane distinto e richiede la conferma già esistente.

Ricette bloccate indicano il livello o gli ingredienti mancanti e permettono di raggiungere il Negozio. Shop mostra prezzo, deficit, gate, proprietà e contenuti residui del bundle. I testi di conferma distinguono disponibilità immediata degli ingredienti ed equip dei cosmetici. Un’offerta assente non viene presentata come caricamento infinito. Le quattro schede sono Collezione, Negozio, Ricette e Aiuto; a larghezza minima diventano due righe leggibili.

## Errori e caricamento

Il HUD conserva un avviso breve; la Collezione lo ripete a dimensione leggibile. Se il browser non salva, chiarisce che i progressi sono di sessione e di evitare reload/chiusura prima di riprovare. Riprova a salvare richiama il flush/refresh già esistente, senza creare un secondo percorso transazionale. Recovery spiega che si riparte e che il salvataggio precedente è conservato; una versione non supportata resta protetta. Conflitti invitano a controllare saldo e riprovare. Nessun JSON, dettaglio interno o contenuto del salvataggio viene mostrato al giocatore; la diagnostica DEV resta completa.

La conferma di acquisto blocca doppi invii. Un eventuale rigetto della Promise libera lo stato occupato e invita a controllare saldo/collezione prima di riprovare, senza affermare erroneamente che non ci siano stati addebiti. I normali esiti del controller continuano a usare feedback specifici.

Le immagini riusano dimensioni e fallback esistenti; le anteprime Shop mantengono lo spazio riservato e caricamento su richiesta. L’ultimo fallback non opzionale dice Immagine non disponibile. Nessun nuovo asset, skeleton, dipendenza o file audio. Nessuna ottimizzazione speculativa.

## Accessibilità, touch e movimento

Dialoghi HTML nativi, focus iniziale sul titolo e ritorno al trigger alla chiusura. Esc nella conferma chiude soltanto quella, lasciando il negozio aperto e il focus sul relativo acquisto. Spazio/Invio funzionano per acquisto e conferma; i comandi hold conservano il motore preesistente. Le schede usano focus mobile, frecce, Home e Fine. I collegamenti da Ricette a Negozio portano il focus alla scheda corretta. I messaggi di acquisto/equip usano stati testuali; non dipendono solo da colore. I tooltip dei comandi hold sono anche collegati con aria-describedby a testo nascosto.

Aiuto usa due disclosure native per approfondimenti, non una sequenza obbligatoria. Non ci sono animazioni nuove. Le nuove superfici rispettano prefers-reduced-motion; il reveal preesistente rimane immediato con movimento ridotto, senza perdere score o premi. Verificata l’anteprima DEV esistente, non alterata la preferenza OS.

Controllati 1280×800, 1024×768, 768×1024, 390×844 e 320×640 per tutte e quattro le superfici: 20 combinazioni, nessun overflow orizzontale, dialoghi entro il viewport e scroll verticale disponibile. Target misurati almeno 44×44; sui due viewport più stretti almeno 48×48. Il nuovo salto guida riusa il target classico esistente, misurato 47,6 e 45 px in altezza nei due landscape. La scena portrait mantiene il suo scorrimento preesistente. [Misure](phase2p-smoke/responsive.json).

## Offline e confini

Tutorial e Aiuto fanno parte della shell di produzione. Il primo caricamento richiede connessione; immagini mai visitate possono mancare offline. La cache resta selettiva: 7 file shell, 70 URL artwork ammessi su richiesta, zero artwork precaricati, limite32. Preferenza guida e profilo restano distinti. Il ritorno online e il normale aggiornamento della PWA non cambiano la politica preesistente: una vecchia shell può restare attiva finché le schede non vengono chiuse.

Sono verificati lancio/reload offline, guida/skip, Aiuto, ricetta con reward/mastery, acquisto ingrediente, cambio equip e sincronizzazione fra due schede. Conflitti, quota, Web Locks/fallback e idempotenza conservano i test esistenti. Senza Web Locks non si aggiunge alcuna promessa di atomicità.

## Per la release candidate

Resta utile un pass su tablet fisico: touch prolungato, tastiera mobile se il browser la mostra, rotazione, VoiceOver/TalkBack e preferenza di movimento ridotto nativa. Il collaudo Chrome desktop non certifica questi casi. Restano i limiti del salvataggio locale senza account/cloud e del catalogo finito. Nessuna fase 2Q è stata avviata. [Rapporto e prove](PHASE_2P_REPORT.md).
