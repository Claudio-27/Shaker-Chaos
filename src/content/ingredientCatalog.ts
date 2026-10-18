import type { IngredientDefinition } from '../domain/model.ts';
import type { AssetId,VisualCatalog } from './visualModel.ts';
import { identifier,integer,immutable } from '../domain/playerProfile.ts';
export type IngredientAcquisition={readonly kind:'starter'}|{readonly kind:'coins';readonly availableFromLevel:number;readonly price:number}|{readonly kind:'progression';readonly availableFromLevel:number;readonly requirementId:string};
export interface BarIngredient extends IngredientDefinition {
  readonly contentId:string;readonly aroma:string;readonly published:boolean;readonly acquisition:IngredientAcquisition;
  readonly bottleAssetId:AssetId;readonly scoring:{readonly weight:number;readonly balanceParts:number};
}
export const legacyIngredientIds=['orchard','citrus','soda'] as const;
export const barIngredients:readonly BarIngredient[]=immutable([
  {id:'orchard',contentId:'ingredient.orchard',name:'Infuso del frutteto',shortLabel:'FRUTTETO',description:'La base morbida del tuo mix.',color:'#dfaa5b',aroma:'fruttato',published:true,acquisition:{kind:'starter'},bottleAssetId:'ingredient.bottle03',scoring:{weight:8000,balanceParts:2}},
  {id:'citrus',contentId:'ingredient.citrus',name:'Cordial agli agrumi',shortLabel:'AGRUMI',description:'Una nota vivace e luminosa.',color:'#a1c784',aroma:'acido',published:true,acquisition:{kind:'starter'},bottleAssetId:'ingredient.bottle02',scoring:{weight:7200,balanceParts:1}},
  {id:'soda',contentId:'ingredient.soda',name:'Acqua frizzante',shortLabel:'BOLLICINE',description:'Un tocco leggero per completare.',color:'#88bfc5',aroma:'frizzante',published:true,acquisition:{kind:'starter'},bottleAssetId:'ingredient.bottle01',scoring:{weight:4800,balanceParts:1}},
  {id:'botanical',contentId:'ingredient.botanical',name:'Amaro di sottobosco',shortLabel:'SOTTOBOSCO',description:'Erbe scure, un finale asciutto.',color:'#507451',aroma:'bitter erbaceo',published:true,acquisition:{kind:'coins',availableFromLevel:3,price:100},bottleAssetId:'ingredient.bottle04',scoring:{weight:6400,balanceParts:1}},
  {id:'ember',contentId:'ingredient.ember',name:'Base di brace',shortLabel:'BRACE',description:'Una base intensa dal carattere caldo.',color:'#a75235',aroma:'intenso tostato',published:true,acquisition:{kind:'coins',availableFromLevel:4,price:175},bottleAssetId:'ingredient.bottle05',scoring:{weight:8800,balanceParts:2}},
  {id:'blossom',contentId:'ingredient.blossom',name:'Essenza di petali',shortLabel:'PETALI',description:'Una nota floreale per alleggerire il finale.',color:'#bb83ab',aroma:'aromatico floreale',published:true,acquisition:{kind:'coins',availableFromLevel:5,price:225},bottleAssetId:'ingredient.bottle06',scoring:{weight:5600,balanceParts:1}},
]);
export const publishedIngredientDefinitions=barIngredients.filter(i=>i.published).map(({id,name,shortLabel,description,color})=>({id,name,shortLabel,description,color}));
/** Publication is editorial AND requires a unique registered bottle; placeholders cannot silently ship. */
export function validateIngredientCatalog(ingredients:readonly BarIngredient[],visuals?:VisualCatalog):void {
  const ids=new Set<string>(),contentIds=new Set<string>(),bottles=new Set<string>(),paths=new Set<string>(),sourceHashes=new Set<string>();
  if(!ingredients.length||ingredients.length>64)throw new RangeError('Invalid ingredient count');
  for(const i of ingredients){identifier(i.id);identifier(i.contentId);identifier(i.name);identifier(i.shortLabel);identifier(i.description);identifier(i.aroma);
    if(i.contentId!=='ingredient.'+i.id||ids.has(i.id)||contentIds.has(i.contentId)||bottles.has(i.bottleAssetId)||typeof i.published!=='boolean')throw new RangeError('Duplicate/invalid ingredient identity');
    ids.add(i.id);contentIds.add(i.contentId);bottles.add(i.bottleAssetId);integer(i.scoring.weight);integer(i.scoring.balanceParts,1);
    if(!/^#[0-9a-f]{6}$/i.test(i.color))throw new RangeError('Invalid ingredient color');
    if(i.acquisition.kind!=='starter'){integer(i.acquisition.availableFromLevel,1);if(i.acquisition.availableFromLevel>1000000)throw new RangeError('Unreachable ingredient level');
      if(i.acquisition.kind==='coins')integer(i.acquisition.price);else if(i.acquisition.kind==='progression')identifier(i.acquisition.requirementId);else throw new RangeError('Invalid acquisition');}
    if(visuals&&i.published){const art=visuals.assets[i.bottleAssetId],definition=visuals.ingredients[i.id];
      if(!art||!art.runtime||art.visibility!=='public'||!definition||(visuals.bottleSets['bottles.supplied']?.bottles[i.id]??definition.bottle)!==i.bottleAssetId||paths.has(art.path)||sourceHashes.has(art.runtime.source.sha256)||art.path.includes('placeholders/'))throw new RangeError('Published ingredient needs unique final art');paths.add(art.path);sourceHashes.add(art.runtime.source.sha256);}
  }
}
validateIngredientCatalog(barIngredients);
