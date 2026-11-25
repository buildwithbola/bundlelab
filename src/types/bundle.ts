export type PricingMode = "tiered_percent" | "fixed_price" | "free_gift";

export interface ShopifyVariant {
  id: number;
  title: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  available: boolean;
  sku: string;
  sellingPlanId?: number;
}

export interface ShopifyProduct {
  id: number;
  handle: string;
  title: string;
  vendor: string;
  category: string;
  tagline: string;
  description: string;
  highlights: string[];
  badge?: string;
  image: string;
  variants: ShopifyVariant[];
}

export interface BundleSelectionItem {
  productId: number;
  variantId: number;
  quantity: number;
}

export interface DiscountTier {
  id: string;
  minItems: number;
  discountPercent: number;
  label: string;
}

export interface MerchantConfig {
  storeName: string;
  pricingMode: PricingMode;
  targetSlots: 3 | 4 | 5;
  tiers: DiscountTier[];
  fixedBoxMinItems: number;
  fixedBoxPriceCents: number;
  freeGiftMinItems: number;
  allowSubscribeAndSave: boolean;
  subscribeExtraPercent: number;
}

export interface BundleLineComputed {
  product: ShopifyProduct;
  variant: ShopifyVariant;
  quantity: number;
  lineRetailCents: number;
}

export interface BundleCalculation {
  lines: BundleLineComputed[];
  totalItems: number;
  retailTotalCents: number;
  bundleDiscountCents: number;
  subscriptionDiscountCents: number;
  totalSavingsCents: number;
  finalTotalCents: number;
  effectiveDiscountPercent: number;
  activeTierLabel: string | null;
  nextMilestoneText: string;
  progressPercent: number;
  freeGiftUnlocked: boolean;
  isReadyToAdd: boolean;
}

export interface ShopifyAjaxCartItem {
  id: number;
  quantity: number;
  selling_plan?: number;
  properties: {
    _bundle_id: string;
    _bundle_name: string;
    _bundle_mode: PricingMode;
    _bundle_tier: string;
    _bundle_discount_pct: string;
  };
}

export interface ShopifyAjaxPayload {
  items: ShopifyAjaxCartItem[];
}

export interface CartBundleGroup {
  bundleId: string;
  bundleName: string;
  pricingMode: PricingMode;
  tierLabel: string;
  isSubscribed: boolean;
  createdAt: string;
  items: {
    productId: number;
    variantId: number;
    title: string;
    variantTitle: string;
    image: string;
    quantity: number;
    unitRetailCents: number;
  }[];
  freeGiftIncluded: boolean;
  retailTotalCents: number;
  totalSavingsCents: number;
  finalTotalCents: number;
  ajaxPayload: ShopifyAjaxPayload;
}

export interface StarterBundlePreset {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  items: BundleSelectionItem[];
}
