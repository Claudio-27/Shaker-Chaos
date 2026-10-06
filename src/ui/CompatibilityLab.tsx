import { useMemo, useState } from 'react';
import type { GameDependencies } from '../application/game.ts';
import { totalVolumeUnits } from '../domain/mix.ts';
import { emptyResearchCase } from '../research/caseModel.ts';
import type { ObservableResult, ResearchCase } from '../research/caseModel.ts';
import { appendManualAction, timelineFromHistory } from '../research/manualSequence.ts';
import type { ManualAction } from '../research/manualSequence.ts';
import { decodeResearchCase, encodeResearchCase, parseResearchCase } from '../research/fixtureCodec.ts';
import { runCase } from '../research/caseRunner.ts';
import { generateCaseSeries } from '../research/caseSeries.ts';
import './CompatibilityLab.css';

const number = (text: string, label: string) => {
  if (!/^\d+$/.test(text.trim())) throw new Error(label + ': inserire un intero non negativo');
  const value = Number(text);
  if (!Number.isSafeInteger(value)) throw new Error(label + ': intero fuori intervallo');
  return value;
};
export default function CompatibilityLab({ dependencies }: { readonly dependencies: GameDependencies }) {
  const [item, setItem] = useState<ResearchCase>(emptyResearchCase);
  const [cursorMs, setCursorMs] = useState(0);
  const [meta, setMeta] = useState({ id: 'new-case', title: 'Nuovo caso', purpose: 'Da definire', notes: '' });
  const [ingredientId, setIngredientId] = useState(dependencies.ingredientIds[0] ?? '');
  const [units, setUnits] = useState('12'), [pourDuration, setPourDuration] = useState(''), [ticks, setTicks] = useState('');
  const [ice, setIce] = useState('1'), [garnishId, setGarnishId] = useState(dependencies.garnishIds[0] ?? '');
  const [shakeDurations, setShakeDurations] = useState('800,800,800'), [waitMs, setWaitMs] = useState('0');
  const [seriesKind, setSeriesKind] = useState<'quantity' | 'shake-duration'>('quantity');
  const [seriesValues, setSeriesValues] = useState('1,2,3,4,5');
  const [series, setSeries] = useState<readonly ResearchCase[]>([]);
  const [json, setJson] = useState(''), [message, setMessage] = useState('');
  const [observation, setObservation] = useState({ score: '', tier: '', reactionId: '', exploded: '', phase: '',
    source: '', date: '', build: '', procedure: '', repetitions: '1' });
  const [status, setStatus] = useState<ResearchCase['status']>('UNVERIFIED');
  const [confidence, setConfidence] = useState<ResearchCase['confidence']>('low');
  const [validatedInput, setValidatedInput] = useState(false);
  const run = useMemo(() => runCase(item, dependencies.mixingRules, dependencies.scoringEngine), [item, dependencies]);
  const state = run.input.projection.state;
  const guard = (work: () => void) => { try { work(); } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); } };
  const withMeta = () => parseResearchCase({ ...item, ...meta }, dependencies.mixingRules);
  const clearObservedForm = () => {
    setObservation({ score: '', tier: '', reactionId: '', exploded: '', phase: '', source: '', date: '', build: '', procedure: '', repetitions: '1' });
    setStatus('UNVERIFIED'); setConfidence('low'); setValidatedInput(false);
  };
  const append = (actions: readonly ManualAction[]) => guard(() => {
    let timeline = { ...timelineFromHistory(item.inputSequence, dependencies.mixingRules), cursorMs };
    for (const action of actions) timeline = appendManualAction(timeline, action);
    const next = parseResearchCase({ ...emptyResearchCase(), ...meta, inputSequence: timeline.session.history }, dependencies.mixingRules);
    setItem(next); setCursorMs(timeline.cursorMs); setSeries([]); clearObservedForm();
    setMessage('Eventi aggiunti. Evidenze del precedente input rimosse; cronologia e reset restano conservati.');
  });
  const load = (next: ResearchCase) => {
    setItem(next); setCursorMs(next.inputSequence.at(-1)?.atMs ?? 0);
    setMeta({ id: next.id, title: next.title, purpose: next.purpose, notes: next.notes }); clearObservedForm();
    setMessage('Caso caricato e validato; nessuna modifica al gioco normale o allo scoring.');
  };
  const recordObservation = () => guard(() => {
    const observed: { -readonly [K in keyof ObservableResult]: ObservableResult[K] } = {};
    if (observation.score.trim()) {
      const value = Number(observation.score);
      if (!Number.isFinite(value)) throw new Error('Score osservato non valido');
      observed.score = value;
    }
    if (observation.tier.trim()) observed.reactionTier = observation.tier.trim();
    if (observation.reactionId.trim()) observed.reactionId = observation.reactionId.trim();
    if (observation.exploded) observed.exploded = observation.exploded === 'true';
    if (observation.phase.trim()) observed.phase = observation.phase.trim();
    const evidenceFields = [observation.source, observation.date, observation.build, observation.procedure];
    const anyEvidence = evidenceFields.some(value => value.trim());
    if (anyEvidence && !evidenceFields.every(value => value.trim())) throw new Error('Completare fonte, data, build e procedura');
    const evidence = anyEvidence ? [{ id: meta.id + '-manual-1', scope: 'reference-manual' as const,
      source: observation.source, date: observation.date, referenceBuild: observation.build, procedure: observation.procedure,
      repetitions: number(observation.repetitions, 'Ripetizioni') }] : [];
    const next = parseResearchCase({ ...withMeta(), origin: 'REFERENCE', observedReferenceResult: observed, status, confidence, evidence,
      inputValidation: { status: validatedInput ? 'VERIFIED' : 'UNVERIFIED', evidenceIds: validatedInput ? evidence.map(e => e.id) : [],
        notes: validatedInput ? 'Input validato esplicitamente dal ricercatore; vedere procedura ed evidenze.' : 'Input non ancora validato sul riferimento.' } }, dependencies.mixingRules);
    setItem(next); setMessage('Osservazione registrata SOLO come dato di ricerca. Nessuna promozione allo scoring.');
  });
  const generate = () => guard(() => {
    const values = seriesValues.split(',').map(value => number(value, 'Valore sweep'));
    const next = generateCaseSeries(withMeta(), { kind: seriesKind, values, ingredientId }, dependencies.mixingRules);
    setSeries(next); setJson(JSON.stringify(next, null, 2) + '\n'); setMessage(next.length + ' candidati UNVERIFIED, senza osservazioni ereditate.');
  });
  const exportCase = () => guard(() => {
    const next = withMeta(); setItem(next); setJson(encodeResearchCase(next, dependencies.mixingRules)); setMessage('JSON pronto per copia e revisione nel repository.');
  });
  const importCase = () => guard(() => {
    const value: unknown = JSON.parse(json);
    if (Array.isArray(value)) {
      if (!value.length || value.length > 100) throw new Error('Importare 1..100 casi');
      const next = value.map(entry => parseResearchCase(entry, dependencies.mixingRules)); setSeries(next); load(next[0]!);
    } else { load(decodeResearchCase(json, dependencies.mixingRules)); setSeries([]); }
  });
  const shakes = state.shakes;
  return <section className="compat-lab" aria-label="Compatibility Lab" data-lab-marker="COMPATIBILITY_LAB_DEV_ONLY">
    <h2>Compatibility Lab · solo sviluppo</h2>
    <p><strong>DEMO / NOT REFERENCE-VERIFIED</strong> · tempo virtuale: {cursorMs} ms. Questa sessione è indipendente dal gioco sottostante.</p>
    <p>Preserve information until research proves it irrelevant. Quantità in VolumeUnit, senza conversione ml. Tick distribuiti sinteticamente; non sono osservazioni del riferimento.</p>
    <fieldset><legend>Identità del caso</legend><div className="compat-fields">
      {(['id', 'title', 'purpose', 'notes'] as const).map(key => <label key={key}>{key}<input value={meta[key]} onChange={e => setMeta({ ...meta, [key]: e.target.value })} /></label>)}
    </div></fieldset>
    <fieldset><legend>Sequenza controllata</legend>
      <div className="compat-fields">
        <label>Ingrediente logico / content ID<input list="compat-ingredient-ids" value={ingredientId} onChange={e => setIngredientId(e.target.value)} /><datalist id="compat-ingredient-ids">{dependencies.ingredientIds.map(id => <option key={id} value={id} />)}</datalist></label>
        <label>Quantità VolumeUnit<input inputMode="numeric" value={units} onChange={e => setUnits(e.target.value)} /></label>
        <label>Durata pour ms (opzionale)<input inputMode="numeric" value={pourDuration} onChange={e => setPourDuration(e.target.value)} placeholder="omessa = 0 sintetico" /></label>
        <label>Tick pour (opzionale)<input inputMode="numeric" value={ticks} onChange={e => setTicks(e.target.value)} placeholder="omessi = 1 sintetico" /></label>
        <button type="button" onClick={() => guard(() => append([{ type: 'pour', ingredientId, units: number(units, 'VolumeUnit'),
          ...(pourDuration.trim() ? { durationMs: number(pourDuration, 'Durata pour') } : {}), ...(ticks.trim() ? { ticks: number(ticks, 'Tick pour') } : {}) }]))}>Aggiungi pour</button>
      </div>
      <div className="compat-fields">
        <label>Ghiaccio richiesto<input inputMode="numeric" value={ice} onChange={e => setIce(e.target.value)} /></label>
        <button type="button" onClick={() => guard(() => append([{ type: 'ice', units: number(ice, 'Ghiaccio') }]))}>Aggiungi ghiaccio</button>
        <label>Guarnizione logica ID<input value={garnishId} onChange={e => setGarnishId(e.target.value)} /></label>
        <button type="button" onClick={() => append([{ type: 'garnish', garnishId: garnishId.trim() || null }])}>Imposta guarnizione</button>
      </div>
      <div className="compat-fields">
        <label>Durate di ogni shake ms, separate da virgola<input value={shakeDurations} onChange={e => setShakeDurations(e.target.value)} /></label>
        <button type="button" onClick={() => guard(() => {
          const values = shakeDurations.split(',');
          if (values.length > 100) throw new Error('Massimo 100 shake per operazione di laboratorio');
          append(values.map(value => ({ type: 'shake', durationMs: number(value, 'Durata shake') })));
        })}>Aggiungi shake</button>
        <label>Pausa virtuale ms<input inputMode="numeric" value={waitMs} onChange={e => setWaitMs(e.target.value)} /></label>
        <button type="button" onClick={() => guard(() => append([{ type: 'wait', durationMs: number(waitMs, 'Pausa') }]))}>Avanza tempo</button>
        <button type="button" onClick={() => append([{ type: 'serve' }])}>Registra Serve</button>
        <button type="button" onClick={() => append([{ type: 'reset' }])}>Registra Reset</button>
        <button type="button" onClick={() => { load(emptyResearchCase()); setSeries([]); }}>Nuovo caso vuoto</button>
      </div>
      <p>Ogni click è un'operazione completa. Shake 800,800,800 crea tre operazioni, totale richiesto 2400 ms. Reset pulisce il tentativo e conserva la storia precedente. La cronologia può descrivere anche azioni che la UI demo blocca.</p>
    </fieldset>
    <div className="compat-state">
      <article><h3>Proiezione demo corrente</h3>
        <dl><dt>Fase</dt><dd>{state.phase}</dd><dt>Volume applicato</dt><dd>{totalVolumeUnits(state.mix)} VolumeUnit</dd>
          <dt>Ghiaccio / guarnizione</dt><dd>{state.mix.iceUnits} / {state.mix.garnishId ?? 'nessuna'}</dd>
          <dt>Shake nel tentativo</dt><dd>{shakes.length}</dd>
          <dt>Durate richieste per shake</dt><dd>{shakes.map(op => op.requestedDurationMs).join(', ') || 'nessuna'} ms</dd>
          <dt>Durate trascorse per shake</dt><dd>{shakes.map(op => op.elapsedMs ?? 'aperta').join(', ') || 'nessuna'} ms</dd>
          <dt>Cumulativa richiesta / applicata</dt><dd>{shakes.reduce((sum, op) => sum + BigInt(op.requestedDurationMs), 0n).toString()} / {state.mix.shakeDurationMs} ms</dd>
          <dt>Score demo / reazione demo</dt><dd>{run.result.score} / {run.result.maximum} · {run.result.reactionTier}</dd>
          <dt>Tier meccanico del riferimento</dt><dd>{run.result.mechanicalReactionTierId ?? 'UNKNOWN — nessuna mappatura verificata'}</dd></dl>
        <pre aria-label="MixState derivato">{JSON.stringify(state.mix, null, 2)}</pre>
        <pre aria-label="Breakdown demo">{JSON.stringify(run.result.breakdown, null, 2)}</pre>
      </article>
      <article><h3>REFERENCE OBSERVATION vs CURRENT IMPLEMENTATION</h3>
        <p>Stato evidenza: <strong>{item.status}</strong> · confidenza: {item.confidence} · input: {item.inputValidation.status}</p>
        <strong className="compat-comparison" role="status">{run.comparison.status}</strong>
        <table><thead><tr><th>Campo osservato</th><th>Riferimento</th><th>Implementazione</th><th>Esito</th></tr></thead><tbody>
          {run.comparison.fields.map(row => <tr key={row.field}><td>{row.field}</td><td>{JSON.stringify(row.observed)}</td><td>{row.current === undefined ? 'UNKNOWN' : JSON.stringify(row.current)}</td><td>{row.status}</td></tr>)}
        </tbody></table>
        <p>I campi non osservati non vengono confrontati. MATCH descrive solo i campi noti, non certifica compatibilità.</p>
      </article>
    </div>
    <details open><summary>Cronologia canonica completa · {item.inputSequence.length} eventi</summary><pre aria-label="Cronologia canonica">{JSON.stringify(item.inputSequence, null, 2)}</pre></details>
    <details><summary>Operazioni, tick richiesti/applicati e tentativo corrente</summary><pre>{JSON.stringify(run.input, null, 2)}</pre></details>
    <fieldset><legend>Osservazione manuale del riferimento</legend><div className="compat-fields">
      <label>Score osservato (facoltativo)<input value={observation.score} onChange={e => setObservation({ ...observation, score: e.target.value })} /></label>
      <label>Tier meccanico osservato<input value={observation.tier} onChange={e => setObservation({ ...observation, tier: e.target.value })} placeholder="label logica libera" /></label>
      <label>Identità reazione osservata<input value={observation.reactionId} onChange={e => setObservation({ ...observation, reactionId: e.target.value })} /></label>
      <label>Esplosione osservata<select value={observation.exploded} onChange={e => setObservation({ ...observation, exploded: e.target.value })}><option value="">Non osservata</option><option value="false">false</option><option value="true">true</option></select></label>
      <label>Fase osservata<input value={observation.phase} onChange={e => setObservation({ ...observation, phase: e.target.value })} /></label>
      {(['source', 'date', 'build', 'procedure', 'repetitions'] as const).map(key => <label key={key}>{({ source: 'Fonte evidenza', date: 'Data YYYY-MM-DD', build: 'Build del riferimento', procedure: 'Procedura e validazione input', repetitions: 'Ripetizioni osservate' })[key]}
        <input value={observation[key]} onChange={e => setObservation({ ...observation, [key]: e.target.value })} /></label>)}
      <label>Stato evidenza<select value={status} onChange={e => setStatus(e.target.value as ResearchCase['status'])}>{(['UNVERIFIED', 'STRONGLY_SUPPORTED', 'VERIFIED'] as const).map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Confidenza<select value={confidence} onChange={e => setConfidence(e.target.value as ResearchCase['confidence'])}>{(['low', 'medium', 'high'] as const).map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="compat-check"><input type="checkbox" checked={validatedInput} onChange={e => setValidatedInput(e.target.checked)} />Input esatto validato indipendentemente sul riferimento</label>
      <button type="button" onClick={recordObservation}>Registra osservazione di ricerca</button>
    </div><p>Nessun campo è precompilato come evidenza reale. VERIFIED richiede osservazione, fonte, data, build, procedura e input validato; una dichiarazione del ricercatore deve comunque essere revisionata. Esportare le ripetizioni con ID distinti.</p></fieldset>
    <fieldset><legend>Serie per ricerca dei confini</legend><div className="compat-fields">
      <label>Tipo sweep<select value={seriesKind} onChange={e => setSeriesKind(e.target.value as typeof seriesKind)}><option value="quantity">Quantità</option><option value="shake-duration">Durata shake</option></select></label>
      <label>Valori sweep separati da virgola<input value={seriesValues} onChange={e => setSeriesValues(e.target.value)} /></label>
      <button type="button" onClick={generate}>Genera serie</button>
      <button type="button" onClick={() => setSeriesValues(Array.from({ length: 10 }, (_, index) => index + 1).join(','))}>Prepara quantità 1…10</button>
      <button type="button" onClick={() => setSeriesValues('5800,5900,5950,5990,6000,6010,6050,6100')}>Prepara durate candidate</button>
    </div><p>Il caso corrente è la base; usare una base senza Serve. Massimo 100 candidati. Nessuna soglia di riferimento è implicata dai valori d'esempio.</p>
      {series.length > 0 && <label>Caso della serie<select value="" onChange={e => { const next = series.find(c => c.id === e.target.value); if (next) load(next); }}><option value="">Seleziona candidato</option>{series.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>}
    </fieldset>
    <fieldset><legend>Fixture JSON · revisione e versionamento manuali</legend><div className="compat-fields">
      <button type="button" onClick={exportCase}>Esporta caso JSON</button>
      <button type="button" onClick={importCase}>Importa JSON</button>
      <button type="button" disabled={!json} onClick={() => { void navigator.clipboard.writeText(json).then(() => setMessage('JSON copiato.'), () => setMessage('Clipboard non disponibile: selezionare il testo JSON e copiarlo manualmente.')); }}>Copia JSON</button>
    </div><label>Fixture JSON<textarea rows={12} value={json} onChange={e => setJson(e.target.value)} spellCheck={false} /></label>
      <p>Importa un caso oppure un array di casi. Nessun salvataggio automatico, richiesta remota o promozione in produzione.</p>
    </fieldset>
    <p className="compat-message" role="alert">{message}</p>
  </section>;
}
