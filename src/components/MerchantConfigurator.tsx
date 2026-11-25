"use client";

import React from "react";
import { RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { DEFAULT_MERCHANT_CONFIG } from "@/data/defaultCatalog";
import { MerchantConfig, PricingMode } from "@/types/bundle";

interface MerchantConfiguratorProps {
  config: MerchantConfig;
  onChange: (next: MerchantConfig) => void;
}

const MODE_OPTIONS: {
  id: PricingMode;
  label: string;
  desc: string;
}[] = [
  {
    id: "tiered_percent",
    label: "Tiered % Off",
    desc: "Progressive savings as more slots fill (10% -> 15% -> 20%)",
  },
  {
    id: "fixed_price",
    label: "Fixed-Price Box",
    desc: "Flat bundle price once target item count is reached",
  },
  {
    id: "free_gift",
    label: "Free Gift Unlock",
    desc: "Auto-injects a complimentary $0.00 SKU at threshold",
  },
];

export function MerchantConfigurator({
  config,
  onChange,
}: MerchantConfiguratorProps) {
  const updateTierPercent = (tierId: string, pct: number) => {
    const safePct = Math.min(60, Math.max(1, Number.isFinite(pct) ? pct : 5));
    onChange({
      ...config,
      tiers: config.tiers.map((t) =>
        t.id === tierId
          ? {
              ...t,
              discountPercent: safePct,
              label: safePct >= 20 ? `${safePct}% OFF` : `Save ${safePct}%`,
            }
          : t
      ),
    });
  };

  return (
    <section
      aria-label="Merchant Bundle Rule Configurator"
      className="mb-6 rounded-2xl border-2 border-[var(--bl-emerald)]/35 bg-[var(--bl-surface)] p-4 sm:p-6 bl-card-shadow bl-animate-pop"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--bl-border)]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bl-emerald)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white dark:text-[#071311]">
              <SlidersHorizontal className="h-3 w-3" />
              Merchant Admin Preview
            </span>
            <span className="text-xs font-medium text-[var(--bl-ink-muted)]">
              Changes update storefront pricing &amp; Liquid export live
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--bl-ink)]">
            Configure Bundle Discount Mechanics
          </h2>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({
              ...DEFAULT_MERCHANT_CONFIG,
              storeName: config.storeName,
            })
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--bl-border)] px-3 py-1.5 text-xs font-semibold text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)] hover:border-[var(--bl-border-strong)] transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Rules
        </button>
      </div>

      {/* Pricing Model Selector */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {MODE_OPTIONS.map((opt) => {
          const active = config.pricingMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...config, pricingMode: opt.id })}
              className={`text-left rounded-xl border p-3.5 transition-all bl-spring cursor-pointer ${
                active
                  ? "border-[var(--bl-emerald)] bg-[var(--bl-emerald-soft)] ring-1 ring-[var(--bl-emerald)]"
                  : "border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] hover:border-[var(--bl-border-strong)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-[var(--bl-ink)]">
                  {opt.label}
                </span>
                <span
                  className={`h-3 w-3 rounded-full border ${
                    active
                      ? "border-[var(--bl-emerald)] bg-[#34D399]"
                      : "border-[var(--bl-border-strong)]"
                  }`}
                />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--bl-ink-muted)]">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Rule Fine-Tuning Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] p-4 md:grid-cols-12 md:items-center">
        {config.pricingMode === "tiered_percent" && (
          <div className="md:col-span-7 grid grid-cols-3 gap-2.5">
            {config.tiers.map((tier) => (
              <label
                key={tier.id}
                className="flex flex-col gap-1 rounded-lg border border-[var(--bl-border)] bg-[var(--bl-surface)] p-2.5"
              >
                <span className="font-mono-bl text-[11px] font-semibold text-[var(--bl-ink-muted)]">
                  {tier.minItems}+ items
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={tier.discountPercent}
                    onChange={(e) =>
                      updateTierPercent(tier.id, Number(e.target.value))
                    }
                    className="bl-tabular w-full bg-transparent text-sm font-bold text-[var(--bl-ink)] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#10B981]">%</span>
                </div>
              </label>
            ))}
          </div>
        )}

        {config.pricingMode === "fixed_price" && (
          <div className="md:col-span-7 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 rounded-lg border border-[var(--bl-border)] bg-[var(--bl-surface)] p-2.5">
              <span className="font-mono-bl text-[11px] font-semibold text-[var(--bl-ink-muted)]">
                Items per Box
              </span>
              <select
                value={config.fixedBoxMinItems}
                onChange={(e) =>
                  onChange({
                    ...config,
                    fixedBoxMinItems: Number(e.target.value),
                  })
                }
                className="bl-tabular bg-transparent text-sm font-bold text-[var(--bl-ink)] focus:outline-none"
              >
                <option value={2}>2-Pack Box</option>
                <option value={3}>3-Pack Box</option>
                <option value={4}>4-Pack Box</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 rounded-lg border border-[var(--bl-border)] bg-[var(--bl-surface)] p-2.5">
              <span className="font-mono-bl text-[11px] font-semibold text-[var(--bl-ink-muted)]">
                Box Price (USD)
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[var(--bl-ink-muted)]">
                  $
                </span>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={Math.round(config.fixedBoxPriceCents / 100)}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      fixedBoxPriceCents:
                        Math.max(15, Number(e.target.value) || 20) * 100,
                    })
                  }
                  className="bl-tabular w-full bg-transparent text-sm font-bold text-[var(--bl-ink)] focus:outline-none"
                />
              </div>
            </label>
          </div>
        )}

        {config.pricingMode === "free_gift" && (
          <div className="md:col-span-7 flex items-center gap-3 rounded-lg border border-[var(--bl-border)] bg-[var(--bl-surface)] p-3">
            <Sparkles className="h-5 w-5 text-[#34D399] shrink-0" />
            <div className="flex-1 text-xs text-[var(--bl-ink-muted)]">
              Unlock complimentary{" "}
              <strong className="text-[var(--bl-ink)]">
                Botanical Essence Mini ($18 value)
              </strong>{" "}
              at:
            </div>
            <select
              value={config.freeGiftMinItems}
              onChange={(e) =>
                onChange({
                  ...config,
                  freeGiftMinItems: Number(e.target.value),
                })
              }
              className="bl-tabular rounded-lg border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-2.5 py-1.5 text-xs font-bold text-[var(--bl-ink)]"
            >
              <option value={2}>2+ items</option>
              <option value={3}>3+ items</option>
              <option value={4}>4+ items</option>
            </select>
          </div>
        )}

        {/* Slot Tray Count + Subscribe & Save Toggle */}
        <div className="md:col-span-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--bl-ink-muted)]">
              Tray Slots:
            </span>
            {([3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ ...config, targetSlots: n })}
                className={`bl-tabular h-8 w-8 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  config.targetSlots === n
                    ? "border-[var(--bl-emerald)] bg-[var(--bl-emerald)] text-white dark:text-[#071311]"
                    : "border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--bl-ink)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.allowSubscribeAndSave}
              onChange={(e) =>
                onChange({
                  ...config,
                  allowSubscribeAndSave: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[#004C3F] rounded"
            />
            Subscribe +{config.subscribeExtraPercent}%
          </label>
        </div>
      </div>
    </section>
  );
}
