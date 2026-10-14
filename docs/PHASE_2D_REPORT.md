# Fase 2D — ricomposizione classica

Completata il 13 ottobre 2026. Priorità: una scena da bar, leggibile in landscape, con artwork originale già presente. Nessuna nuova ricerca sul riferimento.

## Composizione e perimetro

1. **Ramo:** main, invariato.
2. **Checkpoint iniziale:** fase 2C già committata dall’utente in `0b1acde` (`2c`); worktree pulito prima dell’intervento.
3. **Direzione:** reinterpretazione moderna della composizione classica da bartender. Una scena illustrata occupa lo schermo; la UI segue il banco. Nessuna rivendicazione di autenticità 1:1.
4. **Modifiche principali:** eliminata l’introduzione visiva ingombrante, riuniti messaggio e risultato, separati oggetti del banco e comandi. La nuova composizione è in `src/ui/classicLayout.css`, dopo gli stili condivisi; nessuna dipendenza aggiunta.
5. **Bottiglie:** parte alta/sinistra, circa 61% della larghezza e 53% dell’altezza. Tre bottiglie grandi sopra una mensola, con etichette compatte, quantità, selezione/✓ e focus. Hitbox ferme durante l’inclinazione della sola immagine.
6. **Bartender:** grande sulla destra, area circa 34% della larghezza e 63% dell’altezza; volto e gesti restano sopra il libro del banco. Stesse pose e fallback, compreso Bartender02 posseduto ma non ancora in cache.
7. **Banco:** superficie quasi a tutta larghezza nella parte inferiore. Canvas originale 3:1 conservato, senza ricompressione; ritaglio soltanto del fondo decorativo nella cornice della scena. In portrait il crop viene riframmato.
8. **Preparazione:** centro dell’area operativa inferiore, leggermente a sinistra del centro dello schermo. Shaker/bicchiere grande, meter compatto adiacente, pips del ghiaccio e guarnizione esistenti. Ghiaccio e agrume diventano due piccoli oggetti/azioni sul banco ai lati della stazione.
9. **Comandi:** Versa → Agita → Servi, una sola riga dominante in basso nell’area operativa. Restano visibili e nella stessa posizione anche dopo Serve/fallimento, quando sono disabilitati. Reset secondario nella riga di aiuto.
10. **Messaggio/risultato:** unico libro del banco ancorato in basso a destra. Prima del servizio: voce del bartender, sequenza, istruzione, rischio/feedback e Note del banco. Dopo: assaggio → score → reazione → breakdown, premi e Nuovo drink. Un solo heading per il focus. Il pannello non cambia coordinate tra preparazione e assaggio/risultato.
11. **Progressione:** Livello/XP/monete nella barra superiore sottile, sotto il 10% dell’attenzione visiva; semantica progressbar mantenuta.
12. **Collezione:** chiusa all’apertura, accessibile dal piccolo pulsante; mantiene il dialogo 2C, focus iniziale, Escape, ripristino del focus e ownership/equip. Nessuna collezione o shop aperti durante il giro.
13. **1280×800:** scena alta 710 px, pagina interamente visibile senza scroll; comandi alti 72 px, libro 389×341 px. Risultato con sblocco e Nuovo drink interamente visibili.
14. **1024×768:** scena interamente visibile; riga comandi 640×72 px, libro circa 313×332 px. Compattati padding e breakdown per mostrare anche il risultato con level-up/sblocco senza scroll interno.
15. **Portrait/narrow:** verificati 768×1024, 390×844 e 320×640. A 768 mensola e bartender affiancati, poi banco/comandi/risultato; sotto 600: mensola → bartender → preparazione → tre comandi → messaggio. Scroll verticale ammesso; nessun overflow orizzontale e nessun ridimensionamento globale. Tutti i pulsanti misurati almeno 44×44 px.
16. **Riduzione del dashboard feel:** niente toolbar di card per le bottiglie, niente card intorno al bartender, niente introduzione separata o doppio pannello di messaggio/score. Mensola, legno e superficie uniscono lo spazio; rimane un solo pannello funzionale.
17. **Deviazioni residue:** artwork tiki e tre ingredienti sono l’identità originale del prodotto; lo sfondo conserva la propria nicchia centrale e bottiglie decorative. Il livello del mix resta un indicatore esterno, perché lo shaker PNG è opaco. I tre comandi occupano circa due terzi della larghezza, accanto al libro. Su mobile l’esperienza scorre e non riproduce la silhouette landscape.
18. **Gameplay preservato:** dominio/history, quantità intere, capacità, tempi e rate, ghiaccio/agrume, shake/fallimenti, scoring/tier, congelamento del risultato e reset. Nessun cambiamento a classicGame, productionBootstrap, tuning o ai callback/stato/effetti di App.
19. **Progressione preservata:** formule XP/monete, curva, sblocchi2/3, ownership/equip, ledger/watermark e settlement, schemaV1/storage/recovery/fallback. Nessun cosmetico o valore del profilo entra nello scorer.
20. **Accessibilità/input:** HoldButton, ownership del hold, pointer capture/release/cancel/lostcapture/blur/visibility e tastiera sono invariati e coperti dalla suite esistente. Verificati anche hold pointer e Space, focus su Agita/Servi/risultato/Versa dopo reset, focus del dialogo ed Escape. Anteprima DEV reduced motion: animation none/transition 0s, risultato immediato corretto. Non è un’emulazione OS o un test multitouch fisico.
21. **Offline:** produzione avviata su origine di test localhost4202, cache preparata, poi server spento. Reload, giro, ricompense, collezione/equip e ulteriore reload funzionano. Shell7 file, 42 percorsi artwork consentiti on-demand, zero artwork in precache; preload e policy selettiva invariati.
22. **Test:** 245/245, dei quali 243 preservati e 2 nuovi test SSR del componente reale ScoreHUD: guida prima del servizio e reveal/score/breakdown/restart accessibili nello stesso pannello. Gerarchia, ordine controlli, HUD compatto e collezione chiusa verificati nel DOM/browser reale; non dichiarati coperti da falsi test geometrici SSR.
23. **Controlli:** TypeScript strict, lint, suite completa, build, audit isolamento produzione e Git diff check superati. Audit applicato ai veri JS/CSS/HTML emessi; query DEV ignorate dalla produzione. Bundle JS circa299,70 kB (93,03 gzip), CSS38,02 kB (9,10 gzip). Nessuna nuova libreria/immagine o ricalcolo per frame aggiunto.
24. **Limiti:** note espanse, premi eccezionalmente lunghi o testo futuro possono richiedere scroll nel libro landscape; portrait/narrow scorrono normalmente. Non eseguiti test su tablet fisico/PWA installata o screen reader reale. Multi-tab/storage conserva i limiti già documentati nella fase2C.
25. **Passo consigliato:** breve playtest su tablet reale per composizione, touch e PWA installata; eventuali ritocchi soltanto con un nuovo incarico. Shop e acquisti restano fuori ambito.
26. **Nessun ramo creato** o cambiato, nessun worktree creato.
27. **Nessun commit, push, PR o accesso GitHub**, nessuna modifica a remotes/history.
28. **Nessuna ricerca sul riferimento**, web, Ruffle, SWF o automazione nativa.
29. **Changes non committate su main**, disponibili per la revisione e il commit dell’utente in GitHub Desktop. Arresto alla fase2D.

## Evidenze sintetiche

- Integrità SHA256: **804 file esistenti** di src/artwork/research/scripts/dependencies identici byte per byte; unica esclusione intenzionale fra i file protetti: l’import del CSS in main.tsx. Stato/dispatcher/callback/effetti di App confrontati esattamente con il checkpoint iniziale.
- Giro completo DEV: 240u frutteto, due ghiacci, una agitazione, agrume →9550, +115XP/+43monete, livello2 XP15, Bartender02 sbloccato. Equip/Reload mantiene Bartender02 e gli stessi progressi.
- Movimento ridotto: giro12u →422, +24XP/+6monete, breakdown immediato e focus sull’heading.
- Produzione: failure per hold shake oltre soglia →0, +5XP/+2monete; reset pulisce il mix. Server spento, giro12u →422, +24XP/+6monete; reload mantiene29XP/8monete senza duplicazione. Equip Nessun effetto persiste offline; poi ripristinato Scintille condivise.
- Asset Lab, Compatibility Lab, Tuning Inspector, Progression Lab e Visual Debug caricati soltanto in DEV; nessun esperimento storico eseguito.
- Screenshot della build finale1280×800: `work/phase2d-layout.jpg`, artefatto locale ignorato da Git. Server e schede di test chiusi, viewport ripristinato. Profilo/origine5173 dell’utente non toccato.
