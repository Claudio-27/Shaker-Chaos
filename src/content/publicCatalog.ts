import { publishedIngredientDefinitions } from './ingredientCatalog.ts';
import { publicContentCatalog } from './publicContentCatalog.ts';
import type { BartenderDefinition, GarnishDefinition, IngredientDefinition, ReactionDefinition, RecipeDefinition } from '../domain/model.ts';

export interface PublicCatalog {
  readonly ingredients: readonly IngredientDefinition[];
  readonly garnishes: readonly GarnishDefinition[];
  readonly bartenders: readonly BartenderDefinition[];
  readonly reactions: readonly ReactionDefinition[];
  readonly recipes: readonly RecipeDefinition[];
}

/** Public demo text; supplied bartender display names come from canonical content metadata. */
export const publicCatalog: PublicCatalog = {
  ingredients: publishedIngredientDefinitions,
  garnishes: [{ id: 'citrus-wheel', name: 'Ruota di agrume' }],
  bartenders: publicContentCatalog.items.filter((item) => item.kind === 'bartender').map((item) => ({
    id: item.id, name: item.displayName, role: 'Compagno del laboratorio',
    lines: {
      unrated: 'Il banco è tuo. Inizia da un ingrediente.',
      rough: 'C’è un’idea qui dentro. Prova a cambiare le proporzioni!',
      balanced: 'Un buon equilibrio. Un altro piccolo esperimento?',
      excellent: 'Questo mix trova il suo ritmo. Ben fatto!',
    },
  })),
  reactions: [
    { tier: 'unrated', title: 'Tutto da inventare', description: 'Versa, aggiungi ghiaccio, agita e assaggia.' },
    { tier: 'rough', title: 'Un po’ di caos', description: 'Il laboratorio invita a sperimentare ancora.' },
    { tier: 'balanced', title: 'Ci siamo quasi', description: 'Le note iniziano a stare bene insieme.' },
    { tier: 'excellent', title: 'Un bel mix!', description: 'Hai centrato i parametri della demo.' },
  ],
  recipes: [{
    id: 'garden-demo', name: 'Giardino frizzante',
    description: 'Obiettivo dimostrativo pubblico; nessuna scoperta o ricetta originale verificata.',
    ingredientParts: { orchard: 2, citrus: 1, soda: 1 }, garnishId: 'citrus-wheel',
  }],
};
