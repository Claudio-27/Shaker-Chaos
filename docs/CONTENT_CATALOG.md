# Catalogo modulare

## Stato corrente2K

Due cosmetici reali opzionali, stessi ID e stessi prezzi2J: bartender.b02=300monete, currency.availableFromLevel=3; effect.ice-blue=150monete, availableFromLevel=2. Nessun metadato progression per questi acquisti. progressionTuning.unlocks contiene solo grant gratuiti intenzionali e ora è vuoto. Cinque starter e quattro segnaposto DEV invariati.

productionStore espone due ITEM e bundle.b02-ice-blue “Un nuovo turno”, BUNDLE dal livello6. Contiene i due ID canonici; nessuna copia di definizione o asset. Prezzo residuo floor(subtotal×85/100):382 completo,255 senza bartender,127 senza effetto. Gate di offerta e gate degli elementi mancanti concorrono al livello effettivo; proprietà storiche già acquisite non sono revocate. I quattro bundle storici di esempio non sono venduti.

Per aggiungere starter/grant/acquisto gated/ungated/bundle si usano le configurazioni descritte in [SHOP_SYSTEM](SHOP_SYSTEM.md); nessun JSX specifico per livello o ID. Livelli e prezzi non sono schema del salvataggio: restaV2. [Rapporto2K](PHASE_2K_REPORT.md). Le sezioni seguenti conservano i checkpoint storici, non la policy corrente.

## Checkpoint storico 2C — proprietà separate dalle definizioni

ContentItem e BundleDefinition restano canonici; profilo persistente conserva soltanto ID/entitlements e loadout. Starter: bartender.b01, environment.e01, counter.c01, bottles.supplied, effect.sparkles. Progressione: bartender.b02 al livello2, effect.ice-blue al livello3, configurati in progressionTuning.ts. Metadati unlock aggiornati alle requirementId; segnaposto legacy development, ispezionabili in AssetLab e esclusi dalla Collection normale.

Fonti di proprietà previste: starter/progression/currency-purchased/bundle-granted/promotional/private; soltanto le prime due sono attive. Bundle includedContentIds e price restano compatibili, senza acquistare o concedere bundle. Uno stesso ID rimane un solo articolo anche con più possibili provenienze.

Collection consente equip owned, indica Equipped/Locked e requisiti di livello; niente pulsante di acquisto. Gli slot sono persistiti indipendentemente. Entitlements rimossi dal catalogo restano inattivi; equip invalido torna allo starter, displayName rinominato non modifica l’identità. Resolver visuale separato dagli ID salvati.

Asset condivisi obbligatori del gameplay non vengono bloccati. Niente preload delle card locked. Nuovi artwork di uno sblocco possono mancare offline e ripiegare sull’idle dello starter mentre la scelta resta salvata. Proprietà locale di private ID non autorizza contenuti protetti o file in public.

[Progression system](PROGRESSION_SYSTEM.md). Le note 0.3 sotto sono il progetto storico dei metadati.


Aggiornamento 2026-10-06. Metadati e composizione visiva soltanto: nessun negozio, acquisto, saldo, progressione, inventario persistente o entitlement funzionante.

## Identità e definizioni

Un ContentItem canonico ha id stabile, displayName modificabile, kind, visibility, visualDefinitionId, unlock e price opzionale. I nomi dei bartender mostrati dalla demo vengono letti da questi stessi elementi, evitando una seconda anagrafica dei nomi. I path/formati delle immagini sono soltanto nel registro VisualCatalog; un bundle non contiene file.

| ID canonico | Nome provvisorio | Definizione/slot |
| --- | --- | --- |
| milo | Milo · segnaposto | bartender, legacy conservato |
| bartender.b01 | Bartender 01 | bartender, artwork A |
| bartender.b02 | Bartender 02 | bartender, artwork B |
| studio | Studio · segnaposto | environment, legacy conservato |
| environment.e01 | Bar tiki al tramonto | environment, background con back bar già dipinto |
| counter.studio | Banco · segnaposto | counter, estratto dall'ambiente legacy senza rinominare il suo asset |
| counter.c01 | Banco in legno intarsiato | counter, artwork separato |
| effect.sparkles | Scintille condivise | effect, riutilizzabile |
| effect.ice-blue | Scia azzurra | effect, default di B ma equipaggiabile indipendentemente |
| bottles.placeholder | Bottiglie · segnaposto | bottle-set, tre visual originali |
| bottles.supplied | Bottiglie fornite · abbinamento demo | bottle-set, tre PNG forniti |

BartenderVisualDefinition associa idle, portrait opzionale, tasting e sequenze dei ReactionId demo. Welcome riusa idle. Il defaultEffectId è una preferenza sostituibile, non un vincolo di bundle/ambiente. EnvironmentVisualDefinition non contiene un counterId: soltanto background, backBar opzionale e decorazioni. CounterVisualDefinition registra surface e fit. EffectVisualDefinition registra un asset opzionale.

Il set bottles.supplied associa provvisoriamente bottle03→orchard, bottle02→citrus, bottle01→soda, per distinguere visivamente i tre pulsanti. I nomi degli ingredienti, le quantità, i colori del mix e lo scoring restano quelli inventati della demo. I PNG non attestano una sostanza o una ricetta reale. La relativa identità semantica resta da approvare.

## Composizione indipendente

VisualLoadout è puro, immutabile per aggiornamento, senza clock/DOM/storage:

~~~ts
const loadout = {
  bartenderId: 'bartender.b02',
  environmentId: 'environment.e01',
  counterId: 'counter.c01',
  effectOverride: 'effect.sparkles',
  bottleSetId: 'bottles.supplied',
};
~~~

La composizione è valida senza scegliere un bundle. replaceVisualSlot aggiorna un solo slot e mantiene tutti gli altri. effectOverride undefined usa il default del bartender; null disabilita l'effetto; un ID seleziona un effetto condiviso. Gli effetti compaiono alla reazione eccellente della demo. bottleSetId modifica i visual delle bottiglie senza cambiare l'ingrediente di dominio.

Il loadout vive nello stato di presentazione React, separato dal reducer applicativo. Nessun MixEvent descrive selezioni cosmetiche. Lo scoring non riceve il loadout. Reload e riavvio perdono le scelte del laboratorio: non è stato adottato un formato di salvataggio.

## Bundle

Quattro esempi dichiarativi pubblici, senza prezzi o concessione reale di diritti:

| ID | Riferimenti canonici |
| --- | --- |
| bundle.b01-environment | bartender.b01, environment.e01 |
| bundle.b02-counter | bartender.b02, counter.c01 |
| bundle.environment-counter | environment.e01, counter.c01 |
| bundle.full-scene | bartender.b02, environment.e01, counter.c01, effect.sparkles |

Un elemento può figurare in più bundle e come elemento indipendente: la risoluzione restituisce lo stesso oggetto canonico. Il validatore rifiuta ID duplicati, riferimenti inesistenti e duplicati dentro un bundle. Nessun bundle possiede copie degli asset, applica un loadout o sblocca contenuti ora.

## Metadati futuri

UnlockMetadata può descrivere default, progression con requirementId, currency con currencyId, bundle-entitlement, private-entitlement, promotion e development con entitlementId. Non esiste un valutatore di questi requisiti. Gli elementi attuali hanno solo default.

PriceMetadata contiene currency e amount intero sicuro non negativo. Nessun prezzo reale, moneta o equilibrio economico è stato inventato. Eventuali acquisti futuri dovranno passare da un sistema separato che produce entitlement; membership in un bundle non dimostra proprietà o accesso.

ContentKind ammette anche ingredient, recipe e reaction-set come confini futuri; il validatore pubblico corrente accetta soltanto le definizioni visive effettivamente implementate. Estendere un kind richiede aggiungere la sua tabella e validazione, non aggirare il controllo.

## Pubblico e privato

ContentVisibility descrive public o private, ma publicContentCatalog e VisualCatalog distribuito ammettono soltanto elementi e immagini pubbliche. Le immagini dichiarano visibility: public. Il validatore e la build respingono descriptor protetti e output pubblici non classificati. Un ID privato inesistente non si risolve.

ProtectedContentRequest e ProtectedContentDelivery sono solo contratti TypeScript per una futura risoluzione autorizzata lato server. Nessuna implementazione, endpoint, password, URL privato fittizio o download protetto è distribuito. L'interfaccia futura non promette sicurezza da sola: il server dovrà verificare autenticazione/entitlement, scadenza, revoca e policy di cache su ogni richiesta.

Un asset in public/, un URL nascosto, una password JavaScript o un flag di visibilità nel bundle è scaricabile dal client. Per una vera consegna privata, artwork e URL protetti devono restare fuori dal client pubblico e dalla allowlist del service worker. La classificazione dei materiali pubblicabili resta una responsabilità editoriale: i validatori non possono scoprire che un autore abbia etichettato erroneamente un segreto come pubblico.

## Asset Lab

Avviare npm run dev e aprire /?assetLab=1; aggiungere &visualDebug=1 per zone, safe area e hitbox. Selezioni disponibili: bartender, environment, counter, bottle-set, effect. La diagnostica mostra loadout, ID richiesti/risolti, dimensioni realmente decodificate, viewport, errori e fallback. I default dei SVG legacy senza width/height possono produrre naturalWidth/naturalHeight diversi dal loro viewBox: la registrazione resta il canvas di composizione.

Asset Lab e visualDebug sono gated da import.meta.env.DEV. AssetLab viene importato solo in sviluppo; la build di produzione non include il modulo del laboratorio. La query non apre un negozio o un laboratorio in produzione.
