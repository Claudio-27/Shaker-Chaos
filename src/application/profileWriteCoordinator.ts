export interface ProfileWriteCoordinator {
  readonly mode:'WEB_LOCKS'|'FALLBACK'|'SYNCHRONOUS_TEST';
  run<T>(work:()=>T):T|Promise<T>;
  subscribe(listener:()=>void):()=>void;notify():void;
}
/** Deterministic default for isolated application/unit fixtures, never the browser production adapter. */
export const synchronousProfileWrites:ProfileWriteCoordinator={mode:'SYNCHRONOUS_TEST',run:work=>work(),subscribe:()=>()=>{},notify(){}};
