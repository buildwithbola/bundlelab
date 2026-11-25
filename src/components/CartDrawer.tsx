"use client";

import React from "react";
import {
  CheckCircle2,
  Code2,
  Gift,
  RefreshCw,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { formatCents } from "@/lib/bundleEngine";
import { CartBundleGroup } from "@/types/bundle";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  bundles: CartBundleGroup[];
  onRemoveBundle: (bundleId: string) => void;
  onClearCart: () => void;
  onInspectPayload: () => void;
}

export function CartDrawer({
  open,
  onClose,
  bundles,
  onRemoveBundle,
  onClearCart,
  onInspectPayload,
}: CartDrawerProps) {
  if (!open) return null;

  const grandTotalCents = bundles.reduce((s, b) => s + b.finalTotalCents, 0);
  const grandSavingsCents = bundles.reduce((s, b) => s + b.totalSavingsCents, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopify Ajax Cart Drawer Simulator"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-[var(--bl-border)] bg-[var(--bl-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--bl-border)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[var(--bl-emerald)] dark:text-[#34D399]" />
            <div>
              <h2 className="font-display text-base font-bold text-[var(--bl-ink)]">
                Shopify Cart Drawer
              </h2>
              <p className="font-mono-bl text-[10px] text-[var(--bl-ink-muted)]">
                Simulated /cart/add.js Grouped State
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart drawer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bl-border)] text-[var(--bl-ink)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {bundles.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bl-bg-subtle)] text-[var(--bl-ink-muted)]">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="font-display text-sm font-bold text-[var(--bl-ink)]">
                Your simulated Shopify cart is empty
              </p>
              <p className="text-xs text-[var(--bl-ink-muted)] max-w-xs">
                Select products in the builder and click &ldquo;Add Bundle to Cart&rdquo; to batch all variants with grouped _bundle_id line properties.
              </p>
            </div>
          ) : (
            bundles.map((bundle) => (
              <div
                key={bundle.bundleId}
                data-testid={`cart-bundle-${bundle.bundleId}`}
                className="rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display text-sm font-bold text-[var(--bl-ink)]">
                        {bundle.bundleName}
                      </span>
                      <span className="rounded-full bg-[#A3E635] px-2 py-0.5 text-[10px] font-extrabold text-[#0F172A]">
                        {bundle.tierLabel}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono-bl text-[10px] text-[var(--bl-ink-muted)]">
                      <span>_bundle_id: {bundle.bundleId}</span>
                      {bundle.isSubscribed && (
                        <span className="inline-flex items-center gap-1 text-[var(--bl-emerald)] dark:text-[#34D399] font-semibold">
                          <RefreshCw className="h-3 w-3" />
                          30-Day Sub
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${bundle.bundleName}`}
                    onClick={() => onRemoveBundle(bundle.bundleId)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--bl-ink-muted)] hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 border-t border-[var(--bl-border)] pt-2.5">
                  {bundle.items.map((item) => (
                    <div
                      key={`${bundle.bundleId}-${item.variantId}`}
                      className="flex items-center gap-2.5"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-10 w-10 rounded-lg object-cover border border-[var(--bl-border)] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[var(--bl-ink)]">
                          {item.title}
                        </p>
                        <p className="bl-tabular text-[11px] text-[var(--bl-ink-muted)]">
                          {item.variantTitle} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="bl-tabular text-xs font-semibold text-[var(--bl-ink)]">
                        {formatCents(item.unitRetailCents * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {bundle.freeGiftIncluded && (
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-[#34D399]/15 px-2.5 py-1.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--bl-ink)]">
                        <Gift className="h-3.5 w-3.5 text-[#10B981]" />
                        Botanical Essence Mini
                      </span>
                      <span className="font-bold text-[var(--bl-emerald)] dark:text-[#34D399]">
                        FREE
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-[var(--bl-border)] pt-2.5 text-xs">
                  <span className="bl-tabular text-[var(--bl-emerald)] dark:text-[#34D399] font-semibold">
                    Saved {formatCents(bundle.totalSavingsCents)}
                  </span>
                  <span className="bl-tabular font-display text-sm font-extrabold text-[var(--bl-ink)]">
                    {formatCents(bundle.finalTotalCents)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {bundles.length > 0 && (
          <div className="border-t border-[var(--bl-border)] bg-[var(--bl-surface)] p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--bl-ink-muted)]">Total Bundle Savings</span>
              <span className="bl-tabular rounded-full bg-[#A3E635] px-2.5 py-0.5 font-extrabold text-[#0F172A]">
                -{formatCents(grandSavingsCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--bl-ink)]">
                Estimated Checkout Subtotal
              </span>
              <span className="bl-tabular font-display text-xl font-extrabold text-[var(--bl-ink)]">
                {formatCents(grandTotalCents)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onInspectPayload}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-3 text-xs font-bold text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
              >
                <Code2 className="h-4 w-4 text-[var(--bl-emerald)] dark:text-[#34D399]" />
                Inspect /cart/add.js
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-3 text-xs font-bold text-white dark:text-[#071311] cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Done Testing
              </button>
            </div>

            <button
              type="button"
              onClick={onClearCart}
              className="w-full text-center text-[11px] font-semibold text-[var(--bl-ink-muted)] hover:text-red-500 py-1 cursor-pointer"
            >
              Empty Simulated Cart
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
