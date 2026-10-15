# Baseline visive finali — fase 2H

Set originale **Shaker-Chaos**, senza immagini del riferimento. Stato del fondale: legacy, **BLOCKED ON NEW ART EXPORT**. La baseline fissa il risultato disponibile e la geometria, senza dichiarare risolto il doppio banco.

In DEV aprire /?artRegression=1&classicExact=1&scene=CASE su viewport1280×800. Usare i sette CASE elencati in manifest.json: b01-idle, b01-result, b02-idle, b02-result, failure, collection-closed, collection-open. Fixture in memoria e animazioni decorative ferme, nessuna scrittura ai progressi. Le immagini dei primi sei casi sono il solo rettangolo600×440 del palco. Collection-open mostra il viewport1280×800 perché il dialogo è un overlay secondario: il palco sottostante rimane600×440. Il dialogo mantiene scroll/focus/accessibilità reali.

I risultati usano il gioco deterministico: eccellente9550, fallimento0. Le pose/effetti sono artwork già presenti. Le catture sono JPEG del browser: i loro hash proteggono i file di riferimento, non rappresentano una promessa di identità pixel in tutti i browser. Nessuna dipendenza snapshot aggiunta.

Verifica futura: confrontare a pari viewport/DPR, controllare ancore e layer con VisualDebug, poi eseguire i test di geometria/CSS e i golden di history/score/reward. La geometria approvata resta in classicStageLayout.ts; il contratto espone i medesimi riferimenti. Non aggiornare il lock dei cinque file per accomodare un artwork nuovo.

Dopo l’arrivo di background-clean: rifare solo le baseline artistiche con revisione esplicita del fondale e test di cambio banco/offline. Conservare la provenienza del set legacy e il blocco geometrico. **CLASSIC STAGE GEOMETRY LOCKED AFTER PHASE 2H.**

Nota di cattura finale: il caso failure è stato riacquisito nel browser integrato Chromium dopo l’interruzione della sessione Chrome, a pari viewport1280×800 e palco600×440. La fixture usa served=false in caso di fallimento, come App: niente calice al posto dello shaker. Le fixture restano scene di composizione in memoria con controlli senza azioni di gioco, non snapshot dell’intero profilo/premio di una partita reale; il flusso di produzione è verificato separatamente.
