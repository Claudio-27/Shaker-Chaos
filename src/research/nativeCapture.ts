/** Research telemetry only. Fractional wall-clock time is never a canonical Flash tick or quantity. */
export interface NativeCapture {
  readonly sessionId: string;
  readonly coldLaunch: boolean;
  readonly swfSha256: string;
  readonly executableSha256: string;
  readonly ruffleVersion: string;
  readonly renderer: string;
  readonly os: 'Windows';
  readonly clock: 'Stopwatch / per-command monotonic milliseconds';
  readonly actions: readonly {
    readonly commandId: string;
    readonly semanticTarget: string;
    readonly requestedHoldMs: number;
    readonly measuredHoldMs: number;
    readonly downMs: number;
    readonly upMs: number;
    readonly window: { readonly width: number; readonly height: number; readonly dpi: number; readonly screenX: number; readonly screenY: number };
    readonly client: { readonly x: number; readonly y: number };
    readonly stage: { readonly x: number; readonly y: number };
    readonly stageScale: number;
    readonly buttonDownObserved?: boolean;
    readonly buttonUpObserved?: boolean;
    readonly captures: readonly string[];
  }[];
  readonly abortedActions?: readonly { readonly semanticTarget: string; readonly requestedHoldMs: number; readonly measuredHoldMs: number | null; readonly reason: string; readonly captures: readonly string[] }[];
  readonly resultCapture?: string;
  readonly reactionCaptures?: readonly string[];
  readonly traceFiles?: readonly string[];
  readonly visibleFill?: 'not-confirmed' | 'partial-visible' | 'full-indicator-visible';
  readonly fullIndicatorCapture?: string;
  readonly captureGaps?: readonly { readonly reason: string }[];
  readonly scoreRead?: { readonly score: number; readonly method: 'direct-visual' | 'digit-recognition' | 'ocr'; readonly confidence: 'low' | 'medium' | 'high'; readonly visuallyVerified: boolean; readonly capture: string };
}
function record(v: unknown): Record<string, unknown> { if (!v || typeof v !== 'object' || Array.isArray(v)) throw TypeError('Native object required'); return v as Record<string, unknown>; }
function keys(v: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []) { if(required.some(k=>!Object.hasOwn(v,k))||Object.keys(v).some(k=>![...required,...optional].includes(k)))throw TypeError('Native fields'); }
function text(v: unknown) { if(typeof v!=='string'||!v.trim())throw TypeError('Native text'); }
function integer(v: unknown,min=0) { if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min)throw TypeError('Native integer'); }
function number(v: unknown,min=0) { if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>Number.MAX_SAFE_INTEGER||v<min)throw TypeError('Native measurement'); }
function flag(v: unknown) { if(typeof v!=='boolean')throw TypeError('Native boolean'); }
function capture(v: unknown) { if(typeof v!=='string'||!/^research\/\.captures\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.png$/.test(v))throw TypeError('Unsafe native capture path'); }
function point(v: unknown) { const p=record(v);keys(p,['x','y']);integer(p.x);integer(p.y);return p; }
export function validateNativeCapture(value: unknown) {
 const v=record(value);keys(v,['sessionId','coldLaunch','swfSha256','executableSha256','ruffleVersion','renderer','os','clock','actions'],['resultCapture','scoreRead','reactionCaptures','traceFiles','visibleFill','fullIndicatorCapture','captureGaps','abortedActions']);
 for(const key of ['sessionId','ruffleVersion','renderer'])text(v[key]);flag(v.coldLaunch);
 if(v.swfSha256!=='ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7'||typeof v.executableSha256!=='string'||!/^[a-f0-9]{64}$/.test(v.executableSha256))throw TypeError('Native binary identity');
 if(v.os!=='Windows'||v.clock!=='Stopwatch / per-command monotonic milliseconds')throw TypeError('Native execution identity');
 if(!Array.isArray(v.actions)||(!v.actions.length&&!Array.isArray(v.abortedActions))||v.actions.length>10000)throw TypeError('Native actions');
 const clocks=new Map<string,number>();
 for(const item of v.actions){
  const a=record(item);keys(a,['commandId','semanticTarget','requestedHoldMs','measuredHoldMs','downMs','upMs','window','client','stage','stageScale','captures'],['buttonDownObserved','buttonUpObserved']);
  text(a.commandId);text(a.semanticTarget);integer(a.requestedHoldMs);if((a.requestedHoldMs as number)>15000)throw TypeError('Native hold limit');
  for(const k of ['measuredHoldMs','downMs','upMs','stageScale'])number(a[k]);if((a.stageScale as number)<=0)throw TypeError('Native scale');
  const elapsed=(a.upMs as number)-(a.downMs as number);
  if(elapsed<0||Math.abs(elapsed-(a.measuredHoldMs as number))>0.000001||(clocks.get(a.commandId as string)??0)>(a.downMs as number))throw TypeError('Native clock chronology');
  clocks.set(a.commandId as string,a.upMs as number);
  const w=record(a.window);keys(w,['width','height','dpi','screenX','screenY']);
  integer(w.width,1);integer(w.height,1);integer(w.dpi,1);for(const k of ['screenX','screenY'])integer(w[k],-Number.MAX_SAFE_INTEGER);
  const client=point(a.client);point(a.stage);if((client.x as number)>=(w.width as number)||(client.y as number)>=(w.height as number))throw TypeError('Native client bounds');
  for(const k of ['buttonDownObserved','buttonUpObserved'])if(k in a)flag(a[k]);
  if(!Array.isArray(a.captures)||!a.captures.length)throw TypeError('Native capture references');a.captures.forEach(capture);
 }
 if('abortedActions'in v){if(!Array.isArray(v.abortedActions)||!v.abortedActions.length)throw TypeError('Native abort details required');for(const row of v.abortedActions){const a=record(row);keys(a,['semanticTarget','requestedHoldMs','measuredHoldMs','reason','captures']);text(a.semanticTarget);integer(a.requestedHoldMs);if((a.requestedHoldMs as number)>15000)throw TypeError('Native hold limit');if(a.measuredHoldMs!==null)number(a.measuredHoldMs);text(a.reason);if(!Array.isArray(a.captures)||!a.captures.length)throw TypeError('Native abort captures');a.captures.forEach(capture);}}
 if('resultCapture'in v)capture(v.resultCapture);
 if('fullIndicatorCapture'in v)capture(v.fullIndicatorCapture);
 if('visibleFill'in v && !['not-confirmed','partial-visible','full-indicator-visible'].includes(v.visibleFill as string))throw TypeError('Native fill observation');
 if('reactionCaptures'in v){if(!Array.isArray(v.reactionCaptures))throw TypeError('Native reaction captures');v.reactionCaptures.forEach(capture);}
 if('traceFiles'in v){if(!Array.isArray(v.traceFiles)||v.traceFiles.some(p=>typeof p!=='string'||!/^research\/\.local-reference\/[A-Za-z0-9_-]+\.json$/.test(p)))throw TypeError('Native trace path');}
 if('captureGaps'in v){if(!Array.isArray(v.captureGaps))throw TypeError('Native capture gaps');for(const item of v.captureGaps){const gap=record(item);keys(gap,['reason']);text(gap.reason);}}
 if('scoreRead'in v){const read=record(v.scoreRead);keys(read,['score','method','confidence','visuallyVerified','capture']);number(read.score,-Number.MAX_SAFE_INTEGER);capture(read.capture);flag(read.visuallyVerified);if(!['direct-visual','digit-recognition','ocr'].includes(read.method as string)||!['low','medium','high'].includes(read.confidence as string))throw TypeError('Native score reading');}
}
