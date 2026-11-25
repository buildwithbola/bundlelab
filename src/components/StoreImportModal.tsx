"use client";

import React, { useState } from "react";
import { Globe, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { ShopifyProduct } from "@/types/bundle";

interface StoreImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (storeName: string, products: ShopifyProduct[]) => void;
  onResetDefault: () => void;
  isImportedStore: boolean;
}

const SAMPLE_STORES = ["allbirds.com", "ridge.com", "brooklinen.com"];

export function StoreImportModal({
  open,
  onClose,
  onImported,
  onResetDefault,
  isImportedStore,
}: StoreImportModalProps) {
  const [urlInput, setUrlInput] = useState("allbirds.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleFetch = async (targetUrl?: string) => {
    const urlToLoad = (targetUrl ?? urlInput).trim();
    if (!urlToLoad) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/import-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToLoad }),
      });
      const data = (await res.json()) as {
        error?: string;
        storeName?: string;
        products?: ShopifyProduct[];
      };

      if (!res.ok || !data.products) {
        setError(data.error || "Unable to fetch /products.json from that store.");
        return;
      }

      onImported(data.storeName || "Live Store", data.products);
      onClose();
    } catch {
      setError("Network error while contacting store catalog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Import Live Shopify Store Catalog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bl-animate-pop w-full max-w-lg rounded-3xl border border-[var(--bl-border)] bg-[var(--bl-surface)] p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34D399]/18 px-2.5 py-0.5 text-[11px] font-bold text-[var(--bl-emerald)] dark:text-[#34D399]">
              <Globe className="h-3 w-3" />
              Live Shopify /products.json Loader
            </span>
            <h3 className="font-display text-lg font-bold text-[var(--bl-ink)] mt-1.5">
              Test BundleLab on Any Shopify Store
            </h3>
            <p className="text-xs text-[var(--bl-ink-muted)] mt-1">
              Fetches live public product titles, variants, pricing, and photos from a Shopify store so merchants can preview BundleLab with their own catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bl-border)] text-[var(--bl-ink)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleFetch();
          }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. allbirds.com"
              className="flex-1 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--bl-ink)] focus:border-[var(--bl-emerald)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] disabled:opacity-50 px-4 text-xs font-bold text-white dark:text-[#071311] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Store"
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-[var(--bl-ink-muted)]">
              Try public Shopify stores:
            </span>
            {SAMPLE_STORES.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => {
                  setUrlInput(domain);
                  void handleFetch(domain);
                }}
                className="rounded-full border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] hover:border-[var(--bl-emerald)] px-2.5 py-1 text-[11px] font-semibold text-[var(--bl-ink)] cursor-pointer"
              >
                {domain}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}
        </form>

        {isImportedStore && (
          <div className="pt-2 border-t border-[var(--bl-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--bl-ink-muted)] inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#34D399]" />
              Currently viewing imported catalog
            </span>
            <button
              type="button"
              onClick={() => {
                onResetDefault();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--bl-border)] px-3 py-1.5 text-xs font-semibold text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore Verdant Lab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
