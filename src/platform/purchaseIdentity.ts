/** A fresh deliberate UI action gets a nonce; retries retain the same captured intent. */
let sequence=0;
export function newPurchaseNonce():string {
  return typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+(++sequence)+'-'+Math.random().toString(36).slice(2);
}
