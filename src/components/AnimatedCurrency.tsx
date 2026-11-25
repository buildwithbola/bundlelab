"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatCents } from "@/lib/bundleEngine";

interface AnimatedCurrencyProps {
  cents: number;
  className?: string;
  prefix?: string;
}

export function AnimatedCurrency({
  cents,
  className = "",
  prefix = "",
}: AnimatedCurrencyProps) {
  const [displayCents, setDisplayCents] = useState(cents);
  const currentRef = useRef(cents);

  useEffect(() => {
    const startVal = currentRef.current;
    const targetVal = cents;
    if (startVal === targetVal) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      currentRef.current = targetVal;
      setDisplayCents(targetVal);
      return;
    }

    const duration = 360;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // Expo-out easing matching studio motion curve
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const next = Math.round(startVal + (targetVal - startVal) * eased);
      currentRef.current = next;
      setDisplayCents(next);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [cents]);

  return (
    <span className={`bl-tabular ${className}`}>
      {prefix}
      {formatCents(displayCents)}
    </span>
  );
}
