import { addInteger, identifier, immutable, integer } from './playerProfile.ts';
import type { VolumeUnit } from './quantity.ts';
import type { ClassicSessionView } from './classicSession.ts';
export interface RecipeBonus { readonly xp:number; readonly coins:number }
export interface RecipeRange { readonly minimum:number; readonly maximum:number }
export interface CocktailRecipe {
  readonly id:string; readonly name:string; readonly description:string; readonly availableFromLevel:number;
  readonly quantities:Readonly<Record<string,VolumeUnit>>;
  readonly tolerance:{readonly successfulDeviation:number;readonly nearDeviation:number};
  readonly ice?:RecipeRange; readonly garnishId?:string;
  readonly shake?:{readonly completed:RecipeRange;readonly durationMs:RecipeRange};
  readonly rewards:{readonly completion:RecipeBonus;readonly perfect:RecipeBonus};
}
export type RecipeStatus='FAILED'|'CLOSE'|'SUCCESS'|'PERFECT';
export interface RecipeResult {
  readonly recipeId:string;readonly status:RecipeStatus;readonly deviation:number;readonly precisionBps:number;
  readonly missing:readonly ('ice'|'garnish'|'shake')[];
}
export interface RecipeMastery { readonly recipeId:string;readonly completed:boolean;readonly perfect:boolean;readonly bestStatus:RecipeStatus;readonly bestPrecisionBps:number }
export interface RecipeProgress { readonly mastery:readonly RecipeMastery[];readonly claimedGoalIds:readonly string[];readonly lastSettledOrdinal:number }
export type RecipeGoal = {readonly id:string;readonly name:string;readonly description:string;readonly reward:RecipeBonus} & (
  {readonly kind:'completions'|'perfections';readonly count:number} | {readonly kind:'recipe-score';readonly minimumScore:number});
export interface RecipeCatalog { readonly ingredientAccess?:Readonly<Record<string,{readonly contentId:string;readonly published:boolean}>>; readonly recipes:readonly CocktailRecipe[];readonly goals:readonly RecipeGoal[] }
export const recipeRank:Readonly<Record<RecipeStatus,number>>={FAILED:0,CLOSE:1,SUCCESS:2,PERFECT:3};
export const completedRecipe=(result:RecipeResult)=>recipeRank[result.status]>=recipeRank.SUCCESS;
export const emptyRecipeProgress=(lastSettledOrdinal=0):RecipeProgress=>immutable({mastery:[],claimedGoalIds:[],lastSettledOrdinal});
const inRange=(n:number,range:RecipeRange)=>n>=range.minimum&&n<=range.maximum;
/** Independent objective evaluation. No scoring engine or player profile input. L1 error counts unexpected ingredients too. */
export function evaluateRecipe(recipe:CocktailRecipe,view:ClassicSessionView):RecipeResult {
  const mix=view.derived.mix,ids=new Set([...Object.keys(recipe.quantities),...Object.keys(mix.quantities)]);
  let deviation=0,target=0;for(const n of Object.values(recipe.quantities))target=addInteger(target,n);
  for(const id of ids)deviation=addInteger(deviation,Math.abs((mix.quantities[id]??0)-(recipe.quantities[id]??0)));
  const missing:('ice'|'garnish'|'shake')[]=[];
  if(recipe.ice&&!inRange(mix.iceUnits,recipe.ice))missing.push('ice');
  if(recipe.garnishId&&mix.garnishId!==recipe.garnishId)missing.push('garnish');
  if(recipe.shake&&(!inRange(view.completedShakeCount,recipe.shake.completed)||!inRange(mix.shakeDurationMs,recipe.shake.durationMs)))missing.push('shake');
  const status:RecipeStatus=view.failed||deviation>recipe.tolerance.nearDeviation?'FAILED':missing.length?'CLOSE':deviation===0?'PERFECT':deviation<=recipe.tolerance.successfulDeviation?'SUCCESS':'CLOSE';
  const penalty=deviation>=target?10000:Number(BigInt(deviation)*10000n/BigInt(target));
  return immutable({recipeId:recipe.id,status,deviation,precisionBps:Math.max(0,10000-penalty),missing});
}
export function validateRecipeCatalog(catalog:RecipeCatalog,rules:{readonly ingredientIds:readonly string[];readonly garnishIds:readonly string[];readonly capacityUnits:number;readonly maximumIce:number;readonly failureCount:number;readonly failureDurationMs:number;readonly scoreMaximum:number;readonly maximumLevel:number}):void {
  if(!catalog.recipes.length||catalog.recipes.length>64||catalog.goals.length>64)throw new RangeError('Invalid recipe catalog size');
  const ids=new Set<string>();const unique=(id:string)=>{identifier(id);if(ids.has(id))throw new RangeError('Duplicate recipe/goal');ids.add(id);};
  const bonus=(b:RecipeBonus)=>{integer(b.xp);integer(b.coins);};
  const range=(r:RecipeRange,max:number,min=0)=>{integer(r.minimum,min);integer(r.maximum,r.minimum);if(r.maximum>max)throw new RangeError('Unreachable recipe range');};
  for(const r of catalog.recipes){unique(r.id);identifier(r.name);identifier(r.description);integer(r.availableFromLevel,1);if(r.availableFromLevel>rules.maximumLevel)throw new RangeError('Unreachable recipe level');
    let total=0;if(!Object.keys(r.quantities).length)throw new RangeError('Empty recipe target');
    for(const [id,n]of Object.entries(r.quantities)){const access=catalog.ingredientAccess?.[id];if(catalog.ingredientAccess&&(!access||access.contentId!=='ingredient.'+id||typeof access.published!=='boolean'))throw new RangeError('Invalid recipe ingredient dependency');if(!rules.ingredientIds.includes(id))throw new RangeError('Unknown recipe ingredient');integer(n,1);total=addInteger(total,n);}
    if(total>rules.capacityUnits)throw new RangeError('Recipe exceeds capacity');
    integer(r.tolerance.successfulDeviation);integer(r.tolerance.nearDeviation,r.tolerance.successfulDeviation);
    if(r.tolerance.nearDeviation>=total)throw new RangeError('Empty drink cannot meet recipe');
    if(r.ice)range(r.ice,rules.maximumIce);if(r.garnishId&&!rules.garnishIds.includes(r.garnishId))throw new RangeError('Unknown recipe garnish');
    if(r.shake){range(r.shake.completed,rules.failureCount-1,1);range(r.shake.durationMs,rules.failureDurationMs-1,1);}
    bonus(r.rewards.completion);bonus(r.rewards.perfect);
  }
  for(const g of catalog.goals){unique(g.id);identifier(g.name);identifier(g.description);bonus(g.reward);
    if(g.kind==='recipe-score'){integer(g.minimumScore);if(g.minimumScore>rules.scoreMaximum)throw new RangeError('Unreachable score goal');}
    else if(g.kind==='completions'||g.kind==='perfections'){integer(g.count,1);if(g.count>catalog.recipes.length)throw new RangeError('Unreachable recipe count');}
    else throw new RangeError('Unknown goal kind');
  }
}

/** Recipe level and ingredient ownership are distinct availability requirements, never grants. */
export function recipeAvailability(profile:{readonly progression:{readonly level:number};readonly ownership:readonly {readonly contentId:string}[]},recipe:CocktailRecipe,catalog:RecipeCatalog){
  const missing=Object.keys(recipe.quantities).filter(id=>{const access=catalog.ingredientAccess?.[id];return access&&!profile.ownership.some(o=>o.contentId===access.contentId);});
  const unpublished=Object.keys(recipe.quantities).some(id=>catalog.ingredientAccess?.[id]?.published===false);
  return {state:unpublished?'UNPUBLISHED' as const:profile.progression.level<recipe.availableFromLevel?'LEVEL_REQUIRED' as const:missing.length?'INGREDIENT_REQUIRED' as const:'AVAILABLE' as const,missing};
}
