"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Compass, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import {
  DEFAULT_MERCHANT_CONFIG,
  DEFAULT_PRODUCTS,
  STARTER_PRESETS,
} from "@/data/defaultCatalog";
import {
  buildShopifyAjaxPayload,
  calculateBundle,
  decodeBundleFromQuery,
  encodeBundleToQuery,
} from "@/lib/bundleEngine";
import { playCartSuccess, playSlotPop, playTierUnlock } from "@/lib/studioSound";
import {
  BundleSelectionItem,
  CartBundleGroup,
  MerchantConfig,
  ShopifyProduct,
  StarterBundlePreset,
} from "@/types/bundle";
import { CartDrawer } from "./CartDrawer";
import { GuidedBuilderTour } from "./GuidedBuilderTour";
import { HeaderBar } from "./HeaderBar";
import { MerchantConfigurator } from "./MerchantConfigurator";
import { ProductCard } from "./ProductCard";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { ShopifyInspectorDrawer } from "./ShopifyInspectorDrawer";
import { StarterBundlesBar } from "./StarterBundlesBar";
import { StickyBundleDock } from "./StickyBundleDock";
import { StoreImportModal } from "./StoreImportModal";

export function BundleLabApp() {
  const searchParams = useSearchParams();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mode, setMode] = useState<"shopper" | "merchant">("shopper");

  const [products, setProducts] = useState<ShopifyProduct[]>(DEFAULT_PRODUCTS);
  const [isImportedStore, setIsImportedStore] = useState(false);
  const [config, setConfig] = useState<MerchantConfig>(DEFAULT_MERCHANT_CONFIG);

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>(
    () => {
      const map: Record<number, number> = {};
      DEFAULT_PRODUCTS.forEach((p) => {
        if (p.variants[0]) map[p.id] = p.variants[0].id;
      });
      return map;
    }
  );

  // Pre-seed 2 items on first load so visitors immediately see live dock & savings math
  const [selections, setSelections] = useState<BundleSelectionItem[]>([
    { productId: 1001, variantId: 44100101, quantity: 1 },
    { productId: 1002, variantId: 44100201, quantity: 1 },
  ]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [quickViewProduct, setQuickViewProduct] =
    useState<ShopifyProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [addState, setAddState] = useState<"idle" | "adding" | "added">("idle");
  const [cartBundles, setCartBundles] = useState<CartBundleGroup[]>([]);
  const [tierPulseKey, setTierPulseKey] = useState(0);

  const hydratedRef = useRef(false);
  const prevTierRef = useRef<string | null>(null);

  // Sync theme state from DOM & localStorage
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") {
      setTheme(current);
    }
    try {
      const savedCart = localStorage.getItem("bundlelab-cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartBundleGroup[];
        if (Array.isArray(parsed)) setCartBundles(parsed);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Hydrate deep-link query params (?mode=merchant, ?import=1, ?code=1, ?bundle=..., ?sub=1) once on mount
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const modeParam = searchParams.get("mode");
    const importParam = searchParams.get("import");
    const codeParam = searchParams.get("code");
    const tourParam = searchParams.get("tour");
    const bundleQuery = searchParams.get("bundle");
    const subQuery = searchParams.get("sub");

    if (modeParam === "merchant") {
      setMode("merchant");
    }
    if (importParam === "1") {
      setImportOpen(true);
    }
    if (codeParam === "1") {
      setInspectorOpen(true);
    }
    if (tourParam === "1") {
      setTourOpen(true);
    }
    if (bundleQuery) {
      const decoded = decodeBundleFromQuery(bundleQuery, DEFAULT_PRODUCTS);
      if (decoded.length > 0) {
        setSelections(decoded);
        setSelectedVariants((prev) => {
          const next = { ...prev };
          decoded.forEach((d) => {
            next[d.productId] = d.variantId;
          });
          return next;
        });
      }
    }
    if (subQuery === "1") {
      setIsSubscribed(true);
    }
  }, [searchParams]);

  // Persist simulated Shopify cart
  useEffect(() => {
    try {
      localStorage.setItem("bundlelab-cart", JSON.stringify(cartBundles));
    } catch {
      // Ignore storage error
    }
  }, [cartBundles]);

  const calc = useMemo(
    () => calculateBundle(selections, products, config, isSubscribed),
    [selections, products, config, isSubscribed]
  );

  // Pulse badge & optional chime whenever a new discount tier unlocks
  useEffect(() => {
    if (calc.activeTierLabel && calc.activeTierLabel !== prevTierRef.current) {
      setTierPulseKey((k) => k + 1);
      if (prevTierRef.current !== null) {
        playTierUnlock(soundEnabled);
      }
    }
    prevTierRef.current = calc.activeTierLabel;
  }, [calc.activeTierLabel, soundEnabled]);

  const previewPayload = useMemo(
    () =>
      buildShopifyAjaxPayload(
        calc,
        config,
        isSubscribed,
        `bl_${config.storeName.toLowerCase().replace(/\s+/g, "_")}_preview`
      ),
    [calc, config, isSubscribed]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("bundlelab-theme", next);
    } catch {
      // Ignore storage error
    }
  };

  const handleSelectVariant = (productId: number, variantId: number) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddProduct = (productId: number, variantId: number) => {
    playSlotPop(soundEnabled);
    setSelections((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, variantId, quantity: 1 }];
    });
  };

  const handleUpdateQty = (variantId: number, delta: number) => {
    playSlotPop(soundEnabled);
    setSelections((prev) =>
      prev
        .map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveVariant = (variantId: number) => {
    setSelections((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const handleApplyPreset = (preset: StarterBundlePreset) => {
    playTierUnlock(soundEnabled);
    setSelections(preset.items);
    setSelectedVariants((prev) => {
      const next = { ...prev };
      preset.items.forEach((item) => {
        next[item.productId] = item.variantId;
      });
      return next;
    });
  };

  const handleCopyShareLink = async () => {
    const query = encodeBundleToQuery(selections, isSubscribed);
    const url = `${window.location.origin}${window.location.pathname}${
      query ? `?${query}` : ""
    }`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback
    }
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
  };

  const handleAddBundleToCart = () => {
    if (!calc.isReadyToAdd || addState === "adding") return;
    setAddState("adding");

    setTimeout(() => {
      const bundleId = `bl_${Math.random().toString(36).slice(2, 8)}`;
      const ajaxPayload = buildShopifyAjaxPayload(
        calc,
        config,
        isSubscribed,
        bundleId
      );

      const newGroup: CartBundleGroup = {
        bundleId,
        bundleName: `${config.storeName} Custom Bundle`,
        pricingMode: config.pricingMode,
        tierLabel: calc.activeTierLabel ?? "Custom Bundle",
        isSubscribed: config.allowSubscribeAndSave && isSubscribed,
        createdAt: new Date().toISOString(),
        items: calc.lines.map((line) => ({
          productId: line.product.id,
          variantId: line.variant.id,
          title: line.product.title,
          variantTitle: line.variant.title,
          image: line.product.image,
          quantity: line.quantity,
          unitRetailCents: line.variant.priceCents,
        })),
        freeGiftIncluded: calc.freeGiftUnlocked,
        retailTotalCents: calc.retailTotalCents,
        totalSavingsCents: calc.totalSavingsCents,
        finalTotalCents: calc.finalTotalCents,
        ajaxPayload,
      };

      setCartBundles((prev) => [newGroup, ...prev]);
      playCartSuccess(soundEnabled);
      setAddState("added");
      setCartOpen(true);

      setTimeout(() => {
        setAddState("idle");
      }, 1500);
    }, 450);
  };

  const handleImportedStore = (
    storeName: string,
    importedProducts: ShopifyProduct[]
  ) => {
    setProducts(importedProducts);
    setIsImportedStore(true);
    setActiveCategory("All");
    setConfig((prev) => ({ ...prev, storeName }));
    const nextMap: Record<number, number> = {};
    importedProducts.forEach((p) => {
      if (p.variants[0]) nextMap[p.id] = p.variants[0].id;
    });
    setSelectedVariants(nextMap);
    setSelections(
      importedProducts.slice(0, 2).map((p) => ({
        productId: p.id,
        variantId: p.variants[0].id,
        quantity: 1,
      }))
    );
  };

  const handleResetDefaultStore = () => {
    setProducts(DEFAULT_PRODUCTS);
    setIsImportedStore(false);
    setActiveCategory("All");
    setConfig((prev) => ({
      ...prev,
      storeName: DEFAULT_MERCHANT_CONFIG.storeName,
    }));
    const map: Record<number, number> = {};
    DEFAULT_PRODUCTS.forEach((p) => {
      if (p.variants[0]) map[p.id] = p.variants[0].id;
    });
    setSelectedVariants(map);
    setSelections([
      { productId: 1001, variantId: 44100101, quantity: 1 },
      { productId: 1002, variantId: 44100201, quantity: 1 },
    ]);
  };

  const totalCartBundlesCount = cartBundles.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const getQtyInBundle = (product: ShopifyProduct): number => {
    const activeVarId =
      selectedVariants[product.id] ?? product.variants[0]?.id;
    return (
      selections.find((s) => s.variantId === activeVarId)?.quantity ?? 0
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-12">
      <HeaderBar
        mode={mode}
        onModeChange={setMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        cartCount={totalCartBundlesCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenInspector={() => setInspectorOpen(true)}
        onOpenImport={() => setImportOpen(true)}
        activeStoreName={config.storeName}
        isImportedStore={isImportedStore}
      />

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pt-6 sm:px-6 sm:pt-8">
        {/* Compact Storefront Intro Banner */}
        <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-[var(--bl-border)] bg-[var(--bl-surface)] p-5 sm:p-7 bl-card-shadow md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bl-emerald-soft)] border border-[var(--bl-emerald)]/25 px-3 py-1 text-[11px] font-bold text-[var(--bl-emerald)] dark:text-[#34D399]">
                <Layers3 className="h-3.5 w-3.5" />
                {config.storeName} · Build-Your-Own-Bundle
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#A3E635] px-2.5 py-1 text-[11px] font-extrabold text-[#0F172A]">
                <Sparkles className="h-3 w-3" />
                Up to 20% OFF + Sub Stacking
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--bl-ink)]">
              Build Your Custom Routine &amp; Unlock Tiered Savings
            </h1>
            <p className="text-sm leading-relaxed text-[var(--bl-ink-muted)]">
              Select {config.targetSlots} or more essentials to maximize bundle
              discounts. Switch to{" "}
              <button
                type="button"
                onClick={() =>
                  setMode(mode === "shopper" ? "merchant" : "shopper")
                }
                className="font-semibold text-[var(--bl-emerald)] dark:text-[#34D399] underline underline-offset-4 cursor-pointer"
              >
                Merchant Rules
              </button>{" "}
              to test pricing modes live, or inspect the generated Shopify{" "}
              <button
                type="button"
                onClick={() => setInspectorOpen(true)}
                className="font-mono-bl text-xs font-semibold text-[var(--bl-ink)] underline underline-offset-4 cursor-pointer"
              >
                /cart/add.js
              </button>{" "}
              payload.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="bl-btn-tactile inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] hover:border-[var(--bl-emerald)] px-3.5 text-xs font-bold text-[var(--bl-ink)] cursor-pointer"
            >
              <Compass className="h-4 w-4 text-[#10B981]" />
              Guided Walkthrough
            </button>
            <div className="rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-4 py-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[var(--bl-ink)]">
                <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                Native OS 2.0 Ready
              </div>
              <p className="text-[11px] text-[var(--bl-ink-muted)] mt-0.5">
                Zero monthly bundle app fees
              </p>
            </div>
          </div>
        </section>

        {/* Merchant Admin Rule Configurator */}
        {mode === "merchant" && (
          <MerchantConfigurator config={config} onChange={setConfig} />
        )}

        {/* Main 2-Column Builder Stage */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div data-tour="starter-kits">
              <StarterBundlesBar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                presets={STARTER_PRESETS}
                showPresets={!isImportedStore}
                onApplyPreset={handleApplyPreset}
                onCopyShareLink={handleCopyShareLink}
                shareCopied={shareCopied}
                hasSelections={calc.totalItems > 0}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  data-tour={idx === 0 ? "product-grid" : undefined}
                >
                  <ProductCard
                    product={product}
                    selectedVariantId={
                      selectedVariants[product.id] ?? product.variants[0]?.id
                    }
                    quantityInBundle={getQtyInBundle(product)}
                    onSelectVariant={handleSelectVariant}
                    onAdd={handleAddProduct}
                    onUpdateQty={handleUpdateQty}
                    onQuickView={setQuickViewProduct}
                  />
                </div>
              ))}
            </div>
          </div>

          <StickyBundleDock
            calc={calc}
            config={config}
            isSubscribed={isSubscribed}
            onToggleSubscribe={setIsSubscribed}
            onUpdateQty={handleUpdateQty}
            onRemoveVariant={handleRemoveVariant}
            onClearAll={() => setSelections([])}
            addState={addState}
            onAddBundleToCart={handleAddBundleToCart}
            tierPulseKey={tierPulseKey}
          />
        </div>
      </main>

      <footer className="mx-auto mt-14 w-full max-w-[1320px] border-t border-[var(--bl-border)] px-4 pt-6 text-xs text-[var(--bl-ink-muted)] sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <span>
          <strong className="text-[var(--bl-ink)]">BundleLab</strong> ·
          Interactive Shopify OS 2.0 Mini-App Prototype by Bola Akinlade
        </span>
        <span className="font-mono-bl text-[11px]">
          Integer-Cent Engine · /cart/add.js · Discount Functions Ready
        </span>
      </footer>

      <ProductQuickViewModal
        product={quickViewProduct}
        selectedVariantId={
          quickViewProduct
            ? selectedVariants[quickViewProduct.id] ??
              quickViewProduct.variants[0]?.id
            : 0
        }
        onSelectVariant={handleSelectVariant}
        onAdd={handleAddProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        bundles={cartBundles}
        onRemoveBundle={(bundleId) =>
          setCartBundles((prev) => prev.filter((b) => b.bundleId !== bundleId))
        }
        onClearCart={() => setCartBundles([])}
        onInspectPayload={() => {
          setCartOpen(false);
          setInspectorOpen(true);
        }}
      />

      <ShopifyInspectorDrawer
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        payload={
          cartBundles[0]?.ajaxPayload && calc.totalItems === 0
            ? cartBundles[0].ajaxPayload
            : previewPayload
        }
        config={config}
      />

      <StoreImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleImportedStore}
        onResetDefault={handleResetDefaultStore}
        isImportedStore={isImportedStore}
      />

      <GuidedBuilderTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}
