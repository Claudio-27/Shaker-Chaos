# Phase 2H — Clean Background Integration & Final Scene Lock

**Chiusura tecnica completata. Obiettivo artistico: BLOCKED ON NEW ART EXPORT.** Il clean background non è stato fornito; il percorso alternativo esplicitamente previsto dal prompt è implementato. Il doppio banco non viene dichiarato rimosso. Nessun’altra fase è iniziata.

## Consegna e stato del repository

1. **Branch: main**, mantenuto per tutta la fase.
2. **Fase2G committata prima della2H** nel checkpoint **797ac28**, “Refine production runtime assets for Phase 2G”. Commit locale creato dall’agente su esplicita autorizzazione “fai tu il commit per questa volta”; non presentato come commit già fatto dall’utente. L’eccezione riguarda questo checkpoint e si è esaurita.
3. **Clean source non trovata**: ispezionati repository e sola cartella già autorizzata C:/Users/claud/Desktop/Immagini Claudio x Codex/Shaker Chaos/. Contiene i21 artwork storici, nessun nuovo export equivalente. Nessun originale esterno modificato. Lo sfondo storico è stato ispezionato visivamente e il file Desktop ha lo stesso SHA-256 del master locale.
4. Path clean attuale: **assente**. Drop-in definito: **art-source/art/environments/e01/background-clean.png**, con README locale alla cartella e contratto scripts/environment-art-sources.json.
5. Dimensioni clean attuali: **N/A**. Target consigliato3200×2000, minimo1600×1000, PNG opaco sRGB, rapporto1.6 con tolleranza0.015.
6. Hash clean attuale: **N/A**. Verrà calcolato dal file approvato, senza sovrascrivere i record storici.
7. **Nessuna nuova variante raster creata**: i41 PNG1x/2x della2G sono identici. Futuro clean:1440/2880px di larghezza, cap al master, alpha/crop/hash/byte nel manifest. Nessun3x o upscale artificiale.
8. Legacy preservato: art-source/art/environments/e01/background.png,1586×992, SHA-256 **83fd5f50914a82f2cb81414930bebb5021875a66e56e2a180d7999eb83ee9559**. Il runtime2G rimane quello usato in produzione e il fallback futuro. Tutti i21 master e i41 derivati originali verificati inhash; storico artwork-inventory.json invariato.

## Composizione, identità e fallback

9. **environment.e01 rimane l’ID di contenuto e salvataggio**. Il futuro environment.e01.background.clean è un ID visivo aggiuntivo. Catalogo, renderer, planner, preload, anteprime Collection e warm risolvono il clean quando disponibile, senza migrazioni.
10. **Banco indipendente**: VisualLoadout.counterId e CounterVisualDefinition.surface sono il ruolo foregroundCounter. Non sono inglobati nell’ambiente. EnvironmentVisualDefinition supporta background legacy, backgroundClean opzionale, backBar e decorations opzionali: nessun ambiente è obbligato ad avere ogni layer.
11. **Doppio banco ancora presente nel legacy**, soprattutto nel flow portrait. Nel landscape resta l’occlusione migliore2G, senza peggioramenti o trucchi nuovi. Solo l’export pulito può rimuoverlo artisticamente.
12. **Framing canonico invariato**:600×440, sagome, centri, baseline, hitbox e posizioni del palco bloccati. Per il clean il modello mantiene lo stesso contenitore/cover; le safe area sono nel brief e andranno validate sull’export reale. Nessuna falsa attestazione di calibrazione di un’immagine assente.
13. Metadati aggiunti: ruolo backgroundClean opzionale, contratto della sorgente e environmentSources nell’inventario (present:false). Nessun nuovo valore di geometria. I nuovi riferimenti tipizzati puntano alle costanti2E/2F esistenti.
14. Allineamento banco identico: sagoma larga600, top fisico y292; shaker, calice, Ice/Garnish e comandi nelle posizioni approvate. CSS/framing/layout byte-identici alla2G, verificati da hash e test.
15. **Cambio ambiente/banco verificato nel DEV Asset Lab**:e01+c01, e01+counter.studio, studio+counter.studio, studio+c01; selezione b02 indipendente. Nessun cambiamento alle quantità o ai progressi. Con il legacy il banco dipinto resta visibile cambiando superficie: limite atteso; il criterio “nessun banco dipinto con qualunque superficie” resta da verificare sul futuro clean.
16. Fallback ordinato e deduplicato: clean risoluzione richiesta → altra risoluzione clean → legacy richiesta → altra legacy. Asset non registrato: legacy immediato. Consegna fallita: tentativi successivi solo dopo errore, senza scaricare entrambe le risoluzioni al normale avvio. Nessun messaggio tecnico per il giocatore in caso di clean mancante; stato diagnostico nei metadati DOM/DEV. Il fallback della thumbnail ambiente usa lo stesso percorso.
17. **art:build** scopre automaticamente il path approvato, verifica PNG/opacità/minimi/rapporto, genera varianti/manifest e registra provenienza. **art:build -- --environments-only** riusa tutti gli output invariati e aggiorna le sole sorgenti ambiente. Eseguito due volte sul caso assente senza modificare alcun PNG; master sempre preservati. art:verify rileva anche un nuovo drop-in non ancora derivato. Il path dichiara che il file è quello fornito e approvato dall’utente; la pipeline non certifica semanticamente che non contenga un banco.
18. PWA:7file shell, zero artwork precached,62path pubblici runtime esatti, limite32 invariato nel caso attuale. Supporto a catene di fallback limitate/validate, con pin della variante riuscita; niente master inpublic/dist/cache. Cache finale **70aa33b721b36889**. Eventuali nuovi runtime clean entreranno nell’allowlist tramite il medesimo registro.
19. **Offline clean: non testabile, sorgente assente.** Offline legacy verificato realmente dopo warm con preview4211 fermata: reload, ambiente, banco, bottiglie, b02idle/shaker, profilo e Collection in cache disponibili; cambio a b01 offline riuscito, zero asset mancanti. Preferenza e fallback clean→legacy offline verificati con test di metadati/cache in memoria, senza fabbricare un bitmap clean di produzione.
20. **Salvataggi compatibili**: environment.e01/counter.c01 continuano a risolvere con clean aggiunto o assente. Nessuna migrazione, rinomina o modifica allo schema del profilo. Test dedicati al loadout serializzato.

## Verifiche visive e blocco finale

21. **600×440 logici**: sette baseline del nostro gioco, palco esattamente600×440. b01idle/risultato, b02idle/risultato, fallimento, Collection chiusa/aperta. Nessuno scroll di pagina nel landscape; il dettaglio risultato conserva lo scroll interno. Il dialogo Collection è un overlay, non sposta il palco.
22. **1024×768**:stage1000×733.333; nessuno scroll orizzontale o verticale della pagina normale, nessun asset mancante.
23. **1280×800**:stage1058.182×776; nessuno scroll della pagina normale. Framing e focal hierarchy invariati.
24. **768×1024,390×844,320×640**: nessun overflow orizzontale; scroll verticale previsto dal flow già esistente. Sagome/etichette/counter preservati, zero asset mancanti. Test in Chrome desktop con viewport, non tablet/touch fisico. Reduced-motion/accessibilità non modificati; test esistenti preservati.
25. Baseline versionate in **docs/visual-baselines/phase2h/**,7JPEG con manifest/hash/istruzioni. Sei catture del solo palco600×440; Collection-open cattura viewport1280×800 con palco canonico sotto. Screenshot del nostro codice e artwork, nessuna immagine del riferimento. I JPEG non sono snapshot pixel-identici per tutti i browser. Riutilizzata la fixture DEV2G, estesa ai casi finali, nessuna dipendenza pesante. L’export clean futuro richiederà revisione delle sole baseline artistiche; non autorizza a cambiare il lock geometrico.
26. Politica documentata in AGENTS, architettura, export, pipeline e contratto: **CLASSIC STAGE GEOMETRY LOCKED AFTER PHASE 2H.** classicStageLayout.ts resta fonte autorevole per dimensioni, zone, layer, comandi e pannelli. classicStageContract.ts espone gli stessi riferimenti; test golden protegge tutti i cinque file di layout/framing/CSS. Nuovi sistemi devono usare overlay/dialoghi/schermate secondarie.
27. **ART_REQUEST_ENVIRONMENT_E01_CLEAN.md creato**, con dimensioni, continuità artistica/luce/palette, elementi da preservare/rimuovere, overlay esatto600×440 e path di consegna. README nella cartella target. Nessun file background-clean.png fittizio.
28. **Blocco visivo residuo: BLOCKED ON NEW ART EXPORT**, per rimuovere il banco incorporato. Non è un difetto del codice e non richiede altre maschere CSS. Restano anche i limiti artistici storici della2G; questa fase non li ridisegna.

## Controlli e limiti di scopo

29. **291test passati**, tutti i280 precedenti preservati nei loro intenti e11 aggiuntivi: preferenza clean/legacy, identità stabile, combinazioni banco, planner/percorsi SVG e raster, loadout, provenienza, geometria, rendering fallback, Collection e catene cache offline/allowlist. Test del clean solo metadati in memoria, nessuna immagine clean fabbricata in produzione.
30. **TypeScript strict, lint, tutti i test, build di produzione, audit di isolamento DEV, art:verify e Git diff check passati**.68moduli; CSS invariato60266B; JS324686B. Nessuna nuova dipendenza. Verificati97file protetti, inclusi dominio/application, App/PlayerProgression, master/derivati e configurazione visiva storica. Sette baseline ricontrollate conSHA-256.
31. **Gameplay/scoring invariati**: giro reale con Pour240, Ice2, Shake7000ms eguarnizione → **9550/10000**, stesso risultato dei golden. Test automatici di cronologia, scoring e failure ancora passati. Nessuna ricerca sulla compatibilità.
32. **Progressione/persistenza invariate**: giro reale+115XP/+43monete, Livello2 con15/150XP; b02 sbloccato/equipaggiato, reload conserva43monete ehost, nessun premio duplicato. Poi cambio b01 in Collection offline riuscito. Nessuna regola, ownership, settlement, input o flusso risultato cambiati; solo risoluzione delle immagini ambiente nell’anteprima.
33. **Prossimo passo consigliato, senza avviarlo**: produrre separatamente il clean export usando il brief; collocarlo nel target, eseguire art:build -- --environments-only / art:verify / art:measure / check e verifica artistica della scena, cambio banco eoffline. Nessun redesign o nuova funzione necessaria per adottarlo.
34. **Nessuna ricerca/esecuzione del riferimento**: niente Ruffle, SWF, osservazioni o ispezione del suo artwork. Ricerca congelata.
35. **Nessun artwork fabbricato, generato, ridisegnato o inpainted**. Niente AI, clone, blur, pezzi di altri asset, nuove maschere o finta pulizia. Le sole nuove immagini sono screenshot di verifica del nostro gioco.
36. **Nessun ramo creato**.
37. **Nessun commit della2H, push, PR, accessoGitHub o modifica ai remote/storia**. Unico commit di questo incarico: il checkpoint2G797ac28 esplicitamente autorizzato prima della fase.
38. **2H lasciata non committata e non staged su main**, per revisione inGitHubDesktop. Stop dopo2H; nessun sistema giocatore nuovo.


Nota finale di verifica: la ricattura del solo failure è avvenuta in Chromium integrato dopo un’interruzione di Chrome; manifest eREADME della baseline lo registrano. La fixture DEV è stata allineata al parametro served=false del fallimento reale, e tutti i291 test/TypeScript/lint/build sono stati rieseguiti con successo dopo la correzione. Il bundle di produzione e la cache restano identici, perché il componente è escluso dalla build. Nessuna ulteriore modifica al gioco.

## Clean export fornito su richiesta esplicita — 2026-10-16

L’utente ha successivamente chiesto di creare il clean background con il fondale originale come riferimento e ha autorizzato il commit locale. Questa richiesta supera il divieto artistico della precedente fase tecnica. Export generato con image_gen integrato e integrato nel path previsto:1600×1000 opaco. Nativo generato1586×992 conservato, lieve normalizzazione dimensionale dichiarata. **Il blocco del clean export è risolto**; i risultati e lo stato “assente” sopra restano la registrazione storica della prima consegna.

Preferenza di produzione ora environment.e01.background.clean; legacy preservato, counter.c01 indipendente. Derivati clean1440×900 e1600×1000;22 sorgenti registrate/43 PNG runtime/64 URL pubblici ammessi. Tutti i21 master storici,41 derivati2G e97 file protetti rimangono identici. Geometria e regole non cambiano. Le sette baseline in visual-baselines/phase2h documentano il precedente fondale legacy e sono etichettate come tali; non vengono presentate come catture del nuovo export. La verifica visiva odierna è sul fondale generato; l’anteprima browser odierna non è stata completata per indisponibilità della sessione, senza alterare la validazione automatica.

Provenienza, file nativo, export tecnico e prompt finale in [CLEAN_BACKGROUND_GENERATION](CLEAN_BACKGROUND_GENERATION.md). Un unico commit locale autorizzato include la fondazione2H pendente e questo nuovo asset; nessun push o accessoGitHub.
