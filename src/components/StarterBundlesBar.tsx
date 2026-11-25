"use client";

import React from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { StarterBundlePreset } from "@/types/bundle";

interface StarterBundlesBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  presets: StarterBundlePreset[];
  showPresets: boolean;
  onApplyPreset: (preset: StarterBundlePreset) => void;
  onCopyShareLink: () => void;
  shareCopied: boolean;
  hasSelections: boolean;
}

export function StarterBundlesBar({
  categories,
  activeCategory,
  onSelectCategory,
  presets,
  showPresets,
  onApplyPreset,
  onCopyShareLink,
  shareCopied,
  hasSelections,
}: StarterBundlesBarProps) {
  return (
    <div className="mb-5 space-y-3">
      {/* Quick-fill Starter Bundles */}
      {showPresets && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[var(--bl-border)] bg-[var(--bl-surface)] px-3.5 py-2.5 bl-card-shadow">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--bl-ink)] mr-1">
              <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
              Starter Kits:
            </span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] hover:border-[var(--bl-emerald)] px-3 py-1.5 text-xs font-semibold text-[var(--bl-ink)] transition-colors cursor-pointer"
              >
                <span>{preset.name}</span>
                <span className="rounded-full bg-[#A3E635] px-1.5 py-0.5 text-[10px] font-bold text-[#0F172A]">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!hasSelections}
            onClick={onCopyShareLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] hover:border-[var(--bl-emerald)] disabled:opacity-45 px-3 py-1.5 text-xs font-semibold text-[var(--bl-ink)] transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {shareCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                Link Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[var(--bl-ink-muted)]" />
                Share Bundle URL
              </>
            )}
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                active
                  ? "border-[var(--bl-emerald)] bg-[var(--bl-emerald)] text-white dark:text-[#071311]"
                  : "border-[var(--bl-border)] bg-[var(--bl-surface)] text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
