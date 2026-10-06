import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { validatePublicContent } from '../content/contentValidation.ts';
import { publicVisualCatalog } from '../content/publicVisualCatalog.ts';
import { planSceneAssets, validateVisualCatalog } from '../content/visualPlan.ts';
import { demoInput, demoMixingRules, demoScoringConfiguration } from '../content/demoConfiguration.ts';
import { publicCatalog } from '../content/publicCatalog.ts';
import { createDemoScoringEngine } from '../domain/scoring.ts';
import type { GameDependencies } from './game.ts';

/** Composition root. Substitute the engine/dataset and its public presentation here. */
export const gameDependencies: GameDependencies = {
  mixingRules: demoMixingRules,
  scoringEngine: createDemoScoringEngine(demoScoringConfiguration),
  ingredientIds: publicCatalog.ingredients.map((ingredient) => ingredient.id),
  garnishIds: publicCatalog.garnishes.map((garnish) => garnish.id),
};

/** UI guidance is content, not an alternative implementation of the equation. */
export const gamePresentation = {
  catalog: publicCatalog,
  visuals: publicVisualCatalog,
  scene: { bartenderId: 'bartender.b01', environmentId: 'environment.e01', counterId: 'counter.c01', bottleSetId: 'bottles.supplied', ingredientIds: publicCatalog.ingredients.map((ingredient) => ingredient.id) },
  input: demoInput,
  volumeDisplay: { symbol: 'u' }, // No physical mapping has been established.
  guide: {
    idealIceUnits: demoScoringConfiguration.idealIceUnits,
    idealShakeDurationMs: demoScoringConfiguration.idealShakeDurationMs,
    garnishLabel: 'agrume',
    note: 'Parametri inventati per provare l’architettura.',
  },
  scoringNotice: {
    title: 'Scoring demo · NON VERIFICATO',
    description: 'La formula è temporanea. Non riproduce ancora le meccaniche del gioco di riferimento.',
  },
} as const;


validateVisualCatalog(gamePresentation.visuals);
planSceneAssets(gamePresentation.visuals, gamePresentation.scene);

validatePublicContent(publicContentCatalog, gamePresentation.visuals);
