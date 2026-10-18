import { barIngredients } from './ingredientCatalog.ts';
import type { CocktailRecipe, RecipeCatalog } from '../domain/recipes.ts';
import { validateRecipeCatalog } from '../domain/recipes.ts';
import { immutable } from '../domain/playerProfile.ts';
import { progressionTuning } from './progressionTuning.ts';
import { volumeUnits } from '../domain/quantity.ts';
import { publicCatalog } from './publicCatalog.ts';
import { classicInspiredTuning as tuning } from './classicInspiredTuning.ts';
const target=(quantities:Record<string,number>)=>Object.fromEntries(Object.entries(quantities).map(([id,n])=>[id,volumeUnits(n)]));
const base={tolerance:{successfulDeviation:12,nearDeviation:30},rewards:{completion:{xp:15,coins:5},perfect:{xp:10,coins:5}}};
export const recipeCatalog:RecipeCatalog=immutable({ingredientAccess:Object.fromEntries(barIngredients.map(i=>[i.id,{contentId:i.contentId,published:i.published}])),recipes:[
  {...base,id:'recipe.first-ray',name:'Primo raggio',description:'Un inizio morbido, con il frutteto al centro.',availableFromLevel:1,quantities:target({orchard:120})},
  {...base,id:'recipe.counter-harmony',name:'Intesa del banco',description:'Tre note si incontrano in un giro misurato.',availableFromLevel:2,quantities:target({orchard:120,citrus:60,soda:60}),shake:{completed:{minimum:1,maximum:2},durationMs:{minimum:200,maximum:2000}}},
  {...base,id:'recipe.lantern-breeze',name:'Fresco di lanterna',description:'Le bollicine guidano un brindisi ben freddo.',availableFromLevel:3,quantities:target({orchard:60,citrus:60,soda:120}),ice:{minimum:2,maximum:2}},
  {...base,id:'recipe.last-flash',name:'Ultimo lampo',description:'Agrumi in primo piano e due gesti per il finale.',availableFromLevel:4,quantities:target({orchard:90,citrus:120,soda:30}),garnishId:'citrus-wheel',shake:{completed:{minimum:2,maximum:2},durationMs:{minimum:500,maximum:2000}}},
  {...base,id:'recipe.forest-afterglow',name:'Verde in controluce',description:'Il frutteto incontra una nota asciutta di erbe.',availableFromLevel:3,quantities:target({orchard:120,botanical:60,citrus:60}),ice:{minimum:1,maximum:2},tolerance:{successfulDeviation:18,nearDeviation:36}},
  {...base,id:'recipe.embers-twist',name:'Brace gentile',description:'Un carattere caldo, ammorbidito prima del finale.',availableFromLevel:4,quantities:target({ember:90,orchard:90,soda:60}),garnishId:'citrus-wheel',shake:{completed:{minimum:2,maximum:2},durationMs:{minimum:500,maximum:2000}},tolerance:{successfulDeviation:15,nearDeviation:36}},
  {...base,id:'recipe.petal-current',name:'Corrente di petali',description:'Un profumo leggero si apre fra bollicine e agrumi.',availableFromLevel:5,quantities:target({soda:150,citrus:60,blossom:30}),ice:{minimum:2,maximum:2},shake:{completed:{minimum:1,maximum:1},durationMs:{minimum:200,maximum:1000}},tolerance:{successfulDeviation:18,nearDeviation:36}},
] satisfies readonly CocktailRecipe[],goals:[
  {id:'goal.first-recipe',name:'Il primo segno',description:'Completa una ricetta.',kind:'completions',count:1,reward:{xp:5,coins:3}},
  {id:'goal.three-recipes',name:'Cinque firme sul banco',description:'Completa cinque ricette diverse.',kind:'completions',count:5,reward:{xp:10,coins:5}},
  {id:'goal.first-perfect',name:'Al punto giusto',description:'Prepara una ricetta perfetta.',kind:'perfections',count:1,reward:{xp:5,coins:3}},
  {id:'goal.high-recipe',name:'Firma applaudita',description:'Completa una ricetta con almeno 8.500 punti del drink.',kind:'recipe-score',minimumScore:8500,reward:{xp:10,coins:4}},
]});
export const recipeValidationRules={ingredientIds:barIngredients.map(i=>i.id),garnishIds:publicCatalog.garnishes.map(g=>g.id),capacityUnits:tuning.capacityUnits,maximumIce:tuning.ice.maximumActions,failureCount:tuning.shake.failureCount,failureDurationMs:tuning.shake.failureDurationMs,scoreMaximum:tuning.score.maximum,maximumLevel:progressionTuning.levels.technicalMaximum};
validateRecipeCatalog(recipeCatalog,recipeValidationRules);
