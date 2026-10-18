import type { CSSProperties } from 'react';
import type { ImageAssetDefinition } from '../content/visualModel.ts';
import { visualPlacement } from './classicVisualFraming.ts';
/** New runtime bottles reuse the existing bottle frame, scaled from their measured alpha bounds. */
export function ingredientBottleStyle(id:string,asset:ImageAssetDefinition|undefined):CSSProperties|undefined {
  if(visualPlacement(id,'bottle')||!asset?.runtime)return;
  const reference=visualPlacement('ingredient.bottle01','bottle')!,alpha=asset.runtime.source.alpha,scale=reference.visible.height/alpha.height;
  const x=reference.centerX-alpha.width*scale/2-alpha.x*scale,y=reference.baseline-reference.visible.height-alpha.y*scale;
  return {'--art-left':'calc(var(--bottle-art-x) + '+x+'px)','--art-top':'calc(var(--bottle-art-y) + '+y+'px)','--art-width':asset.width*scale+'px','--art-height':asset.height*scale+'px'} as CSSProperties;
}
