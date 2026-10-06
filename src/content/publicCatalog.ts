import type { BartenderDefinition, GarnishDefinition, IngredientDefinition, ReactionDefinition, RecipeDefinition } from '../domain/model.ts';

export interface PublicCatalog {
  readonly ingredients: readonly IngredientDefinition[];
  readonly garnishes: readonly GarnishDefinition[];
  readonly bartenders: readonly BartenderDefinition[];
  readonly reactions: readonly ReactionDefinition[];
  readonly recipes: readonly RecipeDefinition[];
}

/** Original Phase 0 placeholders. Future protected content must arrive from a server. */
export const publicCatalog: PublicCatalog = {
  ingredients: [
    { id: 'orchard', name: 'Infuso del frutteto', shortLabel: 'FRUTTETO', description: 'La base morbida del tuo mix.', color: '#dfaa5b' },
    { id: 'citrus', name: 'Cordial agli agrumi', shortLabel: 'AGRUMI', description: 'Una nota vivace e luminosa.', color: '#a1c784' },
    { id: 'soda', name: 'Acqua frizzante', shortLabel: 'BOLLICINE', description: 'Un tocco leggero per completare.', color: '#88bfc5' },
  ],
  garnishes: [{ id: 'citrus-wheel', name: 'Ruota di agrume' }],
  bartenders: [{
    id: 'milo', name: 'Milo', role: 'Assistente geometrico · fase 0',
    lines: {
      unrated: 'Il banco è tuo. Inizia da un ingrediente.',
      rough: 'C’è un’idea qui dentro. Prova a cambiare le proporzioni!',
      balanced: 'Un buon equilibrio. Un altro piccolo esperimento?',
      excellent: 'Questo mix trova il suo ritmo. Ben fatto!',
    },
  }],
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
