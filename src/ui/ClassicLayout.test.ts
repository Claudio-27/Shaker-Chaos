import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import { gameDependencies, gamePresentation } from '../application/productionBootstrap.ts';

const server = await createServer({configFile:false,server:{middlewareMode:true,watch:null},appType:'custom'});
const stage = await server.ssrLoadModule('/src/ui/GameStage.tsx') as typeof import('./GameStage.tsx');
const assets = await server.ssrLoadModule('/src/ui/AssetVisual.tsx') as typeof import('./AssetVisual.tsx');
test.after(async()=>{await server.close();});
const render = (node:Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(createElement(assets.VisualAssetsProvider,{catalog:gamePresentation.visuals,children:node}));

let game=newClassicGame(gameDependencies);
for(const action of [
  {type:'PourStarted',operationId:0,ingredientId:gamePresentation.catalog.ingredients[0]!.id,atMs:0},
  {type:'HoldAdvanced',operationId:0,atMs:1300},
  {type:'PourEnded',operationId:0,reason:'completed',atMs:1300},
  {type:'ShakeStarted',operationId:1,atMs:1400},
  {type:'HoldAdvanced',operationId:1,atMs:2700},
  {type:'ShakeEnded',operationId:1,reason:'completed',atMs:2700},
  {type:'Served',atMs:2800},
] as const) game=transitionClassicGame(game,action,gameDependencies);
const props={result:game.result,title:'Il tuo mix',line:'Una sorpresa al banco.',ingredients:gamePresentation.catalog.ingredients,profile:gameDependencies.profile,titleRef:{current:null},skipRef:{current:null},onSkip(){},onNewDrink(){}};

test('single anchored result region preserves tasting, score and reaction reveal plus accessible restart/skip',()=>{
  assert.ok(game.result);
  const tasting=render(createElement(stage.ScoreHUD,{...props,stage:'tasting'}));
  assert.match(tasting,/data-zone="hud"[^>]*data-result-stage="tasting"/);assert.match(tasting,/aria-busy="true"/);
  assert.match(tasting,/id="score-title" tabindex="-1"/);assert.match(tasting,/skip-result/);assert.match(tasting,/new-drink-button/);
  assert.doesNotMatch(tasting,/<strong>422<\/strong>|breakdown-row/);
  const score=render(createElement(stage.ScoreHUD,{...props,stage:'score'}));assert.match(score,new RegExp(`<strong>${game.result.totalScore}</strong>`));assert.doesNotMatch(score,/breakdown-row/);
  const final=render(createElement(stage.ScoreHUD,{...props,stage:'breakdown',reward:createElement('p',null,'+24 XP')}));
  assert.equal(final.split('class="breakdown-row"').length-1,4);assert.match(final,/\+24 XP/);assert.doesNotMatch(final,/skip-result/);assert.match(final,/aria-busy="false"/);
});

test('same result region supplies live phase guidance and notes before serving',()=>{
  const html=render(createElement(stage.ScoreHUD,{...props,result:null,stage:'idle',children:createElement(stage.RoundProgress,{phase:'mix'})}));
  assert.match(html,/Il tuo giro al banco/);assert.match(html,/aria-current="step"/);assert.match(html,/Note del banco/);
  assert.doesNotMatch(html,/score-number|new-drink-button|skip-result/);
});


