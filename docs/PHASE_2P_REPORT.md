# Phase 2P — Final Player Polish

18 ottobre 2026. Fase completata e lasciata non committata su main. HEAD iniziale/finale a0f8b21 (2K); il lavoro 2L–2O risultava ancora locale, diversamente dal checkpoint atteso. È stato preservato. Nessun branch, commit, push, PR o accesso GitHub. Stop dopo 2P.

## Modifiche effettive

Guida contestuale al primo drink, skippabile e riapribile da Collezione → Aiuto. Una preferenza UI separata contiene solo l’ID del profilo che ha chiuso la guida; PlayerProfile resta V3 senza migrazioni. Returning player esclusi dall’onboarding automatico tramite roundsPlayed. Aiuto spiega comandi, ricette, XP, monete, shop, mastery e limiti offline in due disclosure facoltative.

Uniformati Posseduto / Equipaggiato / Equipaggia, Ricomincia invece dell’etichetta Reset, singolare di agitazione, messaggi iniziali e fallback immagine. Descrizioni dei controlli disabilitati, feedback testuale di equip, avvisi leggibili nella Collezione e tentativo di flush già esistente per salvataggi temporanei. La conferma gestisce anche rigetti inattesi senza restare occupata o promettere assenza di addebiti.

Schede con Home/Fine oltre alle frecce, focus corretto nei passaggi Ricette→Negozio, ritorno al trigger ed Esc nella conferma annidata. Rifiniture CSS solo per guida e superfici secondarie: target, focus, header del dialogo e griglia delle quattro schede sui piccoli schermi. Nessun asset, contenuto, dipendenza, schema, servizio o formula nuova. [Specifica v1 dell’esperienza](PLAYER_EXPERIENCE_V1.md).

## Confusione reale osservata e corretta

La prima versione della guida occupava troppo spazio nel pannello classico: la prova visiva mostrava titolo e testo tagliati, e il salto finiva sotto lo scroll. Correzione: una frase breve per fase; nel landscape si omette il titolo visivo ridondante mantenendo il nome accessibile. Salta guida/Ho capito riusano il posto del pulsante di salto già previsto e restano accanto a Ricomincia/Nuovo drink. Non si modifica alcun rettangolo della scena.

Il testo precedente di conferma suggeriva soltanto che l’equip restava invariato: ora distingue esplicitamente ingrediente subito disponibile e cosmetico da equipaggiare. La Collezione non alterna più Usa/Nella tua collezione con Equipaggia/Posseduto. Recovery e progressi temporanei avevano informazione insufficiente o troppo piccola: aggiunto avviso leggibile nel dialogo, senza alterare il recovery.

## First-session e returning-player smoke

Chrome, origini di prova isolate 5217 e 5219, nessuna modifica al salvataggio abituale. Nessuna scrittura console/localStorage o iniezione React.

1. Nuovo profilo 0 XP/0 monete: guida presente nel pannello; skip e reload la mantengono chiusa. Collezione→Aiuto, Fine seleziona Aiuto e focus help-tab; Rivedi la guida chiude il dialogo e porta il focus nel pannello.
2. Primo round reale con guida: versati 225 frutteto, una agitazione; score7921, +99 XP/+36 monete. I suggerimenti seguono mix/serve e poi spiegano XP/monete. Ho capito + reload: guida assente, progressi mantenuti. Il quantitativo deriva dall’input reale e non viene presentato come tentativo perfetto.
3. Ricettario aperto, gate leggibili, Esc restituisce focus a Collezione. Per controllare rapidamente il primo acquisto senza grind, solo i Lab DEV esistenti aggiungono 114 monete e 1 XP: a L1/150 monete Scia è ancora disabilitata; a L2 diventa acquistabile, senza essere concessa.
4. Invio apre la conferma; Esc chiude solo quella e restituisce focus al pulsante Scia, con il negozio ancora aperto. Spazio/Invio confermano150, saldo0. Equip Scia dà feedback testuale; reload conserva effetto/profilo e non ripropone la guida.
5. Checkpoint avanzato accelerato dai Lab: +900 XP/+1000 monete, nessun grant di proprietà. Anteprima reduced-motion esistente: round27 frutteto, risultato subito breakdown, +29 XP/+8 monete. Acquisti normali Sottobosco100, Brace175, bundle residuo255; equip Bartender02, saldo478, L6/29XP. Gli asset della scena e la seconda mensola vengono visitati prima dell’offline.
6. Passaggio a produzione: nessun laboratorio visibile, ritorno senza onboarding, stesso Bartender02/Scia/saldo. Seconda scheda di produzione con lo stesso profilo.

Le accelerazioni DEV sono dichiarate e non costituiscono una nuova stima del pacing: quello resta documentato in V1_BALANCE. L’origine5219 separata verifica il primo avvio della build di produzione senza pannelli DEV.

## Percorso offline reale

Entrambe le preview vengono fermate; fetch locale conferma 5217/5219 irraggiungibili. Sul nuovo profilo5219, reload PWA mostra la guida; skip e secondo reload la mantengono chiusa. Aiuto e il dettaglio Salvataggio e gioco offline restano disponibili.

Profilo avanzato5217: reload, shop, acquisto Petali225 ⇒478→253. L’altra scheda passa a253 senza reload. Collezione offline permette Bartender02→01→02, preservando Scia. Ricetta Primo raggio selezionata normalmente, pour114/unaagitazione/Serve: score4013, Riuscita95%, base60XP/21monete +completion15XP/5 +goal5XP/3. Saldo253→282, L6/109XP in entrambe le schede.

Reload offline conserva282, Bartender02, Scia, sei ingredienti, completion95% e goal; non assegna di nuovo premi né riapre la guida. I callback di input e i servizi di settlement/acquisto sono quelli preesistenti. [Prove e manifest](phase2p-smoke/README.md).

## Responsive e accessibilità

Venti combinazioni reali fra cinque viewport e quattro schede; [misure integrali](phase2p-smoke/responsive.json). Tutti i dialoghi restano nel viewport, scrollWidth≤clientWidth e nessun overflow della pagina. Target secondari minimi44×44 nei formati maggiori e48×48 a390/320. Salta guida usa il target esistente, misurato47,6px a1280 e45px a1024. Portrait mantiene il flusso verticale; non si impone uno scaling della scena mobile.

Verificati anche Home/Fine, Esc, Spazio/Invio, focus return, riapertura Aiuto, stato occupato e owned/equip. Le descrizioni hold sono lette dal DOM attraverso aria-describedby e contengono le ragioni correnti (ad esempio Versa prima un po’ di mix). Nessuna nuova animazione, audio o dipendenza; reduced-motion mantiene tutte le informazioni. Screen reader e touch hardware non vengono dichiarati certificati.

## Regressioni e verifiche

- **383 test passati**, 375 precedenti più8 mirati: quattro preferenza guida, tre rendering/copy/errori, uno spiegazioni dei comandi. Aggiornata una vecchia aspettativa di copy; nessun test eliminato o skipped.
- TypeScript strict, lint, suite completa, production build e isolamento DEV passati.
- art:verify, shop:audit, ingredients:audit, recipes:simulate ed economy:simulate passati.25 master/49 PNG runtime, stesso catalogo6/7/6.
- **248 file protetti byte-identici** rispetto all’inizio2P: dominio, application, platform già esistente, cataloghi tranne copy player, scripts/pipeline, artwork/pubblici, geometria e CSS precedenti, V1_BALANCE. Handler pointer/key/blur di HoldButton identici al checkpoint; modifiche al componente limitate a descrizioni accessibili.
- 3361 confronti full RoundResult legacy e quattro ricette originali invariati. Prezzi/gate/premi/tolleranze v1, profiloV3 e coordinamento invariati.
- Build91moduli: JS379,86KB/gzip119,18, CSS68,47KB/gzip14,74. Rispetto2O: +8,42KB JS (+2,94gzip), +2,13KB CSS (+0,44gzip), nessuna dipendenza aggiunta. Cache d14b2181971f4c4a, shell7, art70 su richiesta/zero precache/cap32. Nessuno skeleton o nuovo ciclo di timer continuo.

## Limiti e release candidate

Chrome desktop con viewport reali del renderer, non tablet fisico. Mancano conferme hardware su touch/rotazione, VoiceOver/TalkBack e tastiera mobile; la preferenza OS reduced-motion non è stata cambiata, usata anteprima DEV e suite observer esistente. Le immagini mai cacheate possono mancare offline; il profilo resta locale e il fallback senza Web Locks mantiene i limiti già dichiarati. Nessuna nuova garanzia transazionale o claim di performance su device lento.

Il warning di memory/recovery/conflict è protetto da test di presentazione e suite repository esistente; non si corrompono o cancellano salvataggi del browser per produrre una schermata. La selezione ricetta al reload resta volontariamente quella2L (gioco libero, mastery conservata). Restano utili smoke hardware e revisione umana prima della release candidate. Nessuna fase2Q avviata.
