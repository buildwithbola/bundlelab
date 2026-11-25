"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  MousePointer2,
  Pause,
  Play,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { AnimatedCurrency } from "./AnimatedCurrency";

interface WalkthroughStep {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  caption: string;
}

const STEPS: WalkthroughStep[] = [
  {
    id: 0,
    code: "01",
    title: "Pick Products & Switch Variants",
    subtitle: "Filter categories, choose bottle sizes inline, and click Add to Bundle.",
    caption: "Clicking a variant updates SKU pricing in integer cents instantly.",
  },
  {
    id: 1,
    code: "02",
    title: "Watch Slots Fill & Tiers Unlock",
    subtitle: "Each added item snaps into the Sticky Dock and advances the progress bar.",
    caption: "Hitting 3 items flashes the Electric Lime badge from Save 10% -> Save 15%.",
  },
  {
    id: 2,
    code: "03",
    title: "Stack Subscribe & Merchant Rules",
    subtitle: "Toggle 30-day delivery for an extra 10% off or test Fixed-Price / Free Gift rules.",
    caption: "Live savings counter counts up smoothly with zero tabular number jitter.",
  },
  {
    id: 3,
    code: "04",
    title: "Batch Add via /cart/add.js",
    subtitle: "One click sends all selected variants with shared _bundle_id line properties.",
    caption: "Inspect the live JSON payload or download the OS 2.0 Liquid section anytime.",
  },
];

const STEP_DURATION_MS = 4200;

export function BundleWalkthroughShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [tick, setTick] = useState(0);

  // Sub-phase animation inside each step (0 -> 1 after 1100ms) for the animated cursor click
  const [phase, setPhase] = useState<0 | 1>(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIsPlaying(false);
      setPhase(1);
      return;
    }

    setPhase(0);
    const phaseTimer = setTimeout(() => setPhase(1), 950);

    if (!isPlaying) {
      return () => clearTimeout(phaseTimer);
    }

    const advanceTimer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
      setTick((t) => t + 1);
    }, STEP_DURATION_MS);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(advanceTimer);
    };
  }, [activeStep, isPlaying]);

  const selectStep = (idx: number) => {
    setActiveStep(idx);
    setTick((t) => t + 1);
  };

  // Cursor target coordinates (%) per step & sub-phase
  const cursorPos = (() => {
    if (activeStep === 0) {
      return phase === 0 ? { x: "32%", y: "66%" } : { x: "44%", y: "80%" };
    }
    if (activeStep === 1) {
      return phase === 0 ? { x: "66%", y: "44%" } : { x: "78%", y: "26%" };
    }
    if (activeStep === 2) {
      return phase === 0 ? { x: "68%", y: "62%" } : { x: "76%", y: "62%" };
    }
    return phase === 0 ? { x: "68%", y: "83%" } : { x: "76%", y: "83%" };
  })();

  const stepTwoOrMore = activeStep >= 1;
  const isSubscribed = activeStep >= 2 && (activeStep > 2 || phase === 1);
  const isCartAdded = activeStep === 3 && phase === 1;

  const displayTotalCents = isSubscribed ? 7803 : stepTwoOrMore ? 8670 : 5940;
  const displaySavingsCents = isSubscribed ? 2397 : stepTwoOrMore ? 1530 : 660;
  const progressWidth = stepTwoOrMore ? "75%" : "50%";

  return (
    <div
      data-testid="walkthrough-showcase"
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch"
    >
      {/* Left: Interactive Step Selector List */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-3">
        <div className="space-y-2.5">
          {STEPS.map((step, idx) => {
            const active = idx === activeStep;
            return (
              <button
                key={step.id}
                type="button"
                data-testid={`walkthrough-step-${idx}`}
                onClick={() => selectStep(idx)}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 bl-spring cursor-pointer ${
                  active
                    ? "border-[var(--bl-emerald)] bg-[var(--bl-bg)] shadow-md ring-1 ring-[var(--bl-emerald)]/30"
                    : "border-[var(--bl-border)] bg-[var(--bl-bg)]/60 hover:border-[var(--bl-border-strong)] hover:bg-[var(--bl-bg)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`font-mono-bl shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-colors ${
                      active
                        ? "bg-[#A3E635] text-[#0F172A]"
                        : "bg-[var(--bl-surface)] text-[var(--bl-ink-muted)] border border-[var(--bl-border)]"
                    }`}
                  >
                    {step.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[15px] font-bold text-[var(--bl-ink)]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--bl-ink-muted)]">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {/* Auto-advance progress bar */}
                {active && (
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--bl-border)]">
                    <div
                      key={`${activeStep}-${tick}-${isPlaying}`}
                      className="h-full rounded-full bg-[#34D399]"
                      style={{
                        width: isPlaying ? "100%" : "40%",
                        animation: isPlaying
                          ? `bl-walkthrough-fill ${STEP_DURATION_MS}ms linear forwards`
                          : "none",
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Playback Controls + Guided Tour CTA */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous walkthrough step"
              onClick={() =>
                selectStep((activeStep - 1 + STEPS.length) % STEPS.length)
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg)] text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg)] px-3 text-xs font-semibold text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-[#10B981]" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-[#10B981]" />
                  Play
                </>
              )}
            </button>

            <button
              type="button"
              aria-label="Next walkthrough step"
              onClick={() => selectStep((activeStep + 1) % STEPS.length)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg)] text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Link
            href="/builder?tour=1"
            data-testid="launch-guided-tour-link"
            className="bl-btn-tactile inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-3.5 text-xs font-bold text-white dark:text-[#071311]"
          >
            Take Interactive Tour
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Right: Animated Mini Storefront Simulation Stage */}
      <div className="lg:col-span-7">
        <div className="relative h-full overflow-hidden rounded-3xl border border-[var(--bl-border)] bg-[var(--bl-bg)] p-4 sm:p-5 bl-dock-shadow flex flex-col justify-between">
          {/* Mock Mini Browser Chrome */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--bl-border)]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]" />
              <span className="ml-2 font-mono-bl text-[11px] text-[var(--bl-ink-muted)] truncate">
                bundlelab.app/builder
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold border transition-colors ${
                  activeStep === 2
                    ? "border-[#34D399] bg-[#34D399]/18 text-[var(--bl-emerald)] dark:text-[#34D399]"
                    : "border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink-muted)]"
                }`}
              >
                <SlidersHorizontal className="h-2.5 w-2.5" />
                Merchant Rules
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold border transition-colors ${
                  activeStep === 3
                    ? "border-[#34D399] bg-[#34D399]/18 text-[var(--bl-emerald)] dark:text-[#34D399]"
                    : "border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink-muted)]"
                }`}
              >
                <Code2 className="h-2.5 w-2.5" />
                /cart/add.js
              </span>
            </div>
          </div>

          {/* Interactive Stage Grid */}
          <div className="relative my-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
            {/* Simulated Product Cards (Left 6 cols) */}
            <div className="sm:col-span-6 grid grid-cols-2 gap-2.5">
              {/* Card 1 */}
              <div
                className={`rounded-2xl border bg-[var(--bl-surface)] p-2.5 transition-all duration-300 ${
                  activeStep === 0
                    ? "border-2 border-[var(--bl-emerald)] ring-2 ring-[#34D399]/30 shadow-md"
                    : "border-[var(--bl-border)]"
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--bl-bg-subtle)]">
                  <img
                    src="/images/products/cleanser-gel.jpg"
                    alt="Amino Gel Cleanser"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute right-1.5 top-1.5 inline-flex h-5 items-center gap-0.5 rounded-full bg-[#34D399] px-1.5 text-[10px] font-bold text-[#0F172A]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />1
                  </span>
                </div>
                <p className="mt-2 truncate text-[11px] font-bold text-[var(--bl-ink)]">
                  Amino Cleanser
                </p>
                <div className="mt-1 flex gap-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold border transition-colors ${
                      activeStep === 0 && phase === 0
                        ? "border-[var(--bl-emerald)] bg-[var(--bl-emerald-soft)] text-[var(--bl-emerald)] dark:text-[#34D399]"
                        : "border-[var(--bl-border)] text-[var(--bl-ink-muted)]"
                    }`}
                  >
                    120ml
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold border transition-colors ${
                      activeStep > 0 || (activeStep === 0 && phase === 1)
                        ? "border-[var(--bl-emerald)] bg-[var(--bl-emerald-soft)] text-[var(--bl-emerald)] dark:text-[#34D399]"
                        : "border-[var(--bl-border)] text-[var(--bl-ink-muted)]"
                    }`}
                  >
                    240ml
                  </span>
                </div>
                <div className="mt-2 rounded-lg bg-[var(--bl-emerald)] py-1 text-center text-[10px] font-bold text-white dark:text-[#071311]">
                  {activeStep === 0 && phase === 0 ? "+ Add Item" : "1 in Bundle"}
                </div>
              </div>

              {/* Card 2 */}
              <div
                className={`rounded-2xl border bg-[var(--bl-surface)] p-2.5 transition-all duration-300 ${
                  stepTwoOrMore
                    ? "border-2 border-[var(--bl-emerald)] ring-2 ring-[#34D399]/25"
                    : "border-[var(--bl-border)]"
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--bl-bg-subtle)]">
                  <img
                    src="/images/products/barrier-cream.jpg"
                    alt="Ceramide Barrier Cream"
                    className="h-full w-full object-cover"
                  />
                  {stepTwoOrMore && (
                    <span className="bl-slot-enter absolute right-1.5 top-1.5 inline-flex h-5 items-center gap-0.5 rounded-full bg-[#34D399] px-1.5 text-[10px] font-bold text-[#0F172A]">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />1
                    </span>
                  )}
                </div>
                <p className="mt-2 truncate text-[11px] font-bold text-[var(--bl-ink)]">
                  Barrier Cream
                </p>
                <p className="bl-tabular text-[10px] text-[var(--bl-ink-muted)] mt-0.5">
                  $36.00
                </p>
                <div
                  className={`mt-3 rounded-lg py-1 text-center text-[10px] font-bold transition-colors ${
                    stepTwoOrMore
                      ? "bg-[var(--bl-emerald)] text-white dark:text-[#071311]"
                      : "border border-[var(--bl-emerald)] text-[var(--bl-emerald)] dark:text-[#34D399]"
                  }`}
                >
                  {stepTwoOrMore ? "1 in Bundle" : "+ Add to Bundle"}
                </div>
              </div>
            </div>

            {/* Simulated Sticky Dock (Right 6 cols) */}
            <div
              className={`sm:col-span-6 rounded-2xl border bg-[var(--bl-surface)] p-3.5 flex flex-col justify-between space-y-2.5 transition-all duration-300 ${
                activeStep >= 1
                  ? "border-[var(--bl-emerald)] ring-2 ring-[#34D399]/20"
                  : "border-[var(--bl-border)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xs font-bold text-[var(--bl-ink)]">
                  Your Custom Bundle
                </span>
                <span
                  key={stepTwoOrMore ? "15" : "10"}
                  className="bl-tabular bl-qty-pop rounded-full bg-[#A3E635] px-2 py-0.5 text-[10px] font-extrabold text-[#0F172A]"
                >
                  {isSubscribed
                    ? "24% OFF"
                    : stepTwoOrMore
                    ? "Save 15%"
                    : "Save 10%"}
                </span>
              </div>

              {/* Shimmer Progress */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bl-bg-subtle)] border border-[var(--bl-border)]">
                <div
                  className="bl-progress-shimmer h-full rounded-full bg-[#34D399] transition-all duration-500 bl-spring"
                  style={{ width: progressWidth }}
                />
              </div>

              {/* 4 Mini Slots */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  "/images/products/cleanser-gel.jpg",
                  "/images/products/hydra-serum.jpg",
                  stepTwoOrMore ? "/images/products/barrier-cream.jpg" : null,
                  null,
                ].map((src, i) =>
                  src ? (
                    <div
                      key={i}
                      className="bl-slot-enter relative aspect-square rounded-lg border border-[var(--bl-emerald)] overflow-hidden"
                    >
                      <img
                        src={src}
                        alt={`Slot ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="aspect-square rounded-lg border border-dashed border-[var(--bl-border-strong)] bg-[var(--bl-bg-subtle)] flex items-center justify-center font-mono-bl text-[8px] text-[var(--bl-ink-muted)]"
                    >
                      +{i + 1}
                    </div>
                  )
                )}
              </div>

              {/* Subscribe & Save Strip */}
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--bl-bg-subtle)] p-1 text-[9px] font-bold">
                <div
                  className={`rounded py-1 text-center transition-colors ${
                    !isSubscribed
                      ? "bg-[var(--bl-surface)] text-[var(--bl-ink)] shadow-xs"
                      : "text-[var(--bl-ink-muted)]"
                  }`}
                >
                  One-Time
                </div>
                <div
                  className={`inline-flex items-center justify-center gap-1 rounded py-1 transition-colors ${
                    isSubscribed
                      ? "bg-[var(--bl-emerald)] text-white dark:text-[#071311]"
                      : "text-[var(--bl-ink-muted)]"
                  }`}
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  Sub +10%
                </div>
              </div>

              {/* Total & CTA */}
              <div className="flex items-center justify-between pt-1 border-t border-dashed border-[var(--bl-border)]">
                <div>
                  <span className="text-[9px] text-[var(--bl-ink-muted)] block">
                    You Save <AnimatedCurrency cents={displaySavingsCents} />
                  </span>
                  <AnimatedCurrency
                    cents={displayTotalCents}
                    className="font-display text-base font-bold text-[var(--bl-ink)]"
                  />
                </div>
                <div
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                    isCartAdded
                      ? "bg-[#34D399] text-[#0F172A] scale-105"
                      : "bg-[var(--bl-emerald)] text-white dark:text-[#071311]"
                  }`}
                >
                  <ShoppingBag className="h-3 w-3" />
                  {isCartAdded ? "Added ✓" : "Add Bundle"}
                </div>
              </div>

              {/* Grouped Cart / Payload Toast in Step 04 */}
              {activeStep === 3 && (
                <div className="bl-slot-enter rounded-xl border border-[#34D399]/50 bg-[#34D399]/14 px-2.5 py-1.5 font-mono-bl text-[10px] text-[var(--bl-ink)] flex items-center justify-between">
                  <span>POST /cart/add.js · _bundle_id</span>
                  <span className="font-bold text-[var(--bl-emerald)] dark:text-[#34D399]">
                    200 OK
                  </span>
                </div>
              )}
            </div>

            {/* Animated Floating Cursor Guide */}
            <div
              aria-hidden="true"
              style={{
                left: cursorPos.x,
                top: cursorPos.y,
              }}
              className="pointer-events-none hidden sm:flex absolute z-20 -translate-x-1/2 -translate-y-1/2 items-center gap-1 transition-all duration-700 bl-spring"
            >
              <span className="relative inline-flex">
                <span
                  className={`absolute -inset-1.5 rounded-full bg-[#34D399]/40 ${
                    phase === 1 ? "animate-ping" : "opacity-0"
                  }`}
                />
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0F172A] text-[#A3E635] shadow-lg ring-2 ring-white/80">
                  <MousePointer2 className="h-3.5 w-3.5 fill-current" />
                </span>
              </span>
            </div>
          </div>

          {/* Caption Bar */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-surface)] px-3.5 py-2.5 text-xs">
            <span className="inline-flex items-center gap-2 text-[var(--bl-ink-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
              <span className="text-[var(--bl-ink)] font-medium">
                {STEPS[activeStep].caption}
              </span>
            </span>
            <span className="font-mono-bl text-[10px] font-bold text-[var(--bl-ink-muted)] shrink-0">
              {activeStep + 1} / {STEPS.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
