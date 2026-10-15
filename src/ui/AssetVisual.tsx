import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { environmentBackground, optionalAsset, resolveAsset } from '../content/visualPlan.ts';
import type { AssetId, EnvironmentVisualDefinition, VisualCatalog, VisualSequence } from '../content/visualModel.ts';
import { runtimeCandidates } from '../content/runtimeVariants.ts';
import type { RasterDemand } from '../content/runtimeVariants.ts';
import { readRasterDemand } from '../platform/visualViewport.ts';
import { visualFramingStyle } from './classicVisualFraming.ts';
import type { VisualFraming } from './classicVisualFraming.ts';
const DemandContext = createContext<RasterDemand>({ scale: 1, canonical: true });
const VisualContext = createContext<VisualCatalog | null>(null);
export function VisualAssetsProvider({ catalog, children }: { readonly catalog: VisualCatalog; readonly children: ReactNode }) {
  const [demand, setDemand] = useState(readRasterDemand);
  useEffect(() => {
    let query: MediaQueryList;
    const update = () => { setDemand(readRasterDemand()); query?.removeEventListener('change', update); query = window.matchMedia('(resolution: ' + window.devicePixelRatio + 'dppx)'); query.addEventListener('change', update); };
    window.addEventListener('resize', update); update();
    return () => { window.removeEventListener('resize', update); query.removeEventListener('change', update); };
  }, []);
  return <VisualContext.Provider value={catalog}><DemandContext.Provider value={demand}>{children}</DemandContext.Provider></VisualContext.Provider>;
}
/** Fallback is presentation-only and never changes the saved environment/content ID. */
export function EnvironmentArt({ environment }: { readonly environment: EnvironmentVisualDefinition }) {
  const catalog = useContext(VisualContext);
  if (!catalog) throw new Error('Visual assets require an explicit catalog');
  const { preferred, legacy } = environmentBackground(catalog, environment);
  return <AssetImage key={preferred} assetId={preferred} fallback={legacy} className="environment-background" priority="high" optional />;
}
export function AssetImage({ assetId, fallback: suppliedFallback, lastResort, optional = false, className = '', alt = '', style, framing, priority = 'auto' }: {
  readonly assetId: AssetId; readonly fallback?: AssetId; readonly lastResort?: AssetId; readonly optional?: boolean; readonly className?: string;
  readonly alt?: string; readonly style?: CSSProperties; readonly framing?: VisualFraming; readonly priority?: 'high' | 'low' | 'auto';
}) {
  const catalog = useContext(VisualContext), demand = useContext(DemandContext);
  const [failedPaths, setFailedPaths] = useState<readonly string[]>([]);
  const [failed, setFailed] = useState<readonly AssetId[]>([]);
  if (!catalog) throw new Error('Visual assets require an explicit catalog');
  const fallback = suppliedFallback ?? (assetId.startsWith('environment.') ? Object.values(catalog.environments).find(environment => environment.backgroundClean === assetId)?.background : undefined);
  const preferred = optional || fallback ? optionalAsset(catalog, assetId, fallback) : assetId;
  const current = preferred && !failed.includes(preferred) ? preferred :
    fallback && !failed.includes(fallback) ? optionalAsset(catalog, fallback) :
    lastResort && !failed.includes(lastResort) ? optionalAsset(catalog, lastResort) : undefined;
  if (!current) return optional ? <span hidden data-asset-error={assetId} /> : <span className="asset-error" data-asset-error={assetId} role="img" aria-label="Artwork non disponibile">Artwork non disponibile</span>;
  const asset = resolveAsset(catalog, current);
  if (asset.runtime) {
    const candidates = runtimeCandidates(asset, demand), candidate = candidates.find(item => !failedPaths.includes(item.path));
    const crop = asset.runtime.crop;
    const sourcePreview = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('artSource') === '1';
    const href = sourcePreview ? '/__art-source/' + current + '.png' : candidate && import.meta.env.BASE_URL + candidate.path;
    const preserve = className.includes('environment-background') ? 'xMidYMid slice' : className.includes('counter-surface') ? demand.canonical ? 'xMidYMid meet' : 'xMidYMin slice' : framing === 'bartender' || className.includes('character-effect') ? 'xMidYMax meet' : 'xMidYMid meet';
    return <svg width={asset.width} height={asset.height} viewBox={` 0 0 ${asset.width} ${asset.height}`.trim()} preserveAspectRatio={preserve}
      data-visual-framing={framing && visualFramingStyle(current, framing) ? framing : undefined} data-asset-id={assetId} data-resolved-asset={current} data-fallback={current !== assetId ? 'true' : undefined}
      data-variant-fallback={candidate && candidate.path !== candidates[0]?.path ? 'true' : undefined} data-runtime-path={candidate?.path} data-runtime-width={candidate?.width} data-runtime-height={candidate?.height}
      className={'asset-image ' + className} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined} focusable="false"
      style={{ overflow: 'hidden', ...visualFramingStyle(current, framing), ...style }}>
      {href && <image href={href} x={sourcePreview ? 0 : crop.x} y={sourcePreview ? 0 : crop.y} width={sourcePreview ? asset.width : crop.width} height={sourcePreview ? asset.height : crop.height} preserveAspectRatio="none"
        onError={() => { if (candidate && !sourcePreview && candidates.some(item => item.path !== candidate.path && !failedPaths.includes(item.path))) setFailedPaths(previous => [...previous, candidate.path]); else setFailed(previous => [...previous, current]); }} />}
    </svg>;
  }
  return <img src={import.meta.env.BASE_URL + asset.path} width={asset.width} height={asset.height}
    data-visual-framing={framing && visualFramingStyle(current, framing) ? framing : undefined} data-asset-id={assetId} data-resolved-asset={current} data-fallback={current !== assetId ? 'true' : undefined}
    className={'asset-image ' + className} alt={alt} draggable={false} decoding="async" fetchPriority={priority} style={{ ...visualFramingStyle(current, framing), ...style }}
    onError={() => { setFailed((previous) => [...previous, current]); }} />;
}
/** Decorative playback only: no game callbacks, events, score inputs, or completion gates. */
export function SequenceArt({ sequence, intro, motion, fallback, lastResort, reducedMotion = false, className = '' }: {
  readonly sequence: VisualSequence; readonly intro?: VisualSequence; readonly fallback?: AssetId; readonly lastResort?: AssetId;
  readonly reducedMotion?: boolean; readonly motion: NonNullable<VisualSequence['motion']>; readonly className?: string;
}) {
  const [frame, setFrame] = useState(0);
  const frames = useMemo(() => [
    ...(intro?.frames ?? []).map((assetId) => ({ assetId, duration: intro!.frameDurationMs })),
    ...sequence.frames.map((assetId) => ({ assetId, duration: sequence.frameDurationMs })),
  ], [sequence, intro]);
  const reduced = reducedMotion;
  useEffect(() => {
    if (reduced || frames.length < 2) return;
    let position = 0, timer: number;
    const advance = () => {
      position++;
      if (position >= frames.length) { if (sequence.loop) position = intro?.frames.length ?? 0; else return; }
      setFrame(position); timer = window.setTimeout(advance, frames[position]!.duration);
    };
    timer = window.setTimeout(advance, frames[0]!.duration);
    return () => window.clearTimeout(timer);
  }, [frames, sequence.loop, intro, reduced]);
  const current = frames[reduced ? frames.length - 1 : Math.min(frame, frames.length - 1)];
  if (!current) return null;
  return <div className={'sequence-art ' + className} data-motion={reduced ? 'none' : motion}>
    <AssetImage assetId={current.assetId} {...(fallback ? { fallback } : {})} {...(lastResort ? { lastResort } : {})} priority="high" framing="bartender" />
  </div>;
}
