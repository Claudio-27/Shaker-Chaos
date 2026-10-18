/** Canonical definitions; ownership and balances live in the separate player profile. */
export type ContentVisibility = 'public' | 'private';
export type ContentKind = 'bartender' | 'environment' | 'counter' | 'effect' | 'bottle-set' | 'reaction-set' | 'ingredient' | 'recipe';
export type UnlockMetadata =
  | { readonly kind: 'default' }
  | { readonly kind: 'progression'; readonly requirementId: string }
  | { readonly kind: 'currency'; readonly currencyId: string; readonly availableFromLevel?: number }
  | { readonly kind: 'bundle-entitlement' | 'private-entitlement' | 'promotion' | 'development'; readonly entitlementId: string };
export interface PriceMetadata { readonly currency: string; readonly amount: number }
export interface ContentItem {
  readonly id: string; readonly displayName: string; readonly kind: ContentKind;
  readonly visibility: ContentVisibility; readonly visualDefinitionId: string;
  readonly unlock: readonly UnlockMetadata[]; readonly price?: PriceMetadata;
  readonly publication?:'published'|'unpublished';readonly ingredientId?:string;
}
export interface BundleDefinition {
  readonly id: string; readonly displayName: string; readonly visibility: ContentVisibility;
  readonly includedContentIds: readonly string[]; readonly price?: PriceMetadata;
}
export interface ContentCatalog { readonly items: readonly ContentItem[]; readonly bundles: readonly BundleDefinition[] }
/** A future authorized resolver supplies protected descriptors separately; no protected URL is public metadata. */
export interface ProtectedContentRequest { readonly contentId: string; readonly entitlementId: string }
export interface ProtectedContentDelivery {
  resolveAuthorized(request: ProtectedContentRequest): Promise<{ readonly url: string; readonly expiresAtMs: number }>;
}
