# Phase 2B — esperienza giocatore e rifinitura

Data: 2026-10-13. Shaker-Chaos originale. Ricerca fase 1 chiusa. Nessuna fase successiva iniziata.

1. **Git:** main verificato prima di modificare; fase 2A già committata dall’utente in b5bf866, worktree inizialmente pulito. HEAD conservato. Nessun lavoro estraneo scartato.
2. **Tappe:** Miscela → Agita → Servi → Assaggio, indicatore corrente e ✓ delle tappe precedenti. Testi brevi spiegano il passo disponibile.
3. **Ingredienti:** selezione più evidente del hover, bordo interno e ✓; nomi/ID originali immutati e separati dalla skin. La rotazione decorativa non sposta la hitbox.
4. **Pour:** hold marcato e “Si prepara…” immediato; browser osservato con hold attivo, bottiglia preparing e volume precedente intatto. Stream soltanto dopo tick applicati. Tap breve senza liquido; tastiera Spazio/Invio; stop automatico a pieno verificati.
5. **Gauge:** esterno, numeri 123 / 240, composizione cromatica e transizione verso quantità canonica in 100ms, senza overshoot. Reset rimonta fill vuoto; nessuna maschera nel PNG e nessuna equivalenza ml inventata.
6. **Ice:** icone esterne 0/1/2, cue accettato e conteggio nel controllo. A 2/2 il controllo è aria-disabled; un ulteriore click in mixing mostra il limite senza dispatch al dominio. Il test browser ha usato click forzato perché Playwright rispetta aria-disabled. Fuori mixing è nativamente disabled.
7. **Garnish:** unavailable prima di Shake, disponibile dopo completamento positivo e rilascio, pop dell’agrume esistente, ✓ e disabilitazione dopo accettazione unica.
8. **Shake:** stato premuto, oscillazione CSS e rilascio esplicito. Nessun tempo deriva dall’animazione.
9. **Rischio:** safe/warming/risky/danger derivati dal profilo. Oggi count 3/4/5 e durata 3000/4000/6000ms; soglie della sola UI. Quinto hold mostra avviso testuale/iconico evidente, senza countdown tecnico.
10. **Failure:** burst/ring/oscillazione originali CSS, rough, zero score/breakdown e Nuovo drink. Sesto start e hold oltre 8s verificati nella produzione; nessun controllo di preparazione rimane attivo.
11. **Pose:** idle durante mixing, tasting dopo Serve, poi artwork rough/balanced/excellent dal mapping esistente. Asset e slot ambiente/banco/effetto rimangono indipendenti. Nessun artwork nuovo.
12. **Assaggio:** 650ms nominali prima dello score, più 180ms fino alla reazione e 220ms fino al breakdown: totale 1050ms. Callback eventualmente tardivi non ritardano il completamento di dominio.
13. **Reveal:** tasting → score → reaction → breakdown. Score congelato subito a Serve; timer esclusivamente di presentazione. Skip, reduced-motion e failure mostrano subito tutto; generazione/cleanup neutralizzano callback vecchi e fuori ordine.
14. **Result card:** score grande /10000, titolo, Ingredienti/Ghiaccio/Guarnizione/Agitazione secondari. Wrapping e spazio per titoli lunghi; non si mostra un falso score live durante la preparazione.
15. **Nuovo giro:** Nuovo drink primario sul risultato, Reset secondario in preparazione e disabilitato a tentativo vuoto. Guard contro burst duplicati. Test di Reset durante/dopo reveal, durante hold e dopo failure; ritorno del focus su Versa.
16. **Copy:** content/playerExperience.ts centralizza nove dialoghi, indicazioni e tempi di reveal. Override parziale facoltativo per bartender, senza cambiare tier/artwork/score. Titoli del profilo 2A conservati.
17. **Nove reazioni:** tabella seguente; nessuna battuta copiata dal riferimento. Failure conserva la distinta copy di fallimento 2A.
18. **Accessibilità:** nomi dei comandi, aria-pressed per hold/selezione/agrume, aiuto tastiera, stati/avvisi leggibili oltre il colore, progressbar canonica e focus visibile. Focus su Agita al pieno, Servi dopo agrume, skip durante assaggio e titolo al reveal. Target minimi misurati 46px landscape/portrait, 48px mobile; contrasto dei testi secondari rafforzato. Nessun audit completo con screen reader fisico dichiarato.
19. **Reduced motion:** observer della preferenza browser e CSS, stop oscillazioni/transizioni/sparkles, reveal immediato. Nessun cambiamento di durata/quantità/score. API browser disponibile senza emulazione della media preference: testata checkbox DEV di anteprima, più observer/test unitari; nessuna modifica OS.
20. **Input:** pointerup/cancel/lost capture, blur/visibility/cleanup chiudono il hold, con flush dell’elapsed valido e invalidazione timer. Release esterno tramite drag verificato, held idle e nessuna crescita fantasma. Cattura fallita rilascia la proprietà.
21. **Multitouch:** proprietario unico condiviso tra Pour/Shake, claim prima di focus/capture, sorgente/ID esatti; secondo touch e non-primary respinti. Puntatore e tastiera non possono tenere due hold. Verifica sintetica, non tablet fisico.
22. **Responsive:** preparazione e risultato verificati a 1280×800, 1024×768, 768×1024, 390×844 e 320×640; zero overflow orizzontale. Tablet landscape prioritario, niente scaling uniforme; portrait/mobile possono scorrere. Nel layout 1024 più affollato il footer può richiedere un lieve scroll, senza tagliare i controlli.
23. **Performance:** CSS per stream/shake/fill/pop, tre timer di reveal, memo dei componenti visivi e confronti del mix soltanto sui dati visibili. Sampling canonico 25ms preservato: il root può renderizzare sui campioni Shake; non c’è un nuovo loop animation-frame React. Dipendenze identiche.
24. **Audio:** PresentationAudio cue/stop con implementazione silenziosa; pour, ice, shake, serve, resultPositive/resultNegative/failure. Nessun file o servizio audio, download o requisito di autoplay.
25. **Testi giocatore:** VolumeUnit, canonical, CompatibilityInput, reference observation, demo scorer e mechanicalReactionTierId assenti dai dati player e dal DOM normale verificato. Diagnostica tecnica soltanto DEV.
26. **Laboratori:** Asset Lab, Visual Debug, Compatibility Lab e Tuning Inspector caricano in DEV. Nuova diagnostica phase/pour/risk/result/reduced e checkbox di anteprima. Nessun nuovo caso/osservazione storica registrato. Query DEV nella produzione mostrano zero laboratori; audit del bundle rifiuta anche i nuovi testi diagnostici.
27. **Offline:** shell 7 file, 42 path pubblici ammessi on demand, zero artwork precached; scena attuale scalda 14 path critici. Preview spento, reload con immagini valide e giro Serve/Reset funzionante. Cache selettiva inalterata; pose/effetti mai visitati mantengono fallback idle previsto.
28. **Test:** 210/210, tutti i 188 precedenti conservati e 22 nuovi. Disponibilità controlli, max Ice/Garnish, Pour feedback, risk/failure/reset, score congelato/order/skip/reset/reduced/dispose, puntatori/focus/capture/sorgenti/interruzioni, observer, dialoghi/mapping/copy. Nessun test aggiunto solo per aumentare il conteggio.
29. **Controlli:** TypeScript strict, lint, tutti i test, build e audit produzione PASS; Git diff check PASS. Nessuna dipendenza aggiunta. Verifica SHA-256 di 703 file preservati (dominio, core/app/bootstrap/tuning/cataloghi, artwork, evidenze e tooling di ricerca, package/lock) contro snapshot iniziale: identici.
30. **Tablet fisici:** ancora da eseguire touch/multitouch reali, penna, orientamento, gestione sospensione/background e PWA installata. Browser emulato e test sintetici non certificano i dispositivi.
31. **Limiti di polish:** nomi dei bartender restano quelli del catalogo; le tre pose artistiche coprono nove tier attraverso testi distinti. Registrazione delle silhouette e banco dipinto nel fondale hanno i limiti già documentati. Nessun suono reale. Nessun bug bloccante emerso nei controlli eseguiti; animazioni più ricche, localizzazione e audit screen reader completo restano futuri.
32. **Proposta 2C:** solo su nuovo incarico, playtest tablet/PWA installata e accessibilità reale; correggere problemi emersi ed eventualmente aggiungere suoni originali alla porta già pronta. Valutare il tuning soltanto con evidenze di playtest del nostro gioco. Economia/progressione richiedono scopo separato.
33. **Ricerca:** nessun Ruffle/SWF, tooling nativo, ricerca web, osservazione del riferimento o riapertura fase 1.
34. **Rami:** nessun ramo creato o cambiato; main conservato.
35. **Pubblicazione:** nessun commit, push, PR, accesso GitHub o modifica remoti/storia. Solo comandi Git locali in lettura per stato/diff/HEAD.
36. **Consegna:** tutte le modifiche 2B restano non committate su main per revisione Changes in GitHub Desktop. Arresto dopo 2B. Prova visiva locale in work/phase2b-result.jpg, ignorata da Git.

## Titoli e dialoghi originali

| Tier | Titolo conservato | Dialogo nuovo |
| --- | --- | --- |
| disaster | Caos totale | Questo drink ha preso una strada tutta sua. Rimettiamolo in carreggiata! |
| awful | Esperimento audace | La bottiglia aveva un piano. Il bicchiere, evidentemente, un altro. |
| bad | Note in cerca di ritmo | Le note ci sono. Per adesso stanno suonando tre canzoni diverse. |
| rough | Un’idea da rifinire | C’è un’idea qui dentro. Un piccolo aggiustamento e torna il ritmo. |
| okay | Il mix prende forma | Si lascia bere! Il prossimo giro può avere ancora più carattere. |
| good | Un buon giro | Un buon mix: mi hai fatto venire voglia di un secondo sorso. |
| great | Bel carattere! | Ha personalità. Questo bicchiere sa già stare al bancone. |
| excellent | Il banco applaude | Le note ballano insieme. Io metto il bicchiere, tu il talento. |
| legendary | Il tuo colpo di scena | Fermi tutti: questo giro merita un brindisi tutto suo! |

## Smoke browser eseguiti

- Giro DEV con tre ingredienti e tastiera: 45/240, due Ice, cinque Shake, agrume; score 2614, rough. Preparazione/copy e quattro livelli di rischio osservati.
- Produzione: Pour a pieno 240/240 → un Shake → Serve = 8450, balanced; nuovo giro pieno + due Ice + Shake + agrume = 9550, excellent. Assaggio osservato prima del reveal, skip applicato e focus sul titolo.
- Produzione: sei hold distinti → failure immediata 0; nuovo giro, hold Shake oltre 8s → failure 0. Nuovo drink riapre correttamente il tentativo.
- Startup breve senza liquido; preparazione osservata durante hold con volume precedente 21 invariato; release fuori pulsante e Reset; cinque viewport, keyboard focus e target misurati.
- Offline: preview arrestato, reload con tutti gli artwork della scena validi, Pour/Shake/Serve, Nuovo drink durante tasting e verifica successiva senza timer fantasma. Query DEV assenti dalla produzione.
- DEV: laboratori storici presenti senza eseguire nuove prove di riferimento; reduced-motion preview e reveal immediato verificati. Browser non offre emulazione di prefers-reduced-motion; nessun test fisico dichiarato.

## Meccaniche preservate

240u; startup800ms per pressione;3u/125ms dopo startup; Ice500×2; garnish100 dopo Shake; bonus0/0/0/5/15/30; failure sesto start oppure8000ms cumulativi; cap10000; nove soglie e equazione originali 2A intatte. La storia resta canonica e completa. **Preserve information until research proves it irrelevant.** Le animazioni sono PRESENTATION STATE e non possono modificare DOMAIN STATE.

## Artefatti della build finale e ultimo smoke

Build finale: 50 moduli; index-CoQdZEx3.js 281,65kB (gzip87,31kB), index-D6aoO3e-.css23,66kB (gzip6,19kB); cache shell e6a1bd60ab5f41f2. Nessuna libreria nuova. Su origine localhost nuova, warmup completato, preview arrestato e reload riuscito; giro offline con12u → Shake → Serve → skip produce422/10000. Tutte le immagini valide, una reazione non visitata ripiega correttamente su idle. Server e schede aperti per la verifica sono stati chiusi; viewport ripristinato.
