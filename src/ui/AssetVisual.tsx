import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { optionalAsset, resolveAsset } from '../content/visualPlan.ts';
import type { AssetId, VisualCatalog, VisualSequence } from '../content/visualModel.ts';
const VisualContext = createContext<VisualCatalog | null>(null);
export function VisualAssetsProvider({ catalog, children }: { readonly catalog: VisualCatalog; readonly children: ReactNode }) {
  return <VisualContext.Provider value={catalog}>{children}</VisualContext.Provider>;
}
export function AssetImage({ assetId, fallback, lastResort, optional = false, className = '', alt = '', style, priority = 'auto' }: {
  readonly assetId: AssetId; readonly fallback?: AssetId; readonly lastResort?: AssetId; readonly optional?: boolean; readonly className?: string;
  readonly alt?: string; readonly style?: CSSProperties; readonly priority?: 'high' | 'low' | 'auto';
}) {
  const catalog = useContext(VisualContext);
  const [failed, setFailed] = useState<readonly AssetId[]>([]);
  if (!catalog) throw new Error('Visual assets require an explicit catalog');
  const preferred = optional || fallback ? optionalAsset(catalog, assetId, fallback) : assetId;
  const current = preferred && !failed.includes(preferred) ? preferred :
    fallback && !failed.includes(fallback) ? optionalAsset(catalog, fallback) :
    lastResort && !failed.includes(lastResort) ? optionalAsset(catalog, lastResort) : undefined;
  if (!current) return optional ? <span hidden data-asset-error={assetId} /> : <span className="asset-error" data-asset-error={assetId} role="img" aria-label="Artwork non disponibile">Artwork non disponibile</span>;
  const asset = resolveAsset(catalog, current);
  return <img src={import.meta.env.BASE_URL + asset.path} width={asset.width} height={asset.height}
    data-asset-id={assetId} data-resolved-asset={current} data-fallback={current !== assetId ? 'true' : undefined}
    className={'asset-image ' + className} alt={alt} draggable={false} decoding="async" fetchPriority={priority} style={style}
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
    <AssetImage assetId={current.assetId} {...(fallback ? { fallback } : {})} {...(lastResort ? { lastResort } : {})} priority="high" />
  </div>;
}
