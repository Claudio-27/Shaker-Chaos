# Clean background — consegna del 2026-10-16

Creato su esplicita richiesta dell’utente tramite **image_gen integrato**, usando il fondale originale Shaker-Chaos come riferimento/edit target. La richiesta odierna autorizza questo export artistico e un commit locale, superando il precedente divieto di generazione della sola fase2H tecnica.

## File e trasformazioni

- Storico immutato: art-source/art/environments/e01/background.png.
- Risultato generato nativo: art-source/art/environments/e01/background-clean.native.png,1586×992, PNG RGB opaco, conservato byte-identico all’output dello strumento.
- Export per il progetto: art-source/art/environments/e01/background-clean.png,**1600×1000**,16:10,PNG RGB opaco.
- Il generatore ha mantenuto il canvas sorgente nonostante la dimensione preferita nel prompt. Il solo export tecnico è stato ricampionato con LANCZOS/Pillow12.3.0 a1600×1000 (circa+0,9%); questo non aggiunge dettaglio reale. Nessuna ricostruzione artistica manuale. Il raster nativo rimane disponibile per ogni verifica.
- Derivati runtime: prodotti da art:build -- --environments-only; nessuna rigenerazione delle21 sorgenti e41 varianti storiche. ID di contenuto environment.e01 e counter.c01 stabili.

## Verifica artistica

Bancone anteriore, frontale, sgabelli e piano posteriore rimossi. Nessun calice, shaker, utensile, persona, testo o UI nel fondale. Restano le mensole con bottiglie decorative, arco/parete, colonne tiki, corde, vegetazione, scorci laterali e luce ambrata dell’originale. La parte inferiore continua come pavimento in prospettiva, senza piano o rim del banco. L’area centrale/destra conserva spazio per il personaggio e gli oggetti separati del gioco.

Il prompt finale completo è in CLEAN_BACKGROUND_GENERATION_PROMPT.txt. Metodo: built-in image_gen, nessun fallbackCLI/API o ricerca del riferimento. Originale e nativo generato preservati. Geometria600×440, CSS, hitbox, gameplay e progressione non cambiano.

## Esito dei controlli e consegna

TypeScript strict, lint ESLint,291 test, build di produzione/audit di isolamento e art:verify superati con il clean realmente presente. Nessuna modifica ai97 file protetti della precedente verifica (inclusi gameplay, stage/framing/CSS,21 sorgenti e41 raster storici). Allowlist PWA64 runtime,7file shell, zero artwork precached. L’anteprima browser in questa sessione non è stata completata perché la sessione di controllo non rispondeva; non viene dichiarata una nuova prova visiva in-game/offline. Il fondale completo è stato ispezionato visivamente e i percorsi preferiti/fallback sono coperti dai test. I sette screenshot2H restano esplicitamente baseline legacy.

Hash e dimensioni in clean-background-artifact.json; prompt in CLEAN_BACKGROUND_GENERATION_PROMPT.txt. Consegna in un unico commit locale autorizzato, includendo la fondazione2H che era pendente. Nessun push o accessoGitHub.
