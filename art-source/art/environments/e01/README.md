# Drop-in: environment.e01.background-clean

Inserire qui **background-clean.png**, export originale Shaker-Chaos approvato dall’utente. Il file non è presente e non va sostituito da un placeholder inventato.

Master consigliato 3200×2000, minimo 1600×1000, PNG opaco sRGB, circa 16:10. Brief: docs/ART_REQUEST_ENVIRONMENT_E01_CLEAN.md; overlay: docs/ART_EXPORT_REQUIREMENTS.md. La presenza nel path dichiara che è l’export approvato; i controlli automatici verificano geometria/formato/hash, non la qualità semantica dell’artwork.

Dal repository: npm run art:build -- --environments-only, npm run art:verify, npm run art:measure, npm run check. L’interprete Pillow 12.3.0 si configura con ART_PYTHON. I file invariati sono riusati senza rigenerarli. Il catalogo preferisce automaticamente il derivato clean mantenendo environment.e01 e counter.c01; nessuna migrazione del profilo.

background.png rimane il master storico immutabile. In assenza del nuovo file, o se la consegna runtime fallisce, resta il fondo legacy. Non generare o ripulire immagini automaticamente.
