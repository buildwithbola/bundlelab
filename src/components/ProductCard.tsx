"use client";

import React from "react";
import { Check, Eye, Minus, Plus } from "lucide-react";
import { formatCents } from "@/lib/bundleEngine";
import { ShopifyProduct } from "@/types/bundle";

interface ProductCardProps {
  product: ShopifyProduct;
  selectedVariantId: number;
  quantityInBundle: number;
  onSelectVariant: (productId: number, variantId: number) => void;
  onAdd: (productId: number, variantId: number) => void;
  onUpdateQty: (variantId: number, delta: number) => void;
  onQuickView: (product: ShopifyProduct) => void;
}

export function ProductCard({
  product,
  selectedVariantId,
  quantityInBundle,
  onSelectVariant,
  onAdd,
  onUpdateQty,
  onQuickView,
}: ProductCardProps) {
  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];
  const isSelected = quantityInBundle > 0;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <article
      data-testid={`product-card-${product.id}`}
      onPointerMove={handlePointerMove}
      className={`group bl-spotlight-card relative flex flex-col rounded-2xl bg-[var(--bl-surface)] p-3.5 sm:p-4 bl-card-sleek ${
        isSelected
          ? "border-2 border-[var(--bl-emerald)] ring-2 ring-[#34D399]/25"
          : "border border-[var(--bl-border)] hover:border-[var(--bl-border-strong)]"
      }`}
    >
      {/* Top Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--bl-bg-subtle)]">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 bl-spring group-hover:scale-[1.03]"
        />

        {/* Top-left Category / Badge Pill */}
        {product.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--bl-surface)]/92 backdrop-blur-sm border border-[var(--bl-border)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--bl-ink)]">
            {product.badge}
          </span>
        )}

        {/* Top-right Selected Mint Checkmark */}
        {isSelected && (
          <span
            aria-label={`${quantityInBundle} in bundle`}
            className="bl-animate-pop absolute right-2.5 top-2.5 inline-flex h-7 items-center gap-1 rounded-full bg-[#34D399] px-2.5 text-[11px] font-bold text-[#0F172A] shadow-sm"
          >
            <Check className="h-3.5 w-3.5 stroke-[2.75]" />
            <span className="bl-tabular">{quantityInBundle}</span>
          </span>
        )}

        {/* Quick View Button */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={`Quick view ${product.title}`}
          className="absolute bottom-2.5 right-2.5 inline-flex h-8 items-center gap-1 rounded-lg bg-[var(--bl-surface)]/92 backdrop-blur-sm border border-[var(--bl-border)] px-2.5 text-[11px] font-semibold text-[var(--bl-ink)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
          Details
        </button>
      </div>

      {/* Product Title & Price */}
      <div className="mt-3.5 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="font-mono-bl text-[10px] uppercase tracking-wider text-[var(--bl-ink-muted)] block">
              {product.category}
            </span>
            <h3 className="font-display text-[15px] font-bold leading-snug text-[var(--bl-ink)]">
              {product.title}
            </h3>
          </div>

          <div className="text-right shrink-0">
            <span className="bl-tabular text-[15px] font-bold text-[var(--bl-ink)] block">
              {formatCents(activeVariant.priceCents)}
            </span>
            {activeVariant.compareAtPriceCents &&
              activeVariant.compareAtPriceCents > activeVariant.priceCents && (
                <span className="bl-tabular text-[11px] text-[var(--bl-ink-muted)] line-through block">
                  {formatCents(activeVariant.compareAtPriceCents)}
                </span>
              )}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--bl-ink-muted)] line-clamp-2">
          {product.tagline}
        </p>

        {/* Variant Switcher */}
        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {product.variants.map((variant) => {
              const active = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onSelectVariant(product.id, variant.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-colors cursor-pointer ${
                    active
                      ? "border-[var(--bl-emerald)] bg-[var(--bl-emerald-soft)] text-[var(--bl-emerald)] dark:text-[#34D399]"
                      : "border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)]"
                  }`}
                >
                  {variant.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Stepper Action */}
      <div className="mt-4 pt-1">
        {!isSelected ? (
          <button
            type="button"
            data-testid={`add-product-${product.id}`}
            onClick={() => onAdd(product.id, activeVariant.id)}
            className="bl-btn-tactile w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bl-emerald)] bg-[var(--bl-surface)] hover:bg-[var(--bl-emerald)] text-[var(--bl-emerald)] dark:text-[#34D399] hover:text-white dark:hover:text-[#071311] px-4 text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add to Bundle
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bl-emerald)] p-1 text-white dark:text-[#071311] shadow-sm">
            <button
              type="button"
              aria-label={`Decrease quantity of ${product.title}`}
              onClick={() => onUpdateQty(activeVariant.id, -1)}
              className="inline-flex h-9 w-10 items-center justify-center rounded-lg hover:bg-white/15 active:scale-90 transition-all cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              key={quantityInBundle}
              className="bl-tabular bl-qty-pop text-xs font-bold tracking-wide"
            >
              {quantityInBundle} in Bundle
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${product.title}`}
              onClick={() => onUpdateQty(activeVariant.id, 1)}
              className="inline-flex h-9 w-10 items-center justify-center rounded-lg hover:bg-white/15 active:scale-90 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
