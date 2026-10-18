# Brief delle tre bottiglie — soddisfatto in Phase 2N

I tre PNG finali sono stati generati e integrati dopo esplicita autorizzazione dell’utente. Tutti i sei ingredienti sono ora pubblicati. [Provenienza e prompt](INGREDIENT_ARTWORK_GENERATION.md), [rapporto](PHASE_2N_REPORT.md). Le specifiche e la procedura sotto sono il brief storico2M, conservato come riferimento; la consegna e l’attivazione sono completate.

## Contratto comune

Stessa direzione Shaker-Chaos: illustrazione2D cartoon, contorni leggermente marcati, cel shading semplice, colori caldi sotto luce teatrale tiki, riflessi leggibili, prospettiva frontale delle bottiglie esistenti. Il tappo e il fondo devono essere interi. Nessuna persona, mano, ombra ambientale estesa, mensola, fondale, UI, testo, logo o scritta leggibile; eventuali etichette con simboli astratti.

- Master PNG RGBA trasparente, sRGB, **1024×1536px**, stesso canvas dei tre originali. Alpha reale, niente scacchiera o fondale bianco incorporato.
- Soggetto singolo centrato; opaque bounds suggeriti: altezza1400–1480px, fondo intorno a y1500, margini reali almeno24px. Silhouette con rapporto larghezza/altezza opaca circa0,28–0,50: resta entro lo slot64px a118px visibili. Forma leggibile già a circa40–60×118px.
- Pipeline2G: alphaThreshold8, padding12px, runtime altezza opaca224px a1x /448px a2x, PNG deterministici con hash nel nome. Non consegnare runtime precalcolati o JPEG. Niente cambio di Pillow/config/layout.
- La baseline di gioco è128px nel frame di bottiglia, altezza visibile118px; crop/offset sono derivati dai bounds alpha dal manifest. Non bisogna aggiungere coordinate manuali a classicVisualFraming.ts. Proteggere dettagli sottili con alpha almeno8; nessun glow quasi trasparente distante che allarghi il crop.

## ingredient.botanical — Amaro di sottobosco

ID visuale **ingredient.bottle04**; master finale **art-source/art/ingredients/bottle04.png**. Bitter/erbaceo asciutto. Vetro verde bosco scuro, liquido oliva dorato, tappo corto bronzo scuro. Silhouette spalle angolari, corpo esagonale/slanciato moderato; distintiva dalla bottiglia fruttata rotonda, dall'arancio e dall'azzurro. Etichetta avorio con semplice felce astratta, senza lettere. Colore dominio#507451 (indicazione, non vincolo pixel).

Evitare copia della bottiglia soda alta e stretta, grandi foglie fuori dal contenitore, nero privo di separazione sullo scaffale o un verde simile al solo dettaglio della bottiglia agrumi.

## ingredient.ember — Base di brace

ID visuale **ingredient.bottle05**; master **art-source/art/ingredients/bottle05.png**. Base intensa/tostata. Vetro ambrato scuro con riflessi rame e liquido bruno caldo; corpo largo con spalle basse arrotondate, collo corto e tappo squadrato. Entro il rapporto0,50 per mantenere spazio nello slot. Sigillo semplice in rame con geometria di brace astratta, nessuna fiamma fuori dal vetro. Colore dominio#a75235.

Evitare sagoma/etichetta arancione identica agli agrumi, bottle inclinata, fuoco/particelle, fondale o grande ombra portata. Deve distinguersi per forma prima del colore.

## ingredient.blossom — Essenza di petali

ID visuale **ingredient.bottle06**; master **art-source/art/ingredients/bottle06.png**. Aroma floreale leggero. Vetro lilla tenue, liquido rosa lavanda, corpo a goccia/pera con base stabile e collo sottile ma non alto quanto la soda; tappo perlaceo piccolo. Simbolo astratto di petalo sull'etichetta chiara. Colore dominio#bb83ab.

Evitare azzurro dominante o sagoma soda, rosa fotorealistico trasparente difficile da leggere sul fondale, fiori fisici fuori dalla bottiglia, testo o decorazione troppo fine.

## Consegna e attivazione successiva

Fornire solo questi tre PNG finali nella cartella indicata, lasciando intatti tutti i master esistenti. Nessuna modifica alla logica per integrarli: registrare **dati** delle tre nuove righe (ID/path/dimensioni/hash/misure) in docs/artwork-inventory.json, eseguire npm run art:build e art:verify. Le righe storiche e i loro hash non vanno riscritti. Il manifest runtime e l'inventario derivato vengono generati dalla pipeline.

Dopo revisione visiva, attivare il solo flag editoriale published nelle tre definizioni di ingredientCatalog.ts, anche una alla volta. ContentItem, StoreOffer, dipendenze ricette e visual runtime si derivano automaticamente; non occorrono patch a motore, JSX, CSS o geometria. Il flag da solo senza registrazione dell'asset fa fallire la validazione. Eseguire controlli e prova browser di ciascuna nuova pagina/offerta/ricetta, incluso acquisto offline con asset cacheati e seconda scheda. Questa attivazione non è stata eseguita in2M.
