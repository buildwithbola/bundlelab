"use client";

import React, { useState } from "react";
import {
  Check,
  ChevronUp,
  Gift,
  Loader2,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FREE_GIFT_SKU } from "@/data/defaultCatalog";
import { formatCents } from "@/lib/bundleEngine";
import { BundleCalculation, MerchantConfig } from "@/types/bundle";
import { AnimatedCurrency } from "./AnimatedCurrency";

interface StickyBundleDockProps {
  calc: BundleCalculation;
  config: MerchantConfig;
  isSubscribed: boolean;
  onToggleSubscribe: (val: boolean) => void;
  onUpdateQty: (variantId: number, delta: number) => void;
  onRemoveVariant: (variantId: number) => void;
  onClearAll: () => void;
  addState: "idle" | "adding" | "added";
  onAddBundleToCart: () => void;
  tierPulseKey: number;
}

export function StickyBundleDock({
  calc,
  config,
  isSubscribed,
  onToggleSubscribe,
  onUpdateQty,
  onRemoveVariant,
  onClearAll,
  addState,
  onAddBundleToCart,
  tierPulseKey,
}: StickyBundleDockProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Build visual slot tray up to config.targetSlots (expanding if user adds more)
  const flattenedUnits: {
    key: string;
    variantId: number;
    title: string;
    variantTitle: string;
    image: string;
    priceCents: number;
  }[] = [];

  for (const line of calc.lines) {
    for (let i = 0; i < line.quantity; i += 1) {
      flattenedUnits.push({
        key: `${line.variant.id}-${i}`,
        variantId: line.variant.id,
        title: line.product.title,
        variantTitle: line.variant.title,
        image: line.product.image,
        priceCents: line.variant.priceCents,
      });
    }
  }

  const slotCount = Math.max(config.targetSlots, flattenedUnits.length);

  const DockContent = (
    <div className="flex flex-col">
      {/* Dock Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--bl-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-[var(--bl-ink)]">
              Your Custom Bundle
            </h2>
            <span
              data-testid="dock-slot-counter"
              className="bl-tabular rounded-full bg-[var(--bl-bg-subtle)] border border-[var(--bl-border)] px-2 py-0.5 text-[11px] font-bold text-[var(--bl-ink)]"
            >
              {calc.totalItems} of {config.targetSlots}
            </span>
          </div>
          <p className="text-[11px] text-[var(--bl-ink-muted)] mt-0.5">
            {calc.nextMilestoneText}
          </p>
        </div>

        {calc.totalItems > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--bl-ink-muted)] hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Progress Bar & Milestone Pill */}
      <div className="py-3 border-b border-[var(--bl-border)]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-[var(--bl-ink)]">
            Live Savings Progress
          </span>
          {calc.activeTierLabel ? (
            <span
              key={tierPulseKey}
              data-testid="active-tier-pill"
              className="bl-tabular bl-tier-pulse inline-flex items-center gap-1 rounded-full bg-[#A3E635] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0F172A]"
            >
              <Sparkles className="h-3 w-3" />
              {calc.activeTierLabel}
            </span>
          ) : (
            <span className="font-mono-bl text-[11px] text-[var(--bl-ink-muted)]">
              0% unlocked
            </span>
          )}
        </div>

        <div
          role="progressbar"
          aria-valuenow={calc.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--bl-bg-subtle)] border border-[var(--bl-border)]"
        >
          <div
            className="bl-progress-shimmer h-full rounded-full bg-[#34D399] transition-all duration-500 bl-spring"
            style={{ width: `${calc.progressPercent}%` }}
          />
        </div>

        {config.pricingMode === "tiered_percent" && (
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono-bl text-[var(--bl-ink-muted)]">
            {config.tiers.map((t) => {
              const reached = calc.totalItems >= t.minItems;
              return (
                <span
                  key={t.id}
                  className={
                    reached
                      ? "font-bold text-[var(--bl-emerald)] dark:text-[#34D399]"
                      : ""
                  }
                >
                  {t.minItems} items · {t.discountPercent}%
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Visual Slot Wells */}
      <div className="py-3 space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
        {/* Compact Thumbnail Slot Dots Row */}
        <div className="grid grid-cols-4 gap-2 pb-1">
          {Array.from({ length: Math.min(4, slotCount) }).map((_, idx) => {
            const unit = flattenedUnits[idx];
            if (unit) {
              return (
                <div
                  key={`thumb-${unit.key}`}
                  className="bl-animate-pop relative aspect-square rounded-xl border-2 border-[var(--bl-emerald)] bg-[var(--bl-bg-subtle)] overflow-hidden"
                >
                  <img
                    src={unit.image}
                    alt={unit.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#34D399] text-[#0F172A]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </div>
              );
            }
            return (
              <div
                key={`empty-${idx}`}
                className="flex flex-col items-center justify-center aspect-square rounded-xl border border-dashed border-[var(--bl-border-strong)] bg-[var(--bl-bg-subtle)]/60 text-[var(--bl-ink-muted)]"
              >
                <Package className="h-4 w-4 opacity-50" />
                <span className="font-mono-bl text-[9px] mt-1 opacity-70">
                  Slot {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Line Item List */}
        {calc.lines.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {calc.lines.map((line) => (
              <div
                key={line.variant.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-2.5 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[var(--bl-ink)]">
                    {line.product.title}
                  </p>
                  <p className="bl-tabular text-[11px] text-[var(--bl-ink-muted)] truncate">
                    {line.variant.title} · {formatCents(line.lineRetailCents)}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.product.title}`}
                    onClick={() => onUpdateQty(line.variant.id, -1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="bl-tabular w-5 text-center text-xs font-bold text-[var(--bl-ink)]">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.product.title}`}
                    onClick={() => onUpdateQty(line.variant.id, 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${line.product.title}`}
                    onClick={() => onRemoveVariant(line.variant.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--bl-ink-muted)] hover:text-red-500 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Free Gift Unlocked Row */}
        {calc.freeGiftUnlocked && (
          <div className="bl-animate-pop flex items-center gap-2.5 rounded-xl border border-[#34D399]/60 bg-[#34D399]/14 px-2.5 py-2">
            <img
              src={FREE_GIFT_SKU.image}
              alt={FREE_GIFT_SKU.title}
              className="h-9 w-9 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[var(--bl-ink)]">
                {FREE_GIFT_SKU.title}
              </p>
              <p className="text-[11px] text-[var(--bl-ink-muted)]">
                Complimentary gift unlocked
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#A3E635] px-2 py-0.5 text-[10px] font-extrabold text-[#0F172A] shrink-0">
              <Gift className="h-3 w-3" />
              FREE
            </span>
          </div>
        )}
      </div>

      {/* Subscribe & Save Toggle */}
      {config.allowSubscribeAndSave && (
        <div className="py-3 border-t border-[var(--bl-border)]">
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] p-1">
            <button
              type="button"
              onClick={() => onToggleSubscribe(false)}
              className={`rounded-lg py-2 px-2 text-[11px] font-semibold transition-all cursor-pointer ${
                !isSubscribed
                  ? "bg-[var(--bl-surface)] text-[var(--bl-ink)] shadow-sm"
                  : "text-[var(--bl-ink-muted)]"
              }`}
            >
              One-Time Purchase
            </button>
            <button
              type="button"
              data-testid="subscribe-toggle-btn"
              onClick={() => onToggleSubscribe(true)}
              className={`inline-flex items-center justify-center gap-1 rounded-lg py-2 px-2 text-[11px] font-bold transition-all cursor-pointer ${
                isSubscribed
                  ? "bg-[var(--bl-emerald)] text-white dark:text-[#071311] shadow-sm"
                  : "text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)]"
              }`}
            >
              <RefreshCw className="h-3 w-3" />
              Sub +{config.subscribeExtraPercent}% OFF
            </button>
          </div>
        </div>
      )}

      {/* Live Savings & Price Breakdown */}
      <div className="py-3 border-t border-[var(--bl-border)] space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--bl-ink-muted)]">
          <span>Retail Value</span>
          <AnimatedCurrency cents={calc.retailTotalCents} className="line-through" />
        </div>

        {calc.bundleDiscountCents > 0 && (
          <div className="flex items-center justify-between text-xs font-medium text-[var(--bl-emerald)] dark:text-[#34D399]">
            <span>
              {config.pricingMode === "free_gift"
                ? "Free Gift Value"
                : "Bundle Tier Savings"}
            </span>
            <AnimatedCurrency cents={calc.bundleDiscountCents} prefix="-" />
          </div>
        )}

        {calc.subscriptionDiscountCents > 0 && (
          <div className="flex items-center justify-between text-xs font-medium text-[var(--bl-emerald)] dark:text-[#34D399]">
            <span>Subscribe &amp; Save ({config.subscribeExtraPercent}%)</span>
            <AnimatedCurrency
              cents={calc.subscriptionDiscountCents}
              prefix="-"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-dashed border-[var(--bl-border)]">
          <div>
            <span className="text-xs font-semibold text-[var(--bl-ink-muted)] block">
              Bundle Price
            </span>
            {calc.totalSavingsCents > 0 && (
              <span
                data-testid="dock-savings-pill"
                className="bl-tabular mt-1 inline-flex items-center gap-1 rounded-full bg-[#A3E635] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0F172A]"
              >
                You Save <AnimatedCurrency cents={calc.totalSavingsCents} /> (
                {calc.effectiveDiscountPercent}% OFF)
              </span>
            )}
          </div>
          <AnimatedCurrency
            cents={calc.finalTotalCents}
            className="font-display text-2xl font-extrabold text-[var(--bl-ink)]"
          />
        </div>
      </div>

      {/* Primary One-Click Ajax Cart CTA */}
      <button
        type="button"
        data-testid="add-bundle-cta"
        disabled={!calc.isReadyToAdd || addState === "adding"}
        onClick={onAddBundleToCart}
        className="bl-btn-tactile bl-shimmer-sweep mt-1 w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] disabled:opacity-45 px-5 text-sm font-bold text-white dark:text-[#071311] cursor-pointer disabled:cursor-not-allowed"
      >
        {addState === "adding" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding {calc.totalItems} items to /cart/add.js...
          </>
        ) : addState === "added" ? (
          <>
            <Check className="h-4 w-4 stroke-[2.75]" />
            Added Bundle to Cart ✓
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            Add Bundle to Cart
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Dock */}
      <aside
        aria-label="Bundle Builder Summary"
        data-tour="bundle-dock"
        className="hidden lg:block w-full lg:w-[390px] shrink-0 lg:sticky lg:top-24 rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-surface)] p-5 bl-dock-shadow"
      >
        {DockContent}
      </aside>

      {/* Mobile Sticky Bottom Thumb-Zone Bar */}
      <div
        data-tour="bundle-dock"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--bl-border)] bg-[var(--bl-surface)]/96 backdrop-blur-md px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]"
      >
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bl-bg-subtle)] mb-2.5">
          <div
            className="h-full rounded-full bg-[#34D399] transition-all duration-300"
            style={{ width: `${calc.progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setMobileExpanded(true)}
            className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: config.targetSlots }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    i < calc.totalItems
                      ? "bg-[#34D399]"
                      : "bg-[var(--bl-border-strong)]"
                  }`}
                />
              ))}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <AnimatedCurrency
                  cents={calc.finalTotalCents}
                  className="font-display text-base font-extrabold text-[var(--bl-ink)]"
                />
                {calc.totalSavingsCents > 0 && (
                  <span className="bl-tabular rounded-full bg-[#A3E635] px-2 py-0.5 text-[10px] font-extrabold text-[#0F172A] shrink-0">
                    -<AnimatedCurrency cents={calc.totalSavingsCents} />
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[var(--bl-ink-muted)] inline-flex items-center gap-1 truncate">
                {calc.totalItems}/{config.targetSlots} slots · Tap details
                <ChevronUp className="h-3 w-3" />
              </span>
            </div>
          </button>

          <button
            type="button"
            disabled={!calc.isReadyToAdd || addState === "adding"}
            onClick={onAddBundleToCart}
            className="min-h-[44px] shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] disabled:opacity-45 px-4 text-xs font-bold text-white dark:text-[#071311] cursor-pointer"
          >
            {addState === "adding" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : addState === "added" ? (
              "Added ✓"
            ) : (
              "Add Bundle"
            )}
          </button>
        </div>
      </div>

      {/* Mobile Expanded Sheet Modal */}
      {mobileExpanded && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-xs"
          onClick={() => setMobileExpanded(false)}
        >
          <div
            className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-[var(--bl-border)] bg-[var(--bl-surface)] p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                aria-label="Close bundle sheet"
                onClick={() => setMobileExpanded(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] text-[var(--bl-ink)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {DockContent}
          </div>
        </div>
      )}
    </>
  );
}
