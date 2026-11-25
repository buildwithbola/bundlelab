import React from "react";

interface BundleLabLogoProps {
  compact?: boolean;
}

export function BundleLabLogo({ compact = false }: BundleLabLogoProps) {
  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 select-none shrink-0">
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
      >
        <rect width="64" height="64" rx="14" fill="#004C3F" />
        {/* Top Lab Tote Handle */}
        <path
          d="M26 13H38V18H26V13Z"
          stroke="#34D399"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Top Isometric Cube */}
        <path d="M32 17L41 22V32L32 37L23 32V22L32 17Z" fill="#10B981" />
        <path d="M32 17L41 22L32 27L23 22L32 17Z" fill="#34D399" />
        <path d="M32 27L41 22V32L32 37V27Z" fill="#059669" />
        {/* Bottom-Left Isometric Cube */}
        <path d="M21 33L30 38V48L21 53L12 48V38L21 33Z" fill="#10B981" />
        <path d="M21 33L30 38L21 43L12 38L21 33Z" fill="#34D399" />
        <path d="M21 43L30 38V48L21 53V43Z" fill="#047857" />
        {/* Bottom-Right Isometric Cube */}
        <path d="M43 33L52 38V48L43 53L34 48V38L43 33Z" fill="#34D399" />
        <path d="M43 33L52 38L43 43L34 38L43 33Z" fill="#A3E635" />
        <path d="M43 43L52 38V48L43 53V43Z" fill="#10B981" />
      </svg>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] sm:text-[1.2rem] font-extrabold tracking-[-0.03em] text-[var(--bl-ink)] whitespace-nowrap">
            Bundle<span className="text-[#10B981] dark:text-[#34D399]">Lab</span>
          </span>
          <span className="font-mono-bl text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.12em] text-[var(--bl-ink-muted)] mt-0.5 whitespace-nowrap">
            Shopify OS 2.0
          </span>
        </div>
      )}
    </div>
  );
}
