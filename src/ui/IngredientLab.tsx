import { useState } from 'react';
import type { PlayerProfile } from '../domain/playerProfile.ts';
import { barIngredients } from '../content/ingredientCatalog.ts';
import { publicVisualCatalog } from '../content/publicVisualCatalog.ts';
import { recipeCatalog } from '../content/recipeCatalog.ts';
import { ingredientAvailability, shelfPage, nextShelfPage } from '../application/ingredientAccess.ts';
/** Diagnostic tiles are deliberately not bottles and never participate in gameplay. */
export function IngredientLab({profile}:{readonly profile:PlayerProfile}) {
  const [page,setPage]=useState(0),visible=shelfPage(barIngredients,page);
  return <section data-ingredient-lab="INGREDIENT_LAB_DEV_ONLY" aria-label="Ingredient Lab">
    <h3>Ingredienti · diagnostica DEV</h3><p>{barIngredients.filter(i=>i.published).length} ingredienti pubblicati su {barIngredients.length}. I tasselli colorati sono diagnostica; lo scaffale di gioco usa gli artwork runtime.</p>
    <nav tabIndex={0} aria-label="Anteprima pagine ingredienti" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setPage(nextShelfPage(page,e.key,visible.pages));}}}>
      <button type="button" disabled={page===0} onClick={()=>setPage(page-1)}>Pagina DEV precedente</button>
      <span role="status">Pagina {page+1}/{visible.pages}</span>
      <button type="button" disabled={page===visible.pages-1} onClick={()=>setPage(page+1)}>Pagina DEV successiva</button>
    </nav>
    <div aria-label="Slot della pagina DEV">{visible.items.map((i,slot)=><p key={i.id} style={{borderLeft:'8px solid '+i.color,paddingLeft:8}}>{slot+1} · {i.name} · {i.published?'Pubblicato':'NON PUBBLICATO · artwork mancante'}</p>)}</div>
    <pre>{JSON.stringify(barIngredients.map((i,index)=>({id:i.id,name:i.name,published:i.published,bottle:i.bottleAssetId,artwork:publicVisualCatalog.assets[i.bottleAssetId]?'presente':'MANCANTE',
      acquisition:i.acquisition,access:ingredientAvailability(profile,i,publicVisualCatalog),scoring:i.scoring,page:Math.floor(index/3)+1,slot:index%3+1,
      recipes:recipeCatalog.recipes.filter(r=>Object.hasOwn(r.quantities,i.id)).map(r=>r.id)})),null,2)}</pre>
  </section>;
}
