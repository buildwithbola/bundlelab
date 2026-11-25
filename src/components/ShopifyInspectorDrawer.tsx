"use client";

import React, { useState } from "react";
import { Check, Code2, Copy, Download, ShieldCheck, X } from "lucide-react";
import {
  generateDiscountFunctionSnippet,
  generateShopifyLiquidSection,
} from "@/lib/liquidExport";
import { MerchantConfig, ShopifyAjaxPayload } from "@/types/bundle";

interface ShopifyInspectorDrawerProps {
  open: boolean;
  onClose: () => void;
  payload: ShopifyAjaxPayload;
  config: MerchantConfig;
}

type TabKey = "ajax" | "function" | "liquid";

export function ShopifyInspectorDrawer({
  open,
  onClose,
  payload,
  config,
}: ShopifyInspectorDrawerProps) {
  const [tab, setTab] = useState<TabKey>("ajax");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const ajaxJson = JSON.stringify(payload, null, 2);
  const functionCode = generateDiscountFunctionSnippet(config);
  const liquidCode = generateShopifyLiquidSection(config);

  const activeText =
    tab === "ajax" ? ajaxJson : tab === "function" ? functionCode : liquidCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Fallback ignored in restricted environments
    }
  };

  const handleDownloadLiquid = () => {
    const blob = new Blob([liquidCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bundle-lab.liquid";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopify Under-the-Hood Code Inspector"
      className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-xl flex-col border-l border-[var(--bl-border)] bg-[var(--bl-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--bl-border)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-[var(--bl-emerald)] dark:text-[#34D399]" />
            <div>
              <h2 className="font-display text-base font-bold text-[var(--bl-ink)]">
                Shopify Architecture Inspector
              </h2>
              <p className="text-xs text-[var(--bl-ink-muted)]">
                Live Ajax Cart API, Server Discount Function &amp; OS 2.0 Liquid
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close code inspector"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bl-border)] text-[var(--bl-ink)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1.5 border-b border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] p-2.5">
          {(
            [
              { id: "ajax", label: "/cart/add.js" },
              { id: "function", label: "Discount Function" },
              { id: "liquid", label: "OS 2.0 Liquid" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-xl py-2 px-2 text-xs font-bold transition-colors cursor-pointer ${
                tab === item.id
                  ? "bg-[var(--bl-emerald)] text-white dark:text-[#071311]"
                  : "text-[var(--bl-ink-muted)] hover:text-[var(--bl-ink)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Contextual Engineering Note */}
        <div className="border-b border-[var(--bl-border)] bg-[#34D399]/10 px-5 py-3 text-xs text-[var(--bl-ink)] flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-[var(--bl-emerald)] dark:text-[#34D399] shrink-0 mt-0.5" />
          {tab === "ajax" && (
            <p>
              <strong>Live Request Body:</strong> Sent via{" "}
              <code className="font-mono-bl">POST /cart/add.js</code>. Line item
              properties (<code className="font-mono-bl">_bundle_id</code>) group
              bundle items in Liquid cart drawers cleanly.
            </p>
          )}
          {tab === "function" && (
            <p>
              <strong>Tamper-Proof Checkout Math:</strong> Client JS only previews
              discounts; this Shopify Function enforces tier rules server-side at
              checkout.
            </p>
          )}
          {tab === "liquid" && (
            <p>
              <strong>Portable OS 2.0 Section:</strong> Drop{" "}
              <code className="font-mono-bl">bundle-lab.liquid</code> directly into{" "}
              <code className="font-mono-bl">/sections</code> with full Theme Editor
              schema controls.
            </p>
          )}
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-auto bg-[#0B1917] p-5 text-[#E2E8F0]">
          <pre className="font-mono-bl text-xs leading-relaxed whitespace-pre-wrap break-words">
            <code>{activeText}</code>
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--bl-border)] bg-[var(--bl-surface)] px-5 py-3.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[var(--bl-border)] bg-[var(--bl-bg-subtle)] px-3.5 text-xs font-bold text-[var(--bl-ink)] hover:border-[var(--bl-emerald)] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#10B981]" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Snippet
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadLiquid}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[var(--bl-emerald)] hover:bg-[var(--bl-emerald-hover)] px-4 text-xs font-bold text-white dark:text-[#071311] cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download bundle-lab.liquid
          </button>
        </div>
      </aside>
    </div>
  );
}
