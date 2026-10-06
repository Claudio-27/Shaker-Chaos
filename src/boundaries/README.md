# Confini futuri, senza implementazione

Questa cartella documenta i punti di espansione. Non contiene servizi stub, finti sistemi di autenticazione o modelli di storage da rendere prematuramente vincolanti.

- **Progressione**: consumer applicativo del cocktail servito e del suo ScoreResult, mai una dipendenza dello scoring.
- **Profilo**: stato del giocatore e adapter di persistenza, scelti solo quando esistono requisiti di salvataggio.
- **Economia**: saldo e transazioni separati dalla formula; definire ID di partita/idempotenza prima dei premi persistenti.
- **Unlock ingredienti e bartender**: policy di disponibilità del catalogo. Il metadato opzionale unlockKey è un riferimento opaco, non sicurezza né uno sblocco implementato.
- **Scoperta ricette**: osserva mix e risultato dopo il servizio; ricette disponibili nel catalogo non implicano un sistema di discovery.
- **Vault**: autenticazione/sessioni/autorizzazione server e catalogo protetto separato. Nessun contenuto privato nel bundle, in localStorage o nella cache pubblica.

La direzione prevista è domain -> risultato -> consumer applicativi. Il dominio non importa questi consumer. Per schema delle responsabilità, decisioni e limiti consultare `docs/ARCHITECTURE.md`. I contratti runtime saranno definiti nelle fasi dedicate dopo la ricerca e i requisiti di persistenza.
