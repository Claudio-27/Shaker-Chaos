# Release checklist v1 — 1.0.0-rc.1

Esecuzione: 18 ottobre 2026, Windows, Chrome collegato, produzione locale. Versione candidata, non pubblicazione. PASS significa eseguito con il metodo dichiarato; FAIL significa esito negativo; NOT TESTED resta da collaudare. Le verifiche automatiche non certificano touch o lettura vocale reali.

| Controllo riutilizzabile | Stato | Evidenza / metodo |
| --- | --- | --- |
| main e checkpoint 2P preservato | PASS | b8f1015, checkpoint 2L–2P richiesto dall’utente |
| TypeScript strict | PASS | npm run check |
| Lint | PASS | npm run check |
| Tutti i test, nessuno escluso | PASS | 388 pass, 0 fail/skip; baseline 383 +5 |
| Build e isolamento DEV | PASS | 91 moduli; audit applicato ai file emessi |
| Artwork / shop / ingredienti / ricette / economia | PASS | Tutti i cinque audit npm esistenti |
| Gameplay canonico e reaction tier | PASS | Suite production; 3361 confronti full RoundResult legacy identici |
| Versa, rilascio, Agita, Servi | PASS | Tastiera reale Chrome, 23 round complessivi sulle build 2P/RC |
| Ice / Garnish | PASS | Round ripetuti con zero/uno Ice e agrume; limiti coperti dalla suite |
| Capacità 240 e stop automatico | PASS | Hold 11200 ms: 240, Versa inattivo, focus Agita |
| Esplosione | PASS | Hold Agita 8300 ms: fallimento, score 0, +5 XP/+2 monete |
| Resize durante hold | PASS | Riprodotto FAIL prima del fix; unit test e Chrome: idle dopo 174 ms con tasto ancora premuto per 4000 ms |
| pointercancel, lostpointercapture, multitouch, release fuori target | PASS | Test controller/capture; NON verifica touch hardware |
| Blur, visibility, cleanup e callback tardivi | PASS | Test di interruzione e ownership; nessun timer obsoleto efficace |
| Leak di listener/timer ai mount | PASS | Test100 cicli bind/cleanup, conteggi a zero |
| Nuovo profilo, guida, skip e ritorno | PASS | Avvio origine isolata e reload; preferenza resta dopo update/offline |
| Salvataggio e V3 reload | PASS | Repository + UI; wallet/loadout/mastery/goal e receipt persistenti |
| V1→V3 | PASS | Matrice repository con XP/level/coins/ownership/stats/ledger preesistenti ed equip non predefinito, input immutato |
| V2→V3 | PASS | Acquisto pagato e Bartender 02 equipaggiato, tutti i campi originali e receipt preservati |
| V3→V3 | PASS | Mastery/goal/equip non predefinito e reload senza riscrittura duplicata |
| Corruzione e recovery | PASS | Suite repository: backup esatto prima del recovery; nessun dato browser reale corrotto |
| Future schema protetto | PASS | Suite: raw preservato, nessun overwrite |
| Storage negato / quota / flush successivo | PASS | Suite repository e controller, warning di presentazione; non alterate policy del browser |
| Purchase ledger / reward idempotency | PASS | Suite completa e reload offline senza nuovi premi |
| Saldo mai negativo / fondi insufficienti | PASS | Suite quote/settlement; Negozio reale mostra deficit e blocca azione |
| Bundle parzialmente posseduto / retry transazione | PASS | Suite store e audit tutte le ownership; non nuovo acquisto bundle manuale2Q |
| Acquisto multitab concorrente | PASS | Suite coordinatore Web Locks/fallback e ingredienti; UI conferma propagazione saldo |
| Offline purchase | PASS | Server spento: Sottobosco100, saldo165→65, altra scheda65 |
| Sette ricette / dipendenze proprietà | PASS | Catalogo/audit/simulazione49casi e Ricettario UI con tutte sette |
| Near / success / perfect | PASS | Suite e simulatore; UI offline SUCCESS117/120, 97,5% |
| Prima completion / perfect / cinque ricette / duplicati | PASS | Suite mastery/goals congelata; completion+primo goal anche UI offline |
| Offline round / ricette / reload | PASS | Server realmente irraggiungibile: score 4119, +81 XP/+29 monete; saldo94 e XP669 conservati in entrambe le schede |
| Manifest / icone / scope / start_url / standalone | PASS | Output e PNG192/512; metadati fase 0 corretti |
| Installabilità Chrome | PASS | Evento beforeinstallprompt osservato sulle build, secure loopback e worker attivo |
| Installazione OS e avvio da icona installata | NOT TESTED | Interfaccia installazione nativa non collegata; procedura manuale sotto |
| Warm offline e scena pronta | PASS | Shell+scena già visitata disponibili dopo arresto server |
| Primo accesso cold senza rete | PASS | Caso dichiarato non supportato: origine mai visitata localhost mostra errore chiaro del browser, nessuna falsa promessa di cache |
| Aggiornamento SW fra due build | PASS | d14b2181971f4c4a→e2c6aca9b2803142; waiting, vecchio client coerente, chiusura/riapertura, vecchie cache rimosse, profilo conservato |
| Tastiera e focus dialoghi | PASS | Tab/Spazio/Invio, schede frecce, conferma e Esc annidato, focus ritorna all’acquisto; guide/Aiuto da2P e suite |
| Semantica accessibile | PASS | Un main/un h1, nomi button, stato ingrediente, XP/mix progressbar, dialoghi/tabpanel, prezzi/requisiti/stati testuali |
| Screen reader reale | NOT TESTED | Nessuna sessione SR controllabile collegata; audit DOM/AX non sostituisce lettura vocale |
| Tablet fisico / touch / gesti OS | NOT TESTED | Nessun tablet collegato; checklist sotto |
| Responsive1280×800/1024×768/768×1024/390×844/320×640 | PASS | 20 combinazioni quattro schede, dimensioni renderer verificate e assestamento completato; dati allegati |
| Target e scroll dialoghi/result | PASS | Target secondari min44 px,48 px a390/320; overflow orizzontale0, dialoghi raggiungibili, result scroll presente |
| Safe-area / rotazione fisica / tastiera mobile | NOT TESTED | CSS env/svh preservato; resize desktop testato, inset fisici non simulati |
| Reduced motion OS / vestibolare su device | NOT TESTED | Nessun cambio impostazione OS; suite e anteprima2P restano valide |
| Performance initial load / byte / richieste / CLS / long task | PASS | Misure indicative in performance.json; limiti e osservazione MEDIUM nel report |
| Soak memoria/DOM20 round | PASS | DOM idle162, risultati169–175, heap variabile5,4–15,5MB; nessuna certificazione leak-free |
| Profilo memoria GPU / listener browser completi | NOT TESTED | Strumenti heap/GPU dedicati non collegati |
| Console applicazione | PASS | Nessun uncaught/rejection/React warning/errore asset applicativo osservato; log estensione Zotero separati |
| Nessun traffico esterno nella produzione | PASS | Risorse osservate solo loopback; font/CDN assenti; helper di misura locale escluso dall’artefatto |
| No source/master/reference/DEV in dist | PASS | Allowlists build e production boundary tests |
| Secret evidenti / percorsi Windows / sink HTML | PASS | Scan output e sorgenti; nessun nuovo input/import/export; non penetration test |
| Artefatto candidato riproducibile e hash | PASS | Build-manifest78 file, ZIP locale, nessun deploy o pubblicazione |
| Edge Chromium | NOT TESTED | Non disponibile fra browser collegati |
| Safari / iPadOS / Android tablet | NOT TESTED | Nessun device/browser collegato; non dichiarati compatibili sulla base di Chrome desktop |

## Collaudo tablet fisico da eseguire

Usare un’origine di test separata. Annotare device, OS, versione browser, versione RC e risultato PASS/FAIL per ogni riga; non utilizzare un salvataggio importante per prove distruttive.

1. Aprire online landscape, leggere guida, saltarla, riaprirla da Aiuto. Nessun testo tagliato o comando coperto; verificare notch/safe-area.
2. Tocco breve e doppio tap su bottiglia, Ice, Garnish e Servi: una sola azione consentita; nessuno zoom o selezione indesiderata.
3. Tenere Versa per2secondi, trascinare il dito fuori e rilasciare: quantità smette di aumentare. Ripremere: nuovo avvio previsto. Ripetere Agita.
4. Con un dito su Versa toccare Agita con l’altro: nessuna seconda azione né furto focus/capture. Rilasciare in ordini diversi.
5. Durante hold ruotare, aprire cambio app, mandare in background e tornare; ripetere interruzione gesto OS. Nessun controllo rimane premuto.
6. Giocare con due Ice, Agita, Garnish e Servi; leggere risultato, scroll fino a premi e Nuovo drink. Provare capacità ed esplosione senza modificare tuning.
7. Cambiare mensola, scorrere Shop/Ricette/Collezione/Aiuto in entrambe le orientazioni. Verificare target minimi, niente overflow, chiusura sempre raggiungibile.
8. Aprire e annullare acquisto, poi comprare con monete guadagnate e cambiare equip; reload conserva saldo, proprietà e loadout. Se tastiera esterna presente, percorso completo Tab/Spazio/Invio/Esc.
9. Installare mediante l’interfaccia del browser supportato; avviare dall’icona, verificare standalone, orientamento, icona e scope. Non dedurre il supporto iOS dall’evento Chrome.
10. Attendere Pronto anche offline, visitare seconda mensola e superfici desiderate; chiudere, disattivare rete e riaprire. Round, shop/acquisto, ricetta e reload conservano dati. Immagini mai cacheate possono usare fallback.
11. Riconnettere, aprire build successiva di prova mantenendo il vecchio client; chiudere tutte le schede/finestre standalone e riaprire: nuova versione, nessuna perdita né duplicazione premi.

## Collaudo screen reader da eseguire

Con Narrator/NVDA oppure VoiceOver/TalkBack realmente attivo, registrare prodotto/versione e PASS/FAIL, senza limitarsi al DOM:

1. Raggiungere main e titoli; ascoltare ingrediente selezionato, quantità, ragione dei comandi disabilitati e modalità hold. Con attivazione SR breve verificare il comportamento effettivo, senza dichiarare che equivalga a un hold prolungato.
2. Preparare un giro; verificare annuncio sensato di fase, risultato, XP/monete e avanzamento progressbar, senza lettura continua dei tick.
3. Aprire Collezione e navigare quattro schede; ascoltare selezione, proprietà/equip, prezzi/deficit/gate e requisiti ricetta. Dialogo principale non lascia focus nei comandi del gioco.
4. Conferma acquisto annidata: nome/descrizione corretti, Annulla/Conferma, Esc chiude solo il livello interno e restituisce focus al trigger; alla chiusura principale tornare a Collezione.
5. Verificare annunci di acquisto/equip, success/error e warning di storage mediante ambiente di test appropriato; leggere Aiuto e riaprire/saltare guida.
6. Completare tutto anche a 320 px e con ingrandimento testo del device. Annotare qualunque perdita di focus o informazione come issue, con severità.

## Gate di rilascio

Nessun BLOCKER/HIGH confermato aperto. RC pronta per il collaudo device, con NOT TESTED espliciti e osservazioni MEDIUM/LOW nel report. Ripetere i controlli interessati dopo ogni fix; non promuovere a release pubblica dichiarando certificazioni mancanti.
