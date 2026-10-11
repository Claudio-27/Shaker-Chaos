# Reference runner — solo ricerca

Avvio: npm run research:reference, poi http://127.0.0.1:4191/. Serve soltanto su loopback. Download pubblico in RAM, SHA-256 fisso; nessun file SWF sul disco, nessuna installazione o build del gioco originale. Fonte Archive primaria, mirror pubblico accettato soltanto a hash identico. Prova il fallback anche se il download si interrompe dopo gli header; fallisce chiaramente se rete/fonti non disponibili. GET /identity.json espone solo fonte/hash/dimensione e binarySaved=false. CDN npm Ruffle 0.7.1 necessaria al player; il build di produzione non avvia né importa questo server.

Il wrapper usa solo API pubbliche load e DOM del canvas per input. Nessuna ExternalInterface, lettura di metadata/variabili/trace del filmato, istruzioni interne o scoring originale. Canvas/mainThread sono opzioni di emulazione documentate, senza override fps; non provano fedeltà Adobe Flash.

## Misura / fallback

1. Attendere Player caricato e la schermata iniziale; avviare con il pulsante visibile originale. Non confondere il comando Play di Ruffle con Reset.
2. Confermare visivamente il nuovo stato prima della selezione. La traccia input registra pointerdown/up/cancel e mousedown/up ricevuti dal DOM, timestamp interi relativi, trusted/buttons/button e coordinate. Sono diagnostica UI, mai MixEvent.
3. Nuova traccia input pulisce solo la traccia. Nuova sessione fredda ricarica la SWF, non simula Reset del riferimento.
4. Il fallback Pour/Shake/Serve asincrono invia PointerEvent sintetici; limita hold a 0..15000 ms ed evita pulse sovrapposti. Non equivale a puntatore fisico né attesta accettazione; può fallire o interferire con input nativo. Preferire input umano/nativo per il gate di calibrazione.
5. Trascrivere output solo quando leggibile. Score assente è un campo assente; niente 0, media o coefficiente inventato. Originali/screenshot non entrano nei contenuti del progetto.
6. Preparare un JSON secondo RawReferenceObservation (src/research/rawObservation.ts) dentro il repository. npm run research:record -- percorso-relativo.json aggiunge con flag wx, mai sovrascrive. Registrare ogni repeat separatamente e i fallimenti.
7. npm run research:fixtures, research:validate, research:summary, research:model. I prefissi case- sono copie generate. L'acquisizione non promuove né stato VERIFIED né inputValidation VERIFIED, anche se la fonte asserisce input EXACT. L'adjudication indipendente richiede prove/repeat/build e schema esistente; non avviene automaticamente.

La matrice experiments.json prepara i dieci esperimenti e le serie Shake/ingredienti. Tutti i piani hanno stato NOT TESTED: non fingere un runner automatico completo. L'automazione di questa sessione comprende controllo browser, tempi richiesti, trace e metadati; riconoscimento automatico di quantità/score e input meccanici non calibrati sono bloccati. Vedi docs/REFERENCE_FINDINGS.md per ciò che è stato davvero osservato.

Il modello valuta tutte le fixture: sconosciuti nel denominatore, errore null se nessun numero confrontabile, nessuna promozione alla produzione. Uno score corrente della demo su storia sconosciuta nel Compatibility Lab non è un risultato del riferimento; usare l'evaluator con il guard input/build.
