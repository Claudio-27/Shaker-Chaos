# Prove Phase 2Q

18 ottobre2026, Chrome desktop Windows, origine QA isolata127.0.0.1:5227. Nessuna scrittura del profilo via console; tutti i fondi sono guadagnati giocando. Sonda di misurazione aggiunta solo dal server QA temporaneo, esclusa da dist/ZIP.

- rc-stage.png: scena1280×800 dopo 23 round,96 monete,L4/224 XP, nuovo mix pulito dopo il caso esplosione. Geometria600×440 invariata.
- rc-help-mobile.png: Aiuto con viewport320×640, quattro schede2×2, scroll verticale. Chrome può escludere i15 px della scrollbar dalla cattura.
- responsive.json:20 misure, dimensioni effettive del renderer, quattro schede per ciascuno dei cinque viewport richiesti. Letture dopo assestamento.
- performance.json: campioni desktop indicativi, con limiti espliciti; include resize/cambio layout dopo il primo campione. Non benchmark tablet né prova di heap costante.
- build-manifest.json: versione/cache e SHA256 di tutti i78 file candidati, hash ZIP locale. Nessuna strumentazione nel contenuto della build.

Le screenshot sono byte originali del browser, non ritoccate. Il profilo finale ha674 XP lifetime,96 monete,23 round, Sottobosco acquistato,1 receipt, Primo raggio riuscita97,5%, goal.first-recipe. Percorso e severità nel report2Q; procedure hardware nella checklist.
