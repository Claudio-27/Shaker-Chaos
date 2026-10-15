# Baseline visive — aggiornamento fase 2I

Le sette baseline originali Shaker-Chaos della cartella storica phase2h sono state aggiornate il 16 ottobre 2026 con il fondale CLEAN effettivamente verificato nel browser Chrome. **DOUBLE_COUNTER_STATUS: RESOLVED.** Il set precedente legacy rimane recuperabile nel commit locale8713115. Nessuna immagine del riferimento.

Viewport1280×800; palco esatto600×440. In DEV aprire /?artRegression=1&classicExact=1&scene=CASE, con i sette casi del manifest. I primi sei screenshot sono il clip600×440; Collection-open è il viewport1280×800 perché il dialogo è esterno al palco. Le fixture sono in memoria, senza persistenza o clock, con animazioni decorative ferme e comandi senza azioni. Risultati canonici deterministici9550 e0; il flusso reale di produzione è verificato separatamente.

manifest.json lega file, dimensioni, hash e SHA del clean effettivamente usato. I JPEG non promettono identità pixel tra browser/DPR differenti. Revisionare a pari viewport/DPR; verificare le ancore con VisualDebug e i test di geometria, storia, scoring e premi. Non modificare il lock dei cinque file per accomodare nuove funzionalità. La revisione deve rifiutare spostamenti di host/comandi, doppio banco, HUD ingrandito o composizione dashboard. Il test verifica l'integrità dei file, non interpreta semanticamente i pixel.

MAIN CLASSIC GAME STAGE VISUALLY LOCKED AFTER PHASE 2I. Vedere [rapporto2I](../../PHASE_2I_REPORT.md) e [prove produzione/offline](../phase2i/offline-evidence.json). Funzionalità future solo overlay, dialoghi o schermate secondarie.
