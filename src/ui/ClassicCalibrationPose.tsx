import { AssetImage } from './AssetVisual.tsx';
/** Optional visual-only pose freeze for screenshot calibration. No events, scores or profile writes. */
export default function ClassicCalibrationPose() {
  const value = new URLSearchParams(window.location.search).get('classicPose') ?? '';
  if (!/^(b01|b02)\.(idle|tasting|rough|balanced|excellent)$/.test(value)) return null;
  return <div className="calibration-pose" data-calibration="CLASSIC_VISUAL_CALIBRATION_DEV_ONLY" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
    <style>{'.character-safe-area:has(.calibration-pose) > .character-body { visibility: hidden; }'}</style>
    <AssetImage assetId={`bartender.${value}`} framing="bartender" />
  </div>;
}
