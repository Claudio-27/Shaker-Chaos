# Generazione bottiglie — Phase 2N

17 ottobre2026. Dopo il preflight che aveva riscontrato l'assenza degli artwork, l'utente ha autorizzato esplicitamente: «creali tu con strumento immagini e continua». Questa istruzione sostituisce il divieto di generazione della consegna2N originale, per questi tre asset. Usato **image_gen integrato**, una chiamata per bottiglia, con transparent_background=true. Nessuna CLI/API alternativa, chiave, servizio Canva o download di immagini.

Riferimenti di stile: bottle03 per botanical, bottle02 per ember, bottle01 per blossom; originali solo letti. Tre varianti originali con sagome diverse, senza lettering o UI. [Prompt completi esatti](ingredient-artwork-prompts.json). Gli output nativi sono stati copiati byte-identici dal percorso restituito dallo strumento ai master del repository. Nessun ritaglio, ricolorazione, rimozione sfondo o upscaling manuale dei master.

| ID | Master salvato | Nativo | Runtime1x /2x | SHA-256 master |
| --- | --- | --- | --- | --- |
| ingredient.bottle04 | art-source/art/ingredients/bottle04.png | 1024×1536 RGBA | 84×228 / 168×455 | 3a993e2f6fcdbc5618565daa703374349fe2e96414ef3c0af3e7732f3bda57c1 |
| ingredient.bottle05 | art-source/art/ingredients/bottle05.png | 1024×1536 RGBA | 124×228 / 248×456 | 4e7f050491362b94113d13a9fc77b327336d0f820488aface9e064baf0eebab5 |
| ingredient.bottle06 | art-source/art/ingredients/bottle06.png | 1024×1536 RGBA | 111×228 / 221×455 | 6d34d033cc92cc494deb9b1ccaeff56af2013afe37ef18f80688deab5ddef927 |

Tutti1024×1536, PNG8bit RGBA con alpha reale0..254, ampie aree alpha0; nessuno sfondo opaco. Revisione visiva eseguita su generati e scena: verde sfaccettata con felce, ambrata larga con emblema di brace, lilla a goccia con petalo. Nessuna copia ambigua delle tre legacy. L'ambrata usa circa63,2px di larghezza visibile contro64px del frame: entro la geometria esistente, accettata senza cambiare le costanti.

Registrazione append di tre record in artwork-inventory; i21 record originali restano identici. art:build -- --environments-only usa Pillow12.3.0 già disponibile, mantiene i22 asset registrati precedenti e genera sei PNG runtime. art:verify conferma25 master/49 derivati. Crop alpha>=8 con padding12 e altezza opaca224/448; nessun master in public. runtimeArtManifest/runtime-art-inventory/performance rigenerati con la pipeline; nessun path d'immagine nei componenti.

I tre flag published attivano automaticamente ContentItem, StoreOffer e dipendenze ricette. [Rapporto di attivazione](PHASE_2N_REPORT.md).
