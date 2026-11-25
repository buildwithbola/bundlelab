"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  FileCode2,
  Globe,
  Layers3,
  Link2,
  Moon,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
} from "lucide-react";
import { AnimatedCurrency } from "./AnimatedCurrency";
import { BundleLabLogo } from "./BundleLabLogo";
import { BundleWalkthroughShowcase } from "./BundleWalkthroughShowcase";
import { ScrollReveal, SpotlightCard } from "./MotionPrimitives";

const HERO_PREVIEW_ITEMS = [
  {
    id: 1,
    title: "Amino Gel Cleanser",
    variant: "120ml Standard",
    priceCents: 2800,
    image: "/images/products/cleanser-gel.jpg",
  },
  {
    id: 2,
    title: "Hydra-Peptide Serum",
    variant: "30ml Dropper",
    priceCents: 3800,
    image: "/images/products/hydra-serum.jpg",
  },
  {
    id: 3,
    title: "Ceramide Barrier Cream",
    variant: "50ml Jar",
    priceCents: 3600,
    image: "/images/products/barrier-cream.jpg",
  },
];

const MARQUEE_CHIPS = [
  "POST /cart/add.js",
  "OS 2.0 Liquid Export",
  "Tiered % Off",
  "Fixed-Price Box",
  "Free Gift Unlock",
  "Subscribe & Save Stacking",
  "Shopify Discount Functions",
  "Integer-Cent Pricing Engine",
];

const SAMPLE_PAYLOAD_PREVIEW = `{
  "items": [
    {
      "id": 44100101,
      "quantity": 1,
      "selling_plan": 6889011,
      "properties": {
        "_bundle_id": "bl_verdant_01",
        "_bundle_tier": "Save 15%",
        "_bundle_mode": "tiered_percent"
      }
    },
    {
      "id": 44100201,
      "quantity": 1,
      "selling_plan": 6889021,
      "properties": {
        "_bundle_id": "bl_verdant_01",
        "_bundle_tier": "Save 15%",
        "_bundle_mode": "tiered_percent"
      }
    }
  ]
}`;

const CAPABILITIES = [
  {
    icon: ShoppingBag,
    title: "Sticky Bundle Dock & Mobile Drawer",
    desc: "Desktop sticky slot tray paired with a 44px+ mobile thumb-zone bar and expandable summary sheet so shoppers never lose their bundle context.",
  },
  {
    icon: SlidersHorizontal,
    title: "3 Live Merchant Pricing Modes",
    desc: "Switch on the fly between Tiered % Off, Fixed-Price Box (e.g. 3 items for $78), and Free Gift Unlock—or customize thresholds in Merchant Rules.",
  },
  {
    icon: Globe,
    title: "Live Shopify Store Importer",
    desc: "Paste any public Shopify domain to fetch its real /products.json catalog safely through an SSRF-guarded server route and test BundleLab live.",
  },
  {
    icon: RefreshCw,
    title: "Subscribe & Save Stacking",
    desc: "Optional 30-day delivery toggle attaches Shopify selling_plan IDs per line item and compounds an extra 10% subscription discount on top of bundle tiers.",
  },
  {
    icon: Link2,
    title: "Starter Kits & Shareable URLs",
    desc: "Pre-fill curated 2-, 3-, and 4-item routines with one click or generate a compact ?bundle=variantId:qty URL that restores exact selections on load.",
  },
  {
    icon: FileCode2,
    title: "Exportable OS 2.0 Liquid Section",
    desc: "Inspect live /cart/add.js JSON, read the server-side Shopify Discount Function guard, and download a ready-to-drop bundle-lab.liquid section.",
  },
];

export function LandingHomepage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [slotThreeAdded, setSlotThreeAdded] = useState(true);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") {
      setTheme(current);
    }
  }, []);

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

  const activeCount = slotThreeAdded ? 3 : 2;
  const discountPct = slotThreeAdded ? 15 : 10;
  const retailCents = slotThreeAdded ? 10200 : 6600;
  const savingsCents = Math.round((retailCents * discountPct) / 100);
  const finalCents = retailCents - savingsCents;
  const progressPct = slotThreeAdded ? 75 : 50;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Floating Frosted Glass Navbar */}
      <div className="sticky top-0 z-30 sm:px-6 sm:pt-3 pointer-events-none">
        <header className="pointer-events-auto bl-glass-nav mx-auto max-w-[1200px] border-b sm:border border-[var(--bl-border)] sm:rounded-2xl transition-colors">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bl-emerald)] rounded-xl"
            >
              <BundleLabLogo />
            </Link>

            <nav
              aria-label="Homepage sections"
              className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--bl-ink-muted)]"
            >
              <a
                href="#how-it-works"
                className="hover:text-[var(--bl-ink)] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="hover:text-[var(--bl-ink)] transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#architecture"
                className="hover:text-[var(--bl-ink)] transition-colors"
              >
                Shopify Architecture
              </a>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                className="bl-btn-tactile inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)] cursor-pointer"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4 text-[#A3E635]" />
                )}
              </button>

              <Link
                href="/builder"
                data-testid="nav-launch-builder"
                className="group bl-btn-tactile bl-shimmer-sweep inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-3.5 sm:px-4 text-xs font-bold text-white dark:text-[#071311] whitespace-nowrap"
              >
                Launch Builder
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 bl-spring group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-1">
        {/* Atmospheric Mesh Hero */}
        <section className="bl-hero-mesh relative overflow-hidden">
          <div
            aria-hidden="true"
            className="bl-dot-grid pointer-events-none absolute inset-0"
          />
          <div className="relative mx-auto max-w-[1200px] px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Copy */}
              <ScrollReveal immediate className="lg:col-span-7 space-y-6">
                <div className="inline-flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bl-surface)]/90 border border-[var(--bl-border)] px-3 py-1 text-[11px] font-semibold text-[var(--bl-emerald)] dark:text-[#34D399] shadow-xs">
                    <Layers3 className="h-3.5 w-3.5" />
                    Shopify OS 2.0 Mini-App Prototype
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#A3E635] px-2.5 py-1 text-[11px] font-bold text-[#0F172A]">
                    <Sparkles className="h-3 w-3" />
                    Zero Monthly App Fees
                  </span>
                </div>

                <h1 className="font-display text-[2.25rem] sm:text-[3.4rem] font-bold leading-[1.03] text-[var(--bl-ink)]">
                  Build-Your-Own-Bundle UX,{" "}
                  <span className="text-[var(--bl-emerald)] dark:text-[#34D399]">
                    Engineered Natively for Shopify.
                  </span>
                </h1>

                <p className="text-[15px] sm:text-[17px] leading-relaxed text-[var(--bl-ink-muted)] max-w-xl">
                  BundleLab is an interactive multi-product bundle builder built
                  to showcase app-grade storefront experiences inside
                  Shopify—pairing real-time tiered pricing, tabular savings
                  math, and one-click{" "}
                  <code className="font-mono-bl text-xs sm:text-sm font-semibold text-[var(--bl-ink)]">
                    /cart/add.js
                  </code>{" "}
                  batching without third-party script bloat.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/builder"
                    data-testid="hero-try-builder"
                    className="group bl-btn-tactile bl-shimmer-sweep inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-6 text-sm font-bold text-white dark:text-[#071311]"
                  >
                    Try Live Builder
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 bl-spring group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/builder?mode=merchant"
                    className="bl-btn-tactile inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] hover:border-[var(--bl-emerald)] px-5 text-sm font-semibold text-[var(--bl-ink)]"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-[#10B981]" />
                    Configure Merchant Rules
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-medium text-[var(--bl-ink-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#10B981]" />
                    Integer-cent discount math
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#10B981]" />
                    Live store /products.json loader
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#10B981]" />
                    Exportable .liquid section
                  </span>
                </div>
              </ScrollReveal>

              {/* Right Interactive Preview Card */}
              <ScrollReveal
                immediate
                delayMs={100}
                className="lg:col-span-5"
              >
                <SpotlightCard
                  as="div"
                  className="rounded-3xl border border-[var(--bl-border)] bg-[var(--bl-surface)] p-5 sm:p-6 bl-dock-shadow space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--bl-border)]">
                    <div className="min-w-0">
                      <span className="font-mono-bl text-[10px] uppercase tracking-wider text-[var(--bl-ink-muted)] block">
                        Interactive Preview
                      </span>
                      <h2 className="font-display text-base font-bold text-[var(--bl-ink)] truncate">
                        Verdant Lab Routine ({activeCount} of 4 Slots)
                      </h2>
                    </div>
                    <span
                      key={discountPct}
                      data-testid="hero-preview-tier"
                      className="bl-tabular bl-qty-pop whitespace-nowrap shrink-0 rounded-full bg-[#A3E635] px-2.5 py-1 text-[11px] font-bold text-[#0F172A]"
                    >
                      Save {discountPct}%
                    </span>
                  </div>

                  {/* Shimmer Progress Track */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[var(--bl-ink-muted)]">
                      <span>Tier Unlock Progress</span>
                      <span className="bl-tabular font-semibold text-[var(--bl-ink)]">
                        {slotThreeAdded
                          ? "3 items · 15% OFF unlocked"
                          : "Add Slot 3 to unlock 15% OFF"}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--bl-bg-subtle)] border border-[var(--bl-border)]">
                      <div
                        className="bl-progress-shimmer h-full rounded-full bg-[#34D399] transition-all duration-500 bl-spring"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* 3 Product Slot Thumbnails */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {HERO_PREVIEW_ITEMS.map((item, idx) => {
                      const active = idx < 2 || slotThreeAdded;
                      return (
                        <div
                          key={item.id}
                          className={`group/slot rounded-2xl border p-2 transition-all duration-300 bl-spring ${
                            active
                              ? "border-[var(--bl-emerald)] bg-[var(--bl-bg-subtle)]"
                              : "border-dashed border-[var(--bl-border-strong)] bg-[var(--bl-bg-subtle)]/50 opacity-60 scale-[0.97]"
                          }`}
                        >
                          <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--bl-surface)]">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 bl-spring group-hover/slot:scale-105"
                            />
                            {active && (
                              <span className="bl-slot-enter absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#34D399] text-[#0F172A] shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="mt-2 truncate text-[11px] font-bold text-[var(--bl-ink)]">
                            {item.title}
                          </p>
                          <p className="bl-tabular text-[10px] text-[var(--bl-ink-muted)]">
                            ${(item.priceCents / 100).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Slot 3 Toggle + Live Savings Readout */}
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] p-3.5">
                    <div>
                      <span className="text-[11px] font-semibold text-[var(--bl-ink-muted)] block">
                        Live Bundle Total
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <AnimatedCurrency
                          cents={finalCents}
                          className="font-display text-xl font-bold text-[var(--bl-ink)]"
                        />
                        <span className="bl-tabular text-xs font-bold text-[var(--bl-emerald)] dark:text-[#34D399]">
                          Save <AnimatedCurrency cents={savingsCents} />
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid="hero-toggle-slot3"
                      onClick={() => setSlotThreeAdded((v) => !v)}
                      className={`bl-btn-tactile inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold cursor-pointer ${
                        slotThreeAdded
                          ? "border border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink)] hover:border-[var(--bl-emerald)]"
                          : "bg-[var(--bl-emerald)] text-white dark:text-[#071311] hover:bg-[var(--bl-emerald-hover)]"
                      }`}
                    >
                      <Plus
                        className={`h-3.5 w-3.5 transition-transform duration-300 bl-spring ${
                          slotThreeAdded ? "rotate-45" : ""
                        }`}
                      />
                      {slotThreeAdded ? "Remove Slot 3" : "Add 3rd Item"}
                    </button>
                  </div>

                  <Link
                    href="/builder"
                    className="group bl-btn-tactile bl-shimmer-sweep w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-4 text-xs font-bold text-white dark:text-[#071311]"
                  >
                    Open Full Interactive Builder
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 bl-spring group-hover:translate-x-1" />
                  </Link>
                </SpotlightCard>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Edge-Masked Shopify Capabilities Ticker */}
        <div className="border-y border-[var(--bl-border)] bg-[var(--bl-surface)]/70 py-3.5">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="bl-marquee-mask overflow-hidden">
              <div className="bl-marquee-track gap-3">
                {[...MARQUEE_CHIPS, ...MARQUEE_CHIPS].map((chip, idx) => (
                  <span
                    key={`${chip}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--bl-border)] bg-[var(--bl-surface)] px-3.5 py-1.5 font-mono-bl text-[11px] font-medium text-[var(--bl-ink-muted)] shrink-0"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works — Animated Walkthrough */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-[var(--bl-surface)] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <ScrollReveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono-bl text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--bl-emerald)] dark:text-[#34D399]">
                  Animated Walkthrough
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--bl-ink)]">
                  See how shoppers navigate the bundle in four steps.
                </h2>
                <p className="text-sm sm:text-base text-[var(--bl-ink-muted)]">
                  Watch the interactive flow from variant selection to live tier
                  unlocks, Subscribe &amp; Save stacking, and one-click{" "}
                  <code className="font-mono-bl text-xs font-semibold text-[var(--bl-ink)]">
                    /cart/add.js
                  </code>{" "}
                  batching—or launch the guided tour right inside the builder.
                </p>
              </div>
            </ScrollReveal>

            <BundleWalkthroughShowcase />
          </div>
        </section>

        {/* Capabilities Grid */}
        <section
          id="features"
          className="scroll-mt-24 border-t border-[var(--bl-border)] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <ScrollReveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono-bl text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--bl-emerald)] dark:text-[#34D399]">
                  What&rsquo;s Inside
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--bl-ink)]">
                  Built for shoppers and Shopify merchants alike.
                </h2>
              </div>

              <Link
                href="/builder?import=1"
                className="bl-btn-tactile inline-flex items-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] hover:border-[var(--bl-emerald)] px-4 py-2.5 text-xs font-bold text-[var(--bl-ink)]"
              >
                <Globe className="h-4 w-4 text-[#10B981]" />
                Test With Any Shopify Store
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((cap, idx) => {
                const Icon = cap.icon;
                return (
                  <ScrollReveal key={cap.title} delayMs={(idx % 3) * 80}>
                    <SpotlightCard className="h-full rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-surface)] p-6 bl-card-sleek space-y-3 hover:border-[var(--bl-emerald)]/35">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bl-emerald-soft)] text-[var(--bl-emerald)] dark:text-[#34D399] transition-transform duration-300 bl-spring group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-bold text-[var(--bl-ink)]">
                        {cap.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--bl-ink-muted)]">
                        {cap.desc}
                      </p>
                    </SpotlightCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Under the Hood: Shopify Architecture */}
        <section
          id="architecture"
          className="scroll-mt-24 border-t border-[var(--bl-border)] bg-[var(--bl-surface)] py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <ScrollReveal className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <span className="font-mono-bl text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--bl-emerald)] dark:text-[#34D399]">
                    Under the Hood
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--bl-ink)]">
                    Real Shopify plumbing—not just a frontend array.
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[var(--bl-ink-muted)]">
                    Inside the builder, open the Shopify Code inspector at any
                    time to see the live JSON request body, checkout Discount
                    Function validation, and portable Liquid section code.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <SpotlightCard
                    as="div"
                    className="flex items-start gap-3 rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-bg)] p-4"
                  >
                    <ShieldCheck className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display text-sm font-bold text-[var(--bl-ink)]">
                        Tamper-Proof Shopify Discount Functions
                      </h3>
                      <p className="text-xs leading-relaxed text-[var(--bl-ink-muted)] mt-1">
                        Client-side JS only previews live savings; actual
                        checkout discounts are enforced server-side via{" "}
                        <code className="font-mono-bl">
                          cart_lines_discounts_generate_run
                        </code>{" "}
                        reading <code className="font-mono-bl">_bundle_id</code>{" "}
                        properties.
                      </p>
                    </div>
                  </SpotlightCard>

                  <SpotlightCard
                    as="div"
                    className="flex items-start gap-3 rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-bg)] p-4"
                  >
                    <Code2 className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display text-sm font-bold text-[var(--bl-ink)]">
                        Integer-Cent Math &amp; OS 2.0 Portability
                      </h3>
                      <p className="text-xs leading-relaxed text-[var(--bl-ink-muted)] mt-1">
                        Every price, discount, and tabular animation runs in
                        integer cents (just like Shopify Money filters), with
                        1-click{" "}
                        <code className="font-mono-bl">bundle-lab.liquid</code>{" "}
                        export.
                      </p>
                    </div>
                  </SpotlightCard>
                </div>

                <Link
                  href="/builder?code=1"
                  className="bl-btn-tactile bl-shimmer-sweep inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-5 text-xs font-bold text-white dark:text-[#071311]"
                >
                  <Code2 className="h-4 w-4" />
                  Open Live Code Inspector
                </Link>
              </ScrollReveal>

              <ScrollReveal delayMs={110} className="lg:col-span-6">
                <div className="overflow-hidden rounded-3xl border border-[var(--bl-border)] bg-[#0B1917] shadow-xl transition-transform duration-300 bl-spring hover:-translate-y-1">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                    <span className="font-mono-bl text-xs font-semibold text-[#34D399]">
                      POST /cart/add.js
                    </span>
                    <span className="rounded-full bg-[#A3E635] px-2.5 py-0.5 font-mono-bl text-[10px] font-bold text-[#0F172A]">
                      Ajax Cart API
                    </span>
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono-bl text-xs leading-relaxed text-[#E2E8F0]">
                    <code>{SAMPLE_PAYLOAD_PREVIEW}</code>
                  </pre>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-18">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl bg-[#004C3F] p-7 sm:p-12 text-white shadow-xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#34D399]/20 blur-3xl"
              />
              <div className="relative space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#A3E635] px-3 py-1 text-[11px] font-bold text-[#0F172A]">
                  Ready to Test
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  Build a custom routine or load your own Shopify store.
                </h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  Explore the Verdant Lab demo catalog, switch pricing modes in
                  Merchant Rules, or import live products from any public
                  Shopify storefront.
                </p>
              </div>

              <div className="relative flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/builder"
                  className="group bl-btn-tactile bl-shimmer-sweep inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#A3E635] hover:bg-[#bef264] px-6 text-sm font-bold text-[#0F172A]"
                >
                  Launch BundleLab
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 bl-spring group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/builder?import=1"
                  className="bl-btn-tactile inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/18 px-5 text-sm font-semibold text-white"
                >
                  Import Store URL
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <footer className="border-t border-[var(--bl-border)] py-7">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 text-xs text-[var(--bl-ink-muted)] sm:px-6">
          <span>
            <strong className="text-[var(--bl-ink)]">BundleLab</strong> ·
            Interactive Shopify OS 2.0 Mini-App by Bola Akinlade
          </span>
          <div className="flex items-center gap-4 font-mono-bl text-[11px]">
            <Link
              href="/builder"
              className="hover:text-[var(--bl-ink)] transition-colors"
            >
              Builder
            </Link>
            <Link
              href="/builder?mode=merchant"
              className="hover:text-[var(--bl-ink)] transition-colors"
            >
              Merchant Rules
            </Link>
            <Link
              href="/builder?code=1"
              className="hover:text-[var(--bl-ink)] transition-colors"
            >
              Shopify Code
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
