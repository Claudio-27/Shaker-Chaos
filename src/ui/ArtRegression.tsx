import { useRef } from 'react';
import { gameDependencies, gamePresentation } from '../application/productionBootstrap.ts';
import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import type { ClassicGameAction } from '../application/classicGame.ts';
import { totalVolumeUnits } from '../domain/mix.ts';
import { createPlayerController } from '../application/playerController.ts';
import { testRepository } from '../platform/profileTestFixtures.ts';
import { reactionCopy } from '../content/playerExperience.ts';
import { AssetImage, VisualAssetsProvider } from './AssetVisual.tsx';
import { BartenderArea, BottleShelf, ControlsArea, CounterArea, GameStage, MixingStation, ScoreHUD } from './GameStage.tsx';
import { PlayerHUD } from './PlayerProgression.tsx';
const profile=gameDependencies.profile,visuals=gamePresentation.visuals;
/** Frozen OUR-GAME fixtures, memory-only. No profile/localStorage writes, input automation or clocks. */
export default function ArtRegression(){
  const query=new URLSearchParams(window.location.search),name=query.get('scene')??'b01-idle';
  const host=name==='b02-idle'?'bartender.b02':'bartender.b01',selected=name==='selected'?'citrus':'orchard';
  const result=name==='result',mixing=name==='mixing'||result;
  const actions:ClassicGameAction[]=mixing?[
    {type:'PourStarted',operationId:0,ingredientId:'orchard',atMs:0},
    {type:'PourEnded',operationId:0,reason:'completed',atMs:result?10800:5800},
    {type:'IceAdded',requestedUnits:1,atMs:11000},
  ]:[];
  if(result)actions.push({type:'IceAdded',requestedUnits:1,atMs:11000},{type:'ShakeStarted',operationId:1,atMs:11000},{type:'ShakeEnded',operationId:1,reason:'completed',atMs:18000},{type:'GarnishChanged',garnishId:profile.garnish.id,atMs:18000},{type:'Served',atMs:18000});
  let state=newClassicGame(gameDependencies);for(const action of actions)state=transitionClassicGame(state,action,gameDependencies);
  const mix=state.view.derived.mix,volume=totalVolumeUnits(mix),loadout={...gamePresentation.scene,bartenderId:host,effectOverride:result?(query.get('effect')==='effect.ice-blue'?'effect.ice-blue':'effect.sparkles'):null};
  const snapshot=createPlayerController(testRepository(),'art-regression',()=>2000).snapshot();
  const titleRef=useRef<HTMLHeadingElement>(null),skipRef=useRef<HTMLButtonElement>(null);
  const copy=state.result?reactionCopy(profile,state.result.mechanicalReactionTierId,host):{title:'Il banco è tuo',line:'Tre bottiglie, tante idee.'};
  return <VisualAssetsProvider catalog={visuals}><div className="app-shell" data-art-regression="ART_RUNTIME_REGRESSION_DEV_ONLY">
    <style>{'.sequence-art,.character-effect,.vessel-art{animation:none!important;transition:none!important}'}</style>
    <GameStage environment={visuals.environments['environment.e01']!} debug={query.get('visualDebug')==='1'} diagnostics={{phase:result?'result':'mix',pour:'idle',risk:'safe',result:result?'breakdown':'idle',reduced:false}} failed={false}
      meta={<header className="topbar"><div className="player-tools"><PlayerHUD snapshot={snapshot}/><button className="collection-button">Collezione</button></div></header>}>
      <BottleShelf loadout={loadout} ingredients={gamePresentation.catalog.ingredients} visuals={visuals} mix={mix} selectedId={selected} disabled={result} pourFeedback="idle" onSelect={()=>{}} formatVolume={String}/>
      <BartenderArea loadout={loadout} bartender={gamePresentation.catalog.bartenders.find(b=>b.id===host)!} visuals={visuals} reactionId="lab.excellent" pose={result?'reaction':'idle'} working="idle" attemptKey={0} reducedMotion={false} lastResort="bartender.b01.idle"/>
      <CounterArea assetId="counter.c01.surface" fit="contain"><MixingStation mix={mix} volume={volume} capacity={profile.capacityUnits} maximumIce={profile.ice.maximumActions} visuals={visuals} formatVolume={String} shaking={false} served={result} failed={false} pourFeedback="idle" risk="safe" attemptKey={0}/></CounterArea>
      <ControlsArea><div className="mix-controls"><button className="hold-button pour-button" disabled={result}><AssetImage assetId={visuals.controls.pour}/><strong>Versa</strong><small>tieni premuto</small></button><button className="hold-button shake-button" disabled={!mixing||result}><AssetImage assetId={visuals.controls.shake}/><strong>Agita</strong><small>tieni premuto</small></button><button className="serve-button" disabled><AssetImage assetId={visuals.controls.serve}/><span>Servi</span></button></div></ControlsArea>
      <div className="extras"><button disabled={result}><AssetImage assetId={visuals.gameplay.ice}/>Ghiaccio <b>{mix.iceUnits}/2</b></button><button disabled={!result}><AssetImage assetId={visuals.gameplay.garnish}/>Agrume <b>{result?'✓':'+'}</b></button></div>
      <ScoreHUD result={state.result} stage={result?'breakdown':'idle'} title={copy.title} line={copy.line} ingredients={gamePresentation.catalog.ingredients} profile={profile} titleRef={titleRef} skipRef={skipRef} onSkip={()=>{}} onNewDrink={()=>{}} resetAction={<button className="reset-button">Reset</button>}><p className="phase-status">{mixing?'Aggiungi le tue note, poi passa allo shaker.':'Scegli una bottiglia e tieni premuto Versa.'}</p></ScoreHUD>
    </GameStage>
  </div></VisualAssetsProvider>;
}
