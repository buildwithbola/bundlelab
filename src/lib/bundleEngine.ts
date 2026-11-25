import { FREE_GIFT_SKU } from "@/data/defaultCatalog";
import {
  BundleCalculation,
  BundleLineComputed,
  BundleSelectionItem,
  MerchantConfig,
  ShopifyAjaxCartItem,
  ShopifyAjaxPayload,
  ShopifyProduct,
} from "@/types/bundle";

export function formatCents(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  return `$${(safe / 100).toFixed(2)}`;
}

export function calculateBundle(
  selections: BundleSelectionItem[],
  products: ShopifyProduct[],
  config: MerchantConfig,
  isSubscribed: boolean
): BundleCalculation {
  const lines: BundleLineComputed[] = [];

  for (const sel of selections) {
    if (sel.quantity <= 0) continue;
    const product = products.find((p) => p.id === sel.productId);
    if (!product) continue;
    const variant =
      product.variants.find((v) => v.id === sel.variantId) ?? product.variants[0];
    if (!variant) continue;

    lines.push({
      product,
      variant,
      quantity: sel.quantity,
      lineRetailCents: variant.priceCents * sel.quantity,
    });
  }

  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);
  const retailTotalCents = lines.reduce((sum, l) => sum + l.lineRetailCents, 0);

  let bundleDiscountCents = 0;
  let activeTierLabel: string | null = null;
  let nextMilestoneText = "";
  let progressPercent = 0;
  let freeGiftUnlocked = false;
  let isReadyToAdd = totalItems >= 1;

  if (config.pricingMode === "tiered_percent") {
    const sortedTiers = [...config.tiers].sort((a, b) => a.minItems - b.minItems);
    const maxMinItems =
      sortedTiers.length > 0
        ? sortedTiers[sortedTiers.length - 1].minItems
        : config.targetSlots;

    const matchedTier = [...sortedTiers]
      .reverse()
      .find((tier) => totalItems >= tier.minItems);

    if (matchedTier) {
      bundleDiscountCents = Math.round(
        (retailTotalCents * matchedTier.discountPercent) / 100
      );
      activeTierLabel = matchedTier.label;
    }

    const nextTier = sortedTiers.find((tier) => totalItems < tier.minItems);
    if (nextTier) {
      const remaining = nextTier.minItems - totalItems;
      nextMilestoneText = `Add ${remaining} more ${
        remaining === 1 ? "item" : "items"
      } to unlock ${nextTier.discountPercent}% OFF`;
    } else if (sortedTiers.length > 0) {
      nextMilestoneText = `Max ${
        sortedTiers[sortedTiers.length - 1].discountPercent
      }% bundle tier unlocked`;
    }

    progressPercent =
      maxMinItems > 0 ? Math.min(100, Math.round((totalItems / maxMinItems) * 100)) : 0;
  } else if (config.pricingMode === "fixed_price") {
    const req = Math.max(2, config.fixedBoxMinItems);
    progressPercent = Math.min(100, Math.round((totalItems / req) * 100));

    if (totalItems >= req) {
      // Box price applies to exact sets; extra items pro-rated cleanly at box average
      const boxUnitAverage = Math.round(config.fixedBoxPriceCents / req);
      const targetPrice =
        totalItems === req
          ? config.fixedBoxPriceCents
          : config.fixedBoxPriceCents + (totalItems - req) * boxUnitAverage;

      bundleDiscountCents = Math.max(0, retailTotalCents - targetPrice);
      activeTierLabel = `${req} for ${formatCents(config.fixedBoxPriceCents)}`;
      nextMilestoneText =
        totalItems === req
          ? `Fixed-price ${req}-pack box active`
          : `Box rate active across ${totalItems} items`;
    } else {
      const remaining = req - totalItems;
      isReadyToAdd = totalItems > 0;
      nextMilestoneText = `Add ${remaining} more ${
        remaining === 1 ? "item" : "items"
      } for ${formatCents(config.fixedBoxPriceCents)} flat box`;
    }
  } else {
    // free_gift mode
    const req = Math.max(2, config.freeGiftMinItems);
    progressPercent = Math.min(100, Math.round((totalItems / req) * 100));
    freeGiftUnlocked = totalItems >= req;

    if (freeGiftUnlocked) {
      const giftValue = FREE_GIFT_SKU.variants[0].priceCents;
      bundleDiscountCents = giftValue;
      activeTierLabel = "Free Gift Unlocked";
      nextMilestoneText = `Complimentary ${FREE_GIFT_SKU.title} (${formatCents(
        giftValue
      )} value) included`;
    } else {
      const remaining = req - totalItems;
      nextMilestoneText = `Add ${remaining} more ${
        remaining === 1 ? "item" : "items"
      } to unlock a Free ${FREE_GIFT_SKU.title}`;
    }
  }

  const afterBundleCents =
    config.pricingMode === "free_gift"
      ? retailTotalCents
      : Math.max(0, retailTotalCents - bundleDiscountCents);

  const canSubscribe = config.allowSubscribeAndSave && isSubscribed && totalItems > 0;
  const subscriptionDiscountCents = canSubscribe
    ? Math.round((afterBundleCents * config.subscribeExtraPercent) / 100)
    : 0;

  const finalTotalCents = Math.max(0, afterBundleCents - subscriptionDiscountCents);
  const totalSavingsCents =
    config.pricingMode === "free_gift"
      ? (freeGiftUnlocked ? FREE_GIFT_SKU.variants[0].priceCents : 0) +
        subscriptionDiscountCents
      : bundleDiscountCents + subscriptionDiscountCents;

  const effectiveBase =
    config.pricingMode === "free_gift" && freeGiftUnlocked
      ? retailTotalCents + FREE_GIFT_SKU.variants[0].priceCents
      : retailTotalCents;

  const effectiveDiscountPercent =
    effectiveBase > 0 ? Math.round((totalSavingsCents / effectiveBase) * 100) : 0;

  return {
    lines,
    totalItems,
    retailTotalCents,
    bundleDiscountCents,
    subscriptionDiscountCents,
    totalSavingsCents,
    finalTotalCents,
    effectiveDiscountPercent,
    activeTierLabel,
    nextMilestoneText,
    progressPercent,
    freeGiftUnlocked,
    isReadyToAdd,
  };
}

export function buildShopifyAjaxPayload(
  calc: BundleCalculation,
  config: MerchantConfig,
  isSubscribed: boolean,
  bundleId: string
): ShopifyAjaxPayload {
  const tierSummary = calc.activeTierLabel ?? "Standard Bundle";
  const items: ShopifyAjaxCartItem[] = calc.lines.map((line) => {
    const item: ShopifyAjaxCartItem = {
      id: line.variant.id,
      quantity: line.quantity,
      properties: {
        _bundle_id: bundleId,
        _bundle_name: `${config.storeName} Custom Bundle`,
        _bundle_mode: config.pricingMode,
        _bundle_tier: tierSummary,
        _bundle_discount_pct: `${calc.effectiveDiscountPercent}%`,
      },
    };
    if (isSubscribed && config.allowSubscribeAndSave && line.variant.sellingPlanId) {
      item.selling_plan = line.variant.sellingPlanId;
    }
    return item;
  });

  if (calc.freeGiftUnlocked) {
    items.push({
      id: FREE_GIFT_SKU.variants[0].id,
      quantity: 1,
      properties: {
        _bundle_id: bundleId,
        _bundle_name: `${config.storeName} Custom Bundle`,
        _bundle_mode: config.pricingMode,
        _bundle_tier: "Complimentary Gift ($0.00)",
        _bundle_discount_pct: "100%",
      },
    });
  }

  return { items };
}

export function encodeBundleToQuery(
  selections: BundleSelectionItem[],
  isSubscribed: boolean
): string {
  const params = new URLSearchParams();
  const compact = selections
    .filter((s) => s.quantity > 0)
    .map((s) => `${s.variantId}:${s.quantity}`)
    .join(",");
  if (compact) params.set("bundle", compact);
  if (isSubscribed) params.set("sub", "1");
  return params.toString();
}

export function decodeBundleFromQuery(
  bundleParam: string | null,
  products: ShopifyProduct[]
): BundleSelectionItem[] {
  if (!bundleParam) return [];
  const parsed: BundleSelectionItem[] = [];
  const parts = bundleParam.split(",");

  for (const part of parts) {
    const [varStr, qtyStr] = part.split(":");
    const variantId = Number(varStr);
    const quantity = Math.min(10, Math.max(1, Number(qtyStr) || 1));
    if (!Number.isFinite(variantId)) continue;

    const owner = products.find((p) => p.variants.some((v) => v.id === variantId));
    if (!owner) continue;
    parsed.push({
      productId: owner.id,
      variantId,
      quantity,
    });
  }

  return parsed;
}
