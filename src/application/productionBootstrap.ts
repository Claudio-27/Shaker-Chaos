import { shelfPage } from './ingredientAccess.ts';
import { barIngredients,validateIngredientCatalog } from '../content/ingredientCatalog.ts';
import { publicCatalog } from '../content/publicCatalog.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { publicVisualCatalog } from '../content/publicVisualCatalog.ts';
import { validatePublicContent } from '../content/contentValidation.ts';
import { planSceneAssets, validateVisualCatalog } from '../content/visualPlan.ts';
import { classicInspiredTuning } from '../content/classicInspiredTuning.ts';
import { createClassicInspiredScoringEngine } from '../domain/classicScoring.ts';
import type { ClassicGameDependencies } from './classicGame.ts';

export const gameDependencies: ClassicGameDependencies = {
  profile: classicInspiredTuning,
  scoringEngine: createClassicInspiredScoringEngine(classicInspiredTuning),
};
export const gamePresentation = {
  catalog: publicCatalog, visuals: publicVisualCatalog,
  scene: { bartenderId: 'bartender.b01', environmentId: 'environment.e01', counterId: 'counter.c01', bottleSetId: 'bottles.supplied',
    ingredientIds: shelfPage(publicCatalog.ingredients,0).items.map(ingredient => ingredient.id) },
  volumeDisplay: { symbol: 'u' },
};
validateVisualCatalog(gamePresentation.visuals);
planSceneAssets(gamePresentation.visuals, gamePresentation.scene);
validatePublicContent(publicContentCatalog, gamePresentation.visuals);

validateIngredientCatalog(barIngredients,publicVisualCatalog);
