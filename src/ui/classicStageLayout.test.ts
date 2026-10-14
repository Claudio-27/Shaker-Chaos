import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGE_WIDTH, STAGE_HEIGHT, BARTENDER_BOUNDS, BARTENDER_ANCHOR, BOTTLE_SHELF_BOUNDS, COLLECTION_BOUNDS, COUNTER_BOUNDS, FILL_READOUT_BOUNDS, GARNISH_BOUNDS, GLASS_BOUNDS, HUD_BOUNDS, ICE_BOUNDS, MESSAGE_PANEL_BOUNDS, METER_BOUNDS, MIXING_BOUNDS, PRIMARY_ACTION_ANCHORS, PRIMARY_BUTTON_BOUNDS, RESET_BOUNDS, SAFE_BOUNDS, SHAKER_BOUNDS, SKIP_BOUNDS, bottleSlot, bottleSlotVariables, classicLandscape, classicStageVariables, fitClassicStage, interactionBounds } from './classicStageLayout.ts';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const tuple=(r:{x:number;y:number;width:number;height:number})=>[r.x,r.y,r.width,r.height];

test('canonical 600x440 regions pin the host right, shelf upper-left and message lower-right',()=>{
  assert.deepEqual([STAGE_WIDTH,STAGE_HEIGHT],[600,440]);
  assert.deepEqual(tuple(BARTENDER_BOUNDS),[390,46,202,300]);assert.equal(BARTENDER_BOUNDS.y+BARTENDER_BOUNDS.height,BARTENDER_ANCHOR.baseline);
  assert.deepEqual(tuple(BOTTLE_SHELF_BOUNDS),[18,54,380,188]);assert.deepEqual(tuple(MESSAGE_PANEL_BOUNDS),[402,342,190,90]);
  assert.deepEqual(tuple(HUD_BOUNDS),[8,6,584,30]);assert.deepEqual(tuple(COLLECTION_BOUNDS),[522,7,65,26]);
  assert.deepEqual(tuple(COUNTER_BOUNDS),[0,286,600,154]);assert.deepEqual(tuple(MIXING_BOUNDS),[230,215,125,142]);
  assert.deepEqual(tuple(SHAKER_BOUNDS),[250,224,70,112]);assert.deepEqual(tuple(GLASS_BOUNDS),[318,262,40,70]);
  assert.deepEqual(tuple(METER_BOUNDS),[220,238,20,90]);assert.deepEqual(tuple(FILL_READOUT_BOUNDS),[208,330,54,18]);
  assert.deepEqual(tuple(ICE_BOUNDS),[350,270,48,48]);assert.deepEqual(tuple(GARNISH_BOUNDS),[406,270,46,48]);
});
test('three fixed primary boxes keep order, equal size, gaps and requested action anchors',()=>{
  const names=Object.keys(PRIMARY_BUTTON_BOUNDS) as (keyof typeof PRIMARY_BUTTON_BOUNDS)[];
  assert.deepEqual(names,['pour','shake','serve']);
  const centers=[];
  for(const name of names){const b=PRIMARY_BUTTON_BOUNDS[name],anchor=PRIMARY_ACTION_ANCHORS[name];assert.equal(b.y,389);assert.equal(b.width,106);assert.equal(b.height,42);near(b.x+b.width/2,anchor.x);assert.ok(Math.abs(b.y+b.height/2-anchor.y)<=3);centers.push(anchor.x);}
  assert.deepEqual(centers,[75,207,341]);
  assert.equal(PRIMARY_BUTTON_BOUNDS.shake.x-(PRIMARY_BUTTON_BOUNDS.pour.x+106),26);
  assert.equal(PRIMARY_BUTTON_BOUNDS.serve.x-(PRIMARY_BUTTON_BOUNDS.shake.x+106),28);
});
test('both primary landscape viewports fit one proportional stage without changing logical geometry',()=>{
  for(const [width,height] of [[1280,800],[1024,768]] as const){
    const fit=fitClassicStage(width-24,height-24)!;assert.ok(fit.width<=width-24+.0001);assert.ok(fit.height<=height-24+.0001);
    near(fit.width/fit.height,600/440);near(fit.width/fit.scale,600);near(fit.height/fit.scale,440);
    const vars=classicStageVariables(fit.scale);assert.equal(vars['--bartender-x'],'390px');assert.equal(vars['--message-x'],'402px');assert.equal(vars['--pour-x'],'22px');assert.equal(vars['--pour-y'],'389px');
  }
  const a=fitClassicStage(1256,776)!,b=fitClassicStage(1000,744)!;assert.notEqual(a.scale,b.scale);assert.ok(a.width>=1000&&a.width<=1080);assert.ok(b.width>=900&&b.width<=1000);
});
test('actual interaction rectangles stay at least 44 CSS px after scale and within safe bounds',()=>{
  const targets=[...Object.values(PRIMARY_BUTTON_BOUNDS),COLLECTION_BOUNDS,RESET_BOUNDS,SKIP_BOUNDS,ICE_BOUNDS,GARNISH_BOUNDS,bottleSlot(0).target];
  for(const scale of [456/440,1.2,1000/600,776/440,2.4])for(const visual of targets){const hit=interactionBounds(visual,scale);assert.ok(hit.width*scale>=44);assert.ok(hit.height*scale>=44);assert.ok(hit.x>=SAFE_BOUNDS.x);assert.ok(hit.y>=SAFE_BOUNDS.y);assert.ok(hit.x+hit.width<=592);assert.ok(hit.y+hit.height<=432);assert.ok(hit.x<=visual.x&&hit.y<=visual.y);assert.ok(hit.x+hit.width>=visual.x+visual.width);assert.ok(hit.y+hit.height>=visual.y+visual.height);}
});
test('hitbox growth preserves every visual face and reserves message scrolling above the action dock',()=>{
  for(const scale of [456/440,1000/600,776/440]){const vars=classicStageVariables(scale),hit=interactionBounds(RESET_BOUNDS,scale);
    near(Number.parseFloat(String(vars['--reset-x']))+Number.parseFloat(String(vars['--reset-face-x']))+MESSAGE_PANEL_BOUNDS.x,RESET_BOUNDS.x);
    near(Number.parseFloat(String(vars['--reset-y']))+Number.parseFloat(String(vars['--reset-face-y']))+MESSAGE_PANEL_BOUNDS.y,RESET_BOUNDS.y);
    assert.ok(Number.parseFloat(String(vars['--message-scroll-h']))+MESSAGE_PANEL_BOUNDS.y<hit.y);
    near(Number.parseFloat(String(vars['--collection-x']))+Number.parseFloat(String(vars['--collection-face-x']))+HUD_BOUNDS.x,COLLECTION_BOUNDS.x);
  }
});
test('fixed bottle slots have stable pitch, independent image/target bounds and paginate after four',()=>{
  for(let n=0;n<8;n++){const slot=bottleSlot(n);assert.equal(slot.centerX,70+(n%4)*85);assert.equal(slot.page,Math.floor(n/4));assert.equal(slot.visual.y+slot.visual.height,208);assert.deepEqual([slot.visual.width,slot.visual.height],[64,128]);assert.deepEqual([slot.target.width,slot.target.height],[72,142]);assert.equal(slot.target.x+36,slot.centerX);assert.equal(bottleSlotVariables(n)['--bottle-art-x'],'4px');}
  assert.throws(()=>bottleSlot(-1));assert.throws(()=>bottleSlot(.5));
});
test('nested CSS coordinates resolve to the same global station, meter and vessel anchors',()=>{
  const vars=classicStageVariables(1.7);const px=(key:string)=>Number.parseFloat(String(vars[`--${key}`]));
  near(px('counter-y')+px('mixing-y'),MIXING_BOUNDS.y);
  near(px('mixing-x')+px('shaker-x'),SHAKER_BOUNDS.x);near(COUNTER_BOUNDS.y+px('mixing-y')+px('shaker-y'),SHAKER_BOUNDS.y);
  near(MIXING_BOUNDS.x+px('meter-x'),METER_BOUNDS.x);near(METER_BOUNDS.x+px('fill-number-x'),FILL_READOUT_BOUNDS.x);
  assert.equal(vars['--ice-x'],'350px');assert.equal(vars['--garnish-x'],'406px');
});
test('portrait/mobile and short landscape switch to unscaled accessible flow at the documented breakpoint',()=>{
  for(const pair of [[1280,800],[1024,768],[960,480]])assert.equal(classicLandscape(...pair as [number,number]),true);
  for(const pair of [[768,1024],[390,844],[320,640],[959,700],[1024,479]])assert.equal(classicLandscape(...pair as [number,number]),false);
  assert.equal(fitClassicStage(0,0),null);assert.throws(()=>fitClassicStage(NaN,10));assert.throws(()=>interactionBounds(RESET_BOUNDS,0));
});
