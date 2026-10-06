import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { resolveAsset } from '../content/visualPlan.ts';
import type { AssetId, VisualCatalog, VisualSequence } from '../content/visualModel.ts';

const VisualContext = createContext<VisualCatalog | null>(null);
export function VisualAssetsProvider({ catalog, children }: { readonly catalog: VisualCatalog; readonly children: ReactNode }) {
  return <VisualContext.Provider value={catalog}>{children}</VisualContext.Provider>;
}
export function AssetImage({ assetId, className = '', alt = '', style, priority = 'auto' }: {
  readonly assetId: AssetId; readonly className?: string; readonly alt?: string;
  readonly style?: CSSProperties; readonly priority?: 'high' | 'low' | 'auto';
}) {
  const catalog = useContext(VisualContext);
  if (!catalog) throw new Error('Visual assets require an explicit catalog');
  const asset = resolveAsset(catalog, assetId);
  return <img src={`${import.meta.env.BASE_URL}${asset.path}`} width={asset.width} height={asset.height}
    className={`asset-image ${className}`} alt={alt} draggable={false} decoding="async" fetchPriority={priority} style={style} />;
}

/** Decorative playback only: no game callbacks, domain events, or completion gates. */
export function SequenceArt({ sequence, intro, motion, className = '' }: {
  readonly sequence: VisualSequence; readonly intro?: VisualSequence;
  readonly motion: NonNullable<VisualSequence['motion']>; readonly className?: string;
}) {
  const [frame, setFrame] = useState(0);
  const frames = useMemo(() => [
    ...(intro?.frames ?? []).map((assetId) => ({ assetId, duration: intro!.frameDurationMs })),
    ...sequence.frames.map((assetId) => ({ assetId, duration: sequence.frameDurationMs })),
  ], [sequence, intro]);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReduced(preference.matches);
    preference.addEventListener('change', changed);
    return () => preference.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    if (reduced || frames.length < 2) return;
    let position = 0;
    let timer: number;
    const advance = () => {
      position++;
      if (position >= frames.length) {
        if (sequence.loop) position = intro?.frames.length ?? 0;
        else return;
      }
      setFrame(position);
      timer = window.setTimeout(advance, frames[position]!.duration);
    };
    timer = window.setTimeout(advance, frames[0]!.duration);
    return () => window.clearTimeout(timer);
  }, [frames, sequence.loop, intro, reduced]);
  const current = frames[reduced ? frames.length - 1 : Math.min(frame, frames.length - 1)];
  if (!current) return null;
  return <div className={`sequence-art ${className}`} data-motion={reduced ? 'none' : motion}>
    <AssetImage assetId={current.assetId} priority="high" />
  </div>;
}