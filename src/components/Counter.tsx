"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion";
import { compact, full, type Lang } from "@/lib/stats";

type Props = {
  value: number;
  lang: Lang;
  mode?: "compact" | "full";
  /** Milliseconds to wait after the number scrolls into view. */
  delay?: number;
  duration?: number;
  suffix?: string;
};

/** Counts up from zero the first time it is seen. Renders the final value without JS. */
export function Counter({ value, lang, mode = "compact", delay = 0, duration = 1700, suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = (mode === "compact" ? compact(value, lang) : full(value, lang)) + suffix;
  const motion = useMotion(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motion) return;
    const fmt = (n: number) => (mode === "compact" ? compact(n, lang) : full(n, lang)) + suffix;
    let raf = 0;
    let timer = 0;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = k < 1 ? fmt(Math.round(value * eased)) : final;
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        el.textContent = fmt(0);
        timer = window.setTimeout(run, delay);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      el.textContent = final;
    };
  }, [value, lang, mode, delay, duration, suffix, final, motion]);

  return (
    <span ref={ref} className="tabular-nums">
      {final}
    </span>
  );
}
