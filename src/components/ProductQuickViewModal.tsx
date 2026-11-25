"use client";

import React, { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { formatCents } from "@/lib/bundleEngine";
import { ShopifyProduct } from "@/types/bundle";

interface ProductQuickViewModalProps {
  product: ShopifyProduct | null;
  selectedVariantId: number;
  onSelectVariant: (productId: number, variantId: number) => void;
  onAdd: (productId: number, variantId: number) => void;
  onClose: () => void;
}

export function ProductQuickViewModal({
  product,
  selectedVariantId,
  onSelectVariant,
  onAdd,
  onClose,
}: ProductQuickViewModalProps) {
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setJustAdded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return null;

  const variant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const handleAdd = () => {
    onAdd(product.id, variant.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bl-animate-pop relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--bl-border)] bg-[var(--bl-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="aspect-square bg-[var(--bl-bg-subtle)]">
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <span className="font-mono-bl text-[11px] uppercase tracking-wider text-[var(--bl-ink-muted)]">
                  {product.vendor} · {product.category}
                </span>
                <h3 className="font-display text-xl font-bold text-[var(--bl-ink)] mt-1">
                  {product.title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="bl-tabular font-display text-lg font-extrabold text-[var(--bl-emerald)] dark:text-[#34D399]">
                    {formatCents(variant.priceCents)}
                  </span>
                  {variant.compareAtPriceCents &&
                    variant.compareAtPriceCents > variant.priceCents && (
                      <span className="bl-tabular text-xs text-[var(--bl-ink-muted)] line-through">
                        {formatCents(variant.compareAtPriceCents)}
                      </span>
                    )}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[var(--bl-ink-muted)]">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {product.highlights.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--bl-ink)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {product.variants.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-[var(--bl-ink-muted)] block">
                    Select Variant
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.variants.map((v) => {
                      const active = v.id === variant.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => onSelectVariant(product.id, v.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                            active
                              ? "border-[var(--bl-emerald)] bg-[var(--bl-emerald-soft)] text-[var(--bl-emerald)] dark:text-[#34D399]"
                              : "border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] text-[var(--bl-ink)]"
                          }`}
                        >
                          {v.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-4 text-xs font-bold text-white dark:text-[#071311] transition-colors cursor-pointer"
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Bundle!
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add {variant.title} to Bundle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
