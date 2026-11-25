"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  immediate?: boolean;
  className?: string;
}

export function ScrollReveal({
  children,
  delayMs = 0,
  immediate = false,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    observer.observe(el);

    const failsafe = setTimeout(() => {
      setVisible(true);
      observer.disconnect();
    }, 950 + delayMs);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, [immediate, delayMs]);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: visible ? `${delayMs}ms` : "0ms",
      }}
      className={`transition-all duration-500 bl-spring ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "article" | "div";
  children: React.ReactNode;
}

export function SpotlightCard({
  as = "article",
  className = "",
  children,
  ...rest
}: SpotlightCardProps) {
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = `${e.clientX - rect.left}px`;
    const y = `${e.clientY - rect.top}px`;
    e.currentTarget.style.setProperty("--mx", x);
    e.currentTarget.style.setProperty("--my", y);
  };

  const Tag = as;

  return (
    <Tag
      onPointerMove={handlePointerMove}
      className={`bl-spotlight-card ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
