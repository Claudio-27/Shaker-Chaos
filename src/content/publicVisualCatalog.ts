import type { VisualCatalog } from './visualModel.ts';

/** Only original geometric placeholders. All public asset paths live in this registry. */
export const publicVisualCatalog: VisualCatalog = {
  assets: {
    'bartender.milo.idle': { path: 'art/placeholders/milo-idle.svg', width: 480, height: 640, format: 'svg' },
    'bartender.milo.tasting': { path: 'art/placeholders/milo-tasting.svg', width: 480, height: 640, format: 'svg' },
    'bartender.milo.rough': { path: 'art/placeholders/milo-rough.svg', width: 480, height: 640, format: 'svg' },
    'bartender.milo.balanced': { path: 'art/placeholders/milo-balanced.svg', width: 480, height: 640, format: 'svg' },
    'bartender.milo.excellent': { path: 'art/placeholders/milo-excellent.svg', width: 480, height: 640, format: 'svg' },
    'bartender.milo.portrait': { path: 'art/placeholders/milo-portrait.svg', width: 120, height: 120, format: 'svg' },
    'environment.studio.background': { path: 'art/placeholders/studio-background.svg', width: 1600, height: 1000, format: 'svg' },
    'environment.studio.back-bar': { path: 'art/placeholders/studio-back-bar.svg', width: 1600, height: 1000, format: 'svg' },
    'environment.studio.counter': { path: 'art/placeholders/studio-counter.svg', width: 1600, height: 240, format: 'svg' },
    'ingredient.orchard.bottle': { path: 'art/placeholders/orchard-bottle.svg', width: 96, height: 192, format: 'svg' },
    'ingredient.citrus.bottle': { path: 'art/placeholders/citrus-bottle.svg', width: 96, height: 192, format: 'svg' },
    'ingredient.soda.bottle': { path: 'art/placeholders/soda-bottle.svg', width: 96, height: 192, format: 'svg' },
    'gameplay.shaker': { path: 'art/placeholders/shaker.svg', width: 200, height: 280, format: 'svg' },
    'gameplay.glass': { path: 'art/placeholders/glass.svg', width: 200, height: 280, format: 'svg' },
    'gameplay.ice': { path: 'art/placeholders/ice.svg', width: 48, height: 48, format: 'svg' },
    'gameplay.garnish': { path: 'art/placeholders/garnish.svg', width: 64, height: 64, format: 'svg' },
    'gameplay.sparkles': { path: 'art/placeholders/sparkles.svg', width: 480, height: 640, format: 'svg' },
    'ui.pour': { path: 'art/placeholders/pour.svg', width: 32, height: 32, format: 'svg' },
    'ui.shake': { path: 'art/placeholders/shake.svg', width: 32, height: 32, format: 'svg' },
    'ui.serve': { path: 'art/placeholders/serve.svg', width: 32, height: 32, format: 'svg' },
    'ui.reset': { path: 'art/placeholders/reset.svg', width: 32, height: 32, format: 'svg' },
  },
  bartenders: {
    milo: {
      id: 'milo', idle: 'bartender.milo.idle', portrait: 'bartender.milo.portrait',
      tasting: { frames: ['bartender.milo.tasting'], frameDurationMs: 300 },
      reactions: {
        'lab.welcome': { frames: ['bartender.milo.idle'], frameDurationMs: 300 },
        'lab.rough': { frames: ['bartender.milo.rough'], frameDurationMs: 300 },
        'lab.balanced': { frames: ['bartender.milo.balanced'], frameDurationMs: 300 },
        'lab.excellent': { frames: ['bartender.milo.excellent'], frameDurationMs: 300 },
      },
    },
  },
  ingredients: {
    orchard: { id: 'orchard', bottle: 'ingredient.orchard.bottle', icon: 'ingredient.orchard.bottle', liquid: { color: '#dfaa5b' } },
    citrus: { id: 'citrus', bottle: 'ingredient.citrus.bottle', icon: 'ingredient.citrus.bottle', liquid: { color: '#a1c784' } },
    soda: { id: 'soda', bottle: 'ingredient.soda.bottle', icon: 'ingredient.soda.bottle', liquid: { color: '#88bfc5' } },
  },
  environments: { studio: {
    id: 'studio', background: 'environment.studio.background', backBar: 'environment.studio.back-bar', counterForeground: 'environment.studio.counter',
  } },
  reactions: {
    'lab.welcome': { id: 'lab.welcome', motion: 'none' },
    'lab.rough': { id: 'lab.rough', motion: 'tilt' },
    'lab.balanced': { id: 'lab.balanced', motion: 'settle' },
    'lab.excellent': { id: 'lab.excellent', motion: 'celebrate', effect: 'gameplay.sparkles' },
  },
  reactionByTier: { unrated: 'lab.welcome', rough: 'lab.rough', balanced: 'lab.balanced', excellent: 'lab.excellent' },
  gameplay: { shaker: 'gameplay.shaker', glass: 'gameplay.glass', ice: 'gameplay.ice', garnish: 'gameplay.garnish', liquidWindows: { shaker: { leftPercent: 22, topPercent: 28, widthPercent: 56, heightPercent: 62 }, glass: { leftPercent: 22, topPercent: 28, widthPercent: 56, heightPercent: 62 } } },
  controls: { pour: 'ui.pour', shake: 'ui.shake', serve: 'ui.serve', reset: 'ui.reset' },
};