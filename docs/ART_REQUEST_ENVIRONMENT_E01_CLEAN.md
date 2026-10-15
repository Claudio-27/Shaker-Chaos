# Richiesta artistica — environment.e01.background-clean

**BLOCKED ON NEW ART EXPORT**: manca questo export originale. Non è un difetto del codice. Questo documento è un brief per un lavoro separato; la fase 2H non genera immagini.

Destinazione: fondale modulare di Shaker-Chaos. Deve funzionare dietro a bartender, bottiglie interattive e banco separato già approvati, senza spostare la scena 600×440.

- Consegna: **PNG opaco sRGB 3200×2000**, 16:10. Minimo tecnico 1600×1000; nessun upscale artificiale. Eventuale master a livelli conservato separatamente.
- Continuità: stesso bar tiki tropicale al tramonto, legno caldo, luce ambrata, mensole/bottiglie decorative, vegetazione e accenti turchesi degli originali Shaker-Chaos. Preservare stile, palette, prospettiva e direzione della luce.
- Preservare parete posteriore, mensole, decorazioni e composizione superiore. Le bottiglie decorative rimangono sullo sfondo; nessuna nuova opzione che sembri interattiva.
- **Nessun banco in primo piano e nessun piano posteriore prominente** che formi una seconda linea del bancone. La parte inferiore è architettura/parete coerente che potrà essere coperta da un banco indipendente, senza un vuoto o una chiazza artificiale.
- **Nessun bartender, shaker, calice, oggetto di miscelazione, UI, bottone, indicatore, testo, numero o logo.** Nessun artwork del gioco di riferimento. Nessun banco c01 inglobato nello sfondo.

## Composizione e overlay esatto

Master 3200×2000 dipinto a800×500 logici, centrato a x−100. Finestra dello stage600×440: **x400,y0,w2400,h1760** sul master. Nel landscape corrente la parte esposta del fondale termina al top del banco y292: **x400,y0,w2400,h1168**. Fasce x0…400 e x2800…3200 sacrificabili per il crop responsive; evitare elementi essenziali ai bordi. Nessun importante dettaglio fisso nella zona dei messaggi.

| Zona bloccata | Coordinate sul master3200×2000 |
|---|---|
| Mensola / bottiglie interattive |x472,y216,w1520,h752|
| Bartender a destra |x1960,y184,w808,h1200|
| Top del banco selezionabile |y1168|
| Mixing inferiore centrale |x1320,y860,w500,h568|
| Messaggi inferiori a destra |x2008,y1368,w760,h360|
| HUD superiore |x432,y24,w2336,h120|

L’overlay è una guida separata e NON deve comparire nell’export. Per1600×1000 dimezzare tutte le coordinate. Gli oggetti del gioco si sovrappongono al fondale: evitare sagome dipinte che confondano il loro ruolo.

## Consegna e controllo

Path esatto nel repository: **art-source/art/environments/e01/background-clean.png**. La collocazione del file rappresenta l’approvazione dell’export; conservare l’originale e i livelli. Non sostituire background.png.

La pipeline controlla PNG, opacità, dimensioni minime, rapporto16:10 con tolleranza0,015, registra SHA-256 e produce runtime1440/2880px di larghezza, limitati alla risoluzione sorgente. Richiede una verifica visiva umana delle safe area e dell’assenza di banchi. Non certifica questi aspetti riconoscendo i pixel.

Dopo il drop-in: art:build -- --environments-only, art:verify, art:measure, check; poi verifiche scena600×440, cambio banco, portrait e warm/reload offline. **ART FITS STAGE. CLASSIC STAGE GEOMETRY LOCKED AFTER PHASE 2H.**

## Aggiornamento autorizzato — 2026-10-16

Richiesta soddisfatta tramite creazione esplicita dell’utente: fondale clean generato con image_gen integrato, usando l’originale Shaker-Chaos come edit target. File pronto: **art-source/art/environments/e01/background-clean.png**,1600×1000,PNG RGB opaco. Il risultato nativo1586×992 è conservato accanto; l’export richiesto è un ricampionamento tecnico lieve, documentato in [CLEAN_BACKGROUND_GENERATION](CLEAN_BACKGROUND_GENERATION.md). Il bancone anteriore e il piano di preparazione sono assenti; il basso continua come pavimento. Il blocco artistico precedente è risolto per questo export. Il brief sopra rimane come provenienza della richiesta.
