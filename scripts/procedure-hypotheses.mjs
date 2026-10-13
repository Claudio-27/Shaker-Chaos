// Pure research constraints; no coefficients, prediction or automatic promotion.
export function evaluateShakeExplanations(runs){
 const samples=runs.filter(r=>r.outcome==='COMPLETED_INPUT'&&r.review?.visuallyVerified===true&&Number.isSafeInteger(r.review.score)&&r.requestedProcedure?.actions.filter(a=>a.target==='pour').length===1&&r.requestedProcedure.actions.find(a=>a.target==='pour').holdMs===15000&&!r.requestedProcedure.actions.some(a=>a.target==='garnishVisible'||a.target==='garnish'||a.target==='iceVisible'||a.target==='ice')).map(r=>{
  const shakes=r.requestedProcedure.actions.filter(a=>a.target==='shake');
  return {id:r.id,count:shakes.length,requestedTotalMs:shakes.reduce((n,a)=>n+a.holdMs,0),score:r.review.score,exploded:r.review.exploded??null,requestedHolds:shakes.map(a=>a.holdMs),actualHolds:r.delivery?.filter(a=>a.target==='shake').map(a=>a.actualMs)??[],evidence:'Native procedure, not accepted domain Shake count'};
 });
 const conflicts=key=>[...new Set(samples.map(s=>s[key]))].map(value=>({value,ids:samples.filter(s=>s[key]===value).map(s=>s.id),scores:[...new Set(samples.filter(s=>s[key]===value).map(s=>s.score))]})).filter(g=>g.scores.length>1);
 return {label:'RESEARCH ONLY — NOT GAME MECHANICS — NOT PRODUCTION READY',samples,pressCountOnly:{status:conflicts('count').length?'CONTRADICTED BY PROCEDURE DATA':'NOT YET TESTABLE',conflicts:conflicts('count')},requestedTotalDurationOnly:{status:conflicts('requestedTotalMs').length?'CONTRADICTED BY PROCEDURE DATA':'NOT YET TESTABLE',conflicts:conflicts('requestedTotalMs')},countAndDuration:'NOT FIT; does not imply accepted-count, internal-duration or effective-action mapping',discreteBonus:'NOT YET TESTABLE AS INTERNAL RULE',actualInternalDuration:'UNMEASURED',modelStatus:'NO_CANDIDATE'};
}

