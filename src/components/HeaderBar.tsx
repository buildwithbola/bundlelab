"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  Globe,
  Moon,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { BundleLabLogo } from "./BundleLabLogo";

interface HeaderBarProps {
  mode: "shopper" | "merchant";
  onModeChange: (mode: "shopper" | "merchant") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenInspector: () => void;
  onOpenImport: () => void;
  activeStoreName: string;
  isImportedStore: boolean;
}

export function HeaderBar({
  mode,
  onModeChange,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  cartCount,
  onOpenCart,
  onOpenInspector,
  onOpenImport,
  activeStoreName,
  isImportedStore,
}: HeaderBarProps) {
  return (
    <div className="sticky top-0 z-30 sm:px-6 sm:pt-3 pointer-events-none">
      <header className="pointer-events-auto bl-glass-nav mx-auto max-w-[1320px] border-b sm:border border-[var(--bl-border)] sm:rounded-2xl transition-colors">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            aria-label="Back to BundleLab overview"
            className="inline-flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bl-emerald)]"
          >
            <BundleLabLogo />
          </Link>
          <Link
            href="/"
            className="hidden xl:inline-flex items-center gap-1 rounded-lg border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)] hover:border-[var(--bl-border-strong)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Overview
          </Link>
          {isImportedStore && (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#34D399]/18 border border-[#34D399]/40 px-2.5 py-1 text-[11px] font-semibold text-[var(--bl-emerald)] dark:text-[#34D399] truncate max-w-[170px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] shrink-0" />
              Live: {activeStoreName}
            </span>
          )}
        </div>

        {/* Center Shopper vs Merchant Switch (Desktop) */}
        <div
          role="tablist"
          aria-label="Workspace mode"
          data-tour="merchant-mode"
          className="hidden lg:inline-flex items-center rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "shopper"}
            onClick={() => onModeChange("shopper")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all bl-spring cursor-pointer ${
              mode === "shopper"
                ? "bg-[var(--bl-surface)] text-[var(--bl-ink)] shadow-sm"
                : "text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)]"
            }`}
          >
            <Store className="h-3.5 w-3.5" />
            Storefront View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "merchant"}
            onClick={() => onModeChange("merchant")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all bl-spring cursor-pointer ${
              mode === "merchant"
                ? "bg-[var(--bl-emerald)] text-white dark:text-[#071311] shadow-sm"
                : "text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)]"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Merchant Rules
          </button>
        </div>

        {/* Right Controls — Budgeted cleanly for 375px mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenImport}
            title="Load products from any public Shopify store"
            className="inline-flex h-9 w-9 sm:w-auto sm:h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] sm:px-3 text-xs font-semibold text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] transition-colors cursor-pointer"
          >
            <Globe className="h-4 w-4 text-[#10B981]" />
            <span className="hidden sm:inline">Import Store</span>
          </button>

          <button
            type="button"
            data-tour="shopify-code"
            onClick={onOpenInspector}
            title="Inspect Shopify /cart/add.js payload & Liquid code"
            className="inline-flex h-9 w-9 md:w-auto sm:h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] md:px-3 text-xs font-semibold text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] transition-colors cursor-pointer"
          >
            <Code2 className="h-4 w-4 text-[var(--bl-emerald)] dark:text-[#34D399]" />
            <span className="hidden md:inline">Shopify Code</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? "Mute tactile audio" : "Enable tactile audio"}
            title={soundEnabled ? "Sound ON" : "Sound OFF"}
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)] transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#10B981]" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)] transition-colors cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-[#A3E635]" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Open Shopify Cart Drawer"
            className="relative inline-flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-2.5 sm:px-3.5 text-xs font-semibold text-white dark:text-[#071311] transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span
              data-testid="cart-badge-count"
              className="bl-tabular inline-flex min-w-[20px] h-5 items-center justify-center rounded-full bg-[#A3E635] px-1.5 text-[11px] font-bold text-[#0F172A]"
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Mode Switcher Row */}
      <div
        data-tour="merchant-mode"
        className="flex lg:hidden border-t border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-4 py-2 gap-2"
      >
        <button
          type="button"
          onClick={() => onModeChange("shopper")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            mode === "shopper"
              ? "bg-[var(--bl-surface)] text-[var(--bl-ink)] shadow-sm"
              : "text-[var(--bl-ink-muted)]"
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          Storefront View
        </button>
        <button
          type="button"
          onClick={() => onModeChange("merchant")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            mode === "merchant"
              ? "bg-[var(--bl-emerald)] text-white dark:text-[#071311] shadow-sm"
              : "text-[var(--bl-ink-muted)]"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Merchant Rules
        </button>
      </div>
      </header>
    </div>
  );
}
