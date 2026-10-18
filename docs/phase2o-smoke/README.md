# Prove browser Phase 2O

Chrome, origine isolata 127.0.0.1:5205, 17 ottobre 2026. Profili abituali non azzerati, niente scritture console/storage o iniezione React. Nessun viewport artificiale o tablet fisico dichiarato.

- offline-result.jpg: round reale in produzione con server spento, Petali 27 / Agrumi 57 / Bollicine 147, Ice2, una agitazione entro la finestra; score6742, ricetta Riuscita96,25%, +87XP/31monete base e +15XP/5monete completion. Saldo444→480, stesso aggiornamento nell’altra scheda senza reload. Questa prova usa build intermedia f5a4ed764d420714 (Petali12/30); la storia ha scarto9 e conserva identico risultato numerico nella build finale18/36. Non è un perfect manuale.
- final-recipes.jpg: build definitiva34d3a74d0862ed2e; Petali18/36, target/requisiti originali e mastery persistente. La PWA precedente si è aggiornata dopo aver chiuso le sole schede di prova, normale politica existing senza skipWaiting. Verificato anche reload offline della build finale:480monete, livello7/366XP, nessun nuovo bonus.
- bundle-owned.jpg: stesso profilo finale con sei ingredienti e due cosmetici posseduti; bundle completo non più acquistabile. Il residuo255 è stato acquistato offline nella seconda scheda, saldo699→444, propagato alla prima senza reload.

Primo round da nuovo profilo: Primo raggio123, score4330, Riuscita97,5%,83XP/30monete totali con goal iniziale. Secondo round manuale: Verde120frutteto/54sottobosco/60agrumi,Ice1/unaagitazione,score8863,Riuscita97,5%,133XP/49monete totali con goal score. Il perfect e i checkpoint avanzati sono accelerati dai soli Lab DEV esistenti: esatti su Primo raggio/Intesa/Fresco/Ultimo lampo/Brace, +90 e +700XP di test, +41 e +1000monete di test. Nessuna simulazione di questo percorso accelerato come prova del tempo di progressione: quello è analizzato separatamente nelle144sequenze deterministiche.

Il manifest conserva hash/dimensioni dei JPEG originali restituiti dall’API screenshot; nessun ritocco di pixel.
