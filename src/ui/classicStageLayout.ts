/** Presentation only. Every rectangle is in the same 600 × 440 logical space. */
export interface StageBounds { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
const box = (x: number, y: number, width: number, height: number): StageBounds => Object.freeze({ x, y, width, height });
export const STAGE_WIDTH = 600, STAGE_HEIGHT = 440, GRID_STEP = 50;
export const CLASSIC_BREAKPOINT = Object.freeze({ width: 960, height: 480 });
export const SAFE_BOUNDS = box(8, 6, 584, 426);
export const HUD_BOUNDS = box(8, 6, 584, 30);
export const LEVEL_BOUNDS = box(14, 9, 56, 24), XP_BOUNDS = box(74, 9, 146, 24), COINS_BOUNDS = box(226, 9, 74, 24);
export const WARNING_BOUNDS = box(310, 7, 206, 26);
export const COLLECTION_BOUNDS = box(522, 7, 65, 26);
export const BOTTLE_SHELF_BOUNDS = box(18, 54, 380, 188);
export const BARTENDER_BOUNDS = box(390, 46, 202, 300);
export const BARTENDER_ANCHOR = Object.freeze({ x: 491, baseline: 346 });
export const COUNTER_BOUNDS = box(0, 286, 600, 154);
// 3:1 PNG: its transparent upper/lower margins stay outside the physical counter band.
export const COUNTER_ART_BOUNDS = box(0, 260, 600, 200);
export const MIXING_BOUNDS = box(230, 215, 125, 142);
export const SHAKER_BOUNDS = box(250, 224, 70, 112);
export const GLASS_BOUNDS = box(318, 262, 40, 70);
export const METER_BOUNDS = box(220, 238, 20, 90);
export const FILL_READOUT_BOUNDS = box(208, 330, 54, 18);
export const ICE_BOUNDS = box(350, 270, 48, 48);
export const GARNISH_BOUNDS = box(406, 270, 46, 48);
export const PRIMARY_BUTTON_BOUNDS = Object.freeze({ pour: box(22, 389, 106, 42), shake: box(154, 389, 106, 42), serve: box(288, 389, 106, 42) });
// Requested anchors and approximate visual boxes differ by 3px vertically. Both stay explicit.
export const PRIMARY_ACTION_ANCHORS = Object.freeze({ pour: { x: 75, y: 413 }, shake: { x: 207, y: 413 }, serve: { x: 341, y: 413 } });
export const RESET_BOUNDS = box(405, 403, 66, 27);
export const SKIP_BOUNDS = box(478, 403, 106, 27);
export const MESSAGE_PANEL_BOUNDS = box(402, 342, 190, 90);
export const STAGE_LAYERS = Object.freeze({ environment: 0, backBar: 10, bottles: 20, bartender: 30, counter: 40, mixing: 50, controls: 60, hud: 70, effects: 80, modal: 90, debug: 100 });
export const CSS_TARGET_MINIMUM = 44, MOBILE_TARGET_MINIMUM = 48;
export const classicLandscape = (width: number, height: number) => width >= CLASSIC_BREAKPOINT.width && height >= CLASSIC_BREAKPOINT.height && width > height;
export function fitClassicStage(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw new RangeError('Invalid stage frame');
  if (width <= 0 || height <= 0) return null;
  const scale = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
  return Object.freeze({ scale, width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale });
}
export function interactionBounds(visual: StageBounds, scale: number): StageBounds {
  if (!Number.isFinite(scale) || scale <= 0) throw new RangeError('Invalid presentation scale');
  const minimum = Math.ceil(CSS_TARGET_MINIMUM / scale * 4) / 4; // Round up against CSS subpixel quantization.
  const width = Math.max(visual.width, minimum), height = Math.max(visual.height, minimum);
  return box(Math.max(SAFE_BOUNDS.x, Math.min(visual.x + (visual.width - width) / 2, SAFE_BOUNDS.x + SAFE_BOUNDS.width - width)),
    Math.max(SAFE_BOUNDS.y, Math.min(visual.y + (visual.height - height) / 2, SAFE_BOUNDS.y + SAFE_BOUNDS.height - height)), width, height);
}
export function bottleSlot(index: number) {
  if (!Number.isSafeInteger(index) || index < 0) throw new RangeError('Invalid shelf slot');
  const centerX = 70 + (index % 4) * 85;
  return Object.freeze({ page: Math.floor(index / 4), centerX, visual: box(centerX - 32, 80, 64, 128), target: box(centerX - 36, 73, 72, 142) });
}
type Variables = Record<`--${string}`, string | number>;
function variablesFor(name: string, value: StageBounds, relativeTo = { x: 0, y: 0 }): Variables {
  return { [`--${name}-x`]: value.x - relativeTo.x + 'px', [`--${name}-y`]: value.y - relativeTo.y + 'px', [`--${name}-w`]: value.width + 'px', [`--${name}-h`]: value.height + 'px' };
}
export function bottleSlotVariables(index: number): Variables {
  const slot = bottleSlot(index);
  return { ...variablesFor('bottle-target', slot.target, BOTTLE_SHELF_BOUNDS), ...variablesFor('bottle-art', slot.visual, slot.target) };
}
export function classicStageVariables(scale: number): Variables {
  const vars: Variables = { '--stage-width': STAGE_WIDTH + 'px', '--stage-height': STAGE_HEIGHT + 'px', '--stage-scale': scale };
  const regions = { shelf: BOTTLE_SHELF_BOUNDS, bartender: BARTENDER_BOUNDS, counter: COUNTER_BOUNDS, message: MESSAGE_PANEL_BOUNDS, meta: HUD_BOUNDS };
  for (const [name, bounds] of Object.entries(regions)) Object.assign(vars, variablesFor(name, bounds));
  for (const [name, bounds, parent] of [
    ['level', LEVEL_BOUNDS, HUD_BOUNDS], ['xp', XP_BOUNDS, HUD_BOUNDS], ['coins', COINS_BOUNDS, HUD_BOUNDS], ['warning', WARNING_BOUNDS, HUD_BOUNDS],
    ['counter-art', COUNTER_ART_BOUNDS, COUNTER_BOUNDS], ['mixing', MIXING_BOUNDS, COUNTER_BOUNDS], ['shaker', SHAKER_BOUNDS, MIXING_BOUNDS],
    ['glass', GLASS_BOUNDS, MIXING_BOUNDS], ['meter', METER_BOUNDS, MIXING_BOUNDS], ['fill-number', FILL_READOUT_BOUNDS, METER_BOUNDS],
  ] as const) Object.assign(vars, variablesFor(name, bounds, parent));
  for (const [name, visual, parent] of [
    ['pour', PRIMARY_BUTTON_BOUNDS.pour, {x:0,y:0}], ['shake', PRIMARY_BUTTON_BOUNDS.shake, {x:0,y:0}], ['serve', PRIMARY_BUTTON_BOUNDS.serve, {x:0,y:0}],
    ['collection', COLLECTION_BOUNDS, HUD_BOUNDS], ['reset', RESET_BOUNDS, MESSAGE_PANEL_BOUNDS], ['skip', SKIP_BOUNDS, MESSAGE_PANEL_BOUNDS],
    ['ice', ICE_BOUNDS, {x:0,y:0}], ['garnish', GARNISH_BOUNDS, {x:0,y:0}],
  ] as const) {
    const hit = interactionBounds(visual, scale);
    Object.assign(vars, variablesFor(name, hit, parent), variablesFor(name + '-face', visual, hit));
  }
  vars['--message-scroll-h'] = interactionBounds(RESET_BOUNDS, scale).y - MESSAGE_PANEL_BOUNDS.y - 2 + 'px';
  for (const [name, value] of Object.entries(STAGE_LAYERS)) vars[`--layer-${name}`] = value;
  return vars;
}
