"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";

interface TourStop {
  selector: string;
  title: string;
  description: string;
}

const TOUR_STOPS: TourStop[] = [
  {
    selector: '[data-tour="starter-kits"]',
    title: "Quick-Start Kits & Categories",
    description:
      "Pre-fill a curated 2-, 3-, or 4-item bundle in one click, filter by product category, or copy a shareable URL that preserves every variant.",
  },
  {
    selector: '[data-tour="product-grid"]',
    title: "Select Products & Switch Variants",
    description:
      "Switch bottle sizes inline, inspect formulation details in Quick View, or adjust quantities directly with the - qty + stepper.",
  },
  {
    selector: '[data-tour="bundle-dock"]',
    title: "Sticky Dock & Live Tier Progress",
    description:
      "Watch slots snap into place, unlock progressive discounts (10%, 15%, 20% OFF), stack Subscribe & Save, and batch-add via /cart/add.js.",
  },
  {
    selector: '[data-tour="merchant-mode"]',
    title: "Switch to Merchant Rules",
    description:
      "Flip from Shopper View to Merchant Rules to configure Tiered % Off, Fixed-Price Box, or Free Gift Unlock mechanics—or import any live Shopify store.",
  },
  {
    selector: '[data-tour="shopify-code"]',
    title: "Inspect Live Shopify Code",
    description:
      "Open the Architecture Inspector anytime to view the live POST /cart/add.js JSON, checkout Discount Function, and downloadable bundle-lab.liquid section.",
  },
];

interface RectBox {
  top: number;
  left: number;
  width: number;
  height: number;
  isFixed: boolean;
}

interface GuidedBuilderTourProps {
  open: boolean;
  onClose: () => void;
}

function findVisibleTarget(selector: string): HTMLElement | null {
  const matches = Array.from(
    document.querySelectorAll<HTMLElement>(selector)
  );
  for (const el of matches) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return el;
    }
  }
  return null;
}

export function GuidedBuilderTour({ open, onClose }: GuidedBuilderTourProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<RectBox | null>(null);

  const measureCurrent = useCallback(
    (shouldScroll: boolean) => {
      if (!open) return;
      const stop = TOUR_STOPS[stepIdx];
      const target = findVisibleTarget(stop.selector);
      if (!target) {
        setRect(null);
        return;
      }

      const style = window.getComputedStyle(target);
      const isFixed = style.position === "fixed";

      if (shouldScroll && !isFixed) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      const r = target.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        isFixed,
      });
    },
    [open, stepIdx]
  );

  useEffect(() => {
    if (!open) {
      setStepIdx(0);
      return;
    }
    measureCurrent(true);
    const t = setTimeout(() => measureCurrent(false), 360);

    const onReposition = () => measureCurrent(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setStepIdx((i) => (i < TOUR_STOPS.length - 1 ? i + 1 : i));
      }
      if (e.key === "ArrowLeft") {
        setStepIdx((i) => (i > 0 ? i - 1 : i));
      }
    };

    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, stepIdx, measureCurrent, onClose]);

  if (!open) return null;

  const stop = TOUR_STOPS[stepIdx];
  const isLast = stepIdx === TOUR_STOPS.length - 1;

  // Position floating coachmark safely within viewport
  const cardStyle: React.CSSProperties = (() => {
    if (typeof window === "undefined" || !rect) {
      return {
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardW = Math.min(360, vw - 24);

    if (vw < 640) {
      // Mobile: keep card cleanly docked above mobile bottom bar or below header
      const placeBottom = rect.top < vh * 0.45 && !rect.isFixed;
      return placeBottom
        ? { bottom: "92px", left: "12px", right: "12px" }
        : { top: "112px", left: "12px", right: "12px" };
    }

    const spaceRight = vw - (rect.left + rect.width);
    const spaceBelow = vh - (rect.top + rect.height);
    if (spaceRight >= cardW + 32 && rect.width < vw * 0.55) {
      return {
        top: `${Math.max(88, Math.min(rect.top, vh - 250))}px`,
        left: `${rect.left + rect.width + 16}px`,
        width: `${cardW}px`,
      };
    }

    const top =
      spaceBelow > 240
        ? rect.top + rect.height + 16
        : Math.max(88, rect.top - 230);
    const left = Math.min(
      Math.max(16, rect.left),
      vw - cardW - 16
    );

    return {
      top: `${Math.min(top, vh - 245)}px`,
      left: `${left}px`,
      width: `${cardW}px`,
    };
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Interactive BundleLab Guided Tour"
      className="fixed inset-0 z-50 pointer-events-auto"
    >
      {/* Subtle Dimmed Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 transition-opacity"
        onClick={onClose}
      />

      {/* Animated Emerald Spotlight Ring around Target */}
      {rect && (
        <div
          aria-hidden="true"
          style={{
            top: `${Math.max(4, rect.top - 6)}px`,
            left: `${Math.max(4, rect.left - 6)}px`,
            width: `${Math.min(window.innerWidth - 8, rect.width + 12)}px`,
            height: `${rect.height + 12}px`,
          }}
          className="pointer-events-none fixed rounded-2xl border-2 border-[#34D399] shadow-[0_0_0_9999px_rgba(7,19,17,0.38)] ring-4 ring-[#A3E635]/40 transition-all duration-300 bl-spring"
        />
      )}

      {/* Coachmark Card */}
      <div
        data-testid="guided-tour-card"
        style={cardStyle}
        className="fixed z-10 bl-animate-pop rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-surface)] p-5 shadow-2xl space-y-3.5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#A3E635] text-[#0F172A]">
              <Compass className="h-4 w-4" />
            </span>
            <span className="font-mono-bl text-[11px] font-bold uppercase tracking-wider text-[var(--bl-emerald)] dark:text-[#34D399]">
              Tour · Step {stepIdx + 1} of {TOUR_STOPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close guided tour"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--bl-border)] text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-base font-bold text-[var(--bl-ink)]">
            {stop.title}
          </h3>
          <p className="text-xs leading-relaxed text-[var(--bl-ink-muted)]">
            {stop.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {TOUR_STOPS.map((s, i) => (
            <button
              key={s.selector}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => setStepIdx(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === stepIdx
                  ? "w-6 bg-[#34D399]"
                  : "w-1.5 bg-[var(--bl-border-strong)]"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)] cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={() => setStepIdx((i) => i - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-3 text-xs font-bold text-[var(--bl-ink)] cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}

            <button
              type="button"
              data-testid="tour-next-btn"
              onClick={() => {
                if (isLast) onClose();
                else setStepIdx((i) => i + 1);
              }}
              className="bl-btn-tactile inline-flex h-9 items-center gap-1 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-4 text-xs font-bold text-white dark:text-[#071311] cursor-pointer"
            >
              {isLast ? "Start Building" : "Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
