import React, { Suspense } from "react";
import { BundleLabApp } from "@/components/BundleLabApp";

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bl-bg)] text-sm font-semibold text-[var(--bl-ink-muted)]">
          Loading BundleLab Builder...
        </div>
      }
    >
      <BundleLabApp />
    </Suspense>
  );
}
