import * as stage from './classicStageLayout.ts';
import { BACKGROUND_FRAMING, visualPlacement } from './classicVisualFraming.ts';
/** References the authoritative 2E/2F constants; never a second layout configuration. */
export const CLASSIC_STAGE_CONTRACT = Object.freeze({
  policy: 'CLASSIC STAGE GEOMETRY LOCKED AFTER PHASE 2H',
  width: stage.STAGE_WIDTH, height: stage.STAGE_HEIGHT,
  zones: Object.freeze({ safe: stage.SAFE_BOUNDS, bottles: stage.BOTTLE_SHELF_BOUNDS, bartender: stage.BARTENDER_BOUNDS, counter: stage.COUNTER_BOUNDS, mixing: stage.MIXING_BOUNDS, message: stage.MESSAGE_PANEL_BOUNDS, hud: stage.HUD_BOUNDS }),
  controls: stage.PRIMARY_BUTTON_BOUNDS, layers: stage.STAGE_LAYERS,
  background: BACKGROUND_FRAMING,
  bartenderVisible: visualPlacement('bartender.b01.idle','bartender'),
  counterVisible: visualPlacement('counter.c01.surface','counter'),
});
