"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";

/** With autoplay on, the whole page plays back in this many seconds. */
export const RUNTIME_SECONDS = 60;

type StageApi = {
  playing: boolean;
  togglePlay: () => void;
  stop: () => void;
  /** Jump (or glide) to an absolute scroll position. */
  scrollToY: (y: number, smooth?: boolean) => void;
};

const StageContext = createContext<StageApi | null>(null);

export function useStage(): StageApi {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage must be used inside <Stage>");
  return ctx;
}

export const maxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];

/** Owns smooth scrolling and the "play the portfolio" transport. */
export function Stage({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [playing, setPlaying] = useState(false);

  const motion = useMotion(false);

  // Smooth scrolling only when motion is allowed. Native scrolling otherwise.
  useEffect(() => {
    if (!motion) return;
    const lenis = new Lenis({ lerp: 0.11, anchors: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [motion]);

  const scrollToY = useCallback((y: number, smooth = false) => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(y, { immediate: !smooth, force: true });
    else window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Autoplay: scroll at constant speed so the page lasts RUNTIME_SECONDS.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let prev = performance.now();
    let pos = window.scrollY;
    if (pos >= maxScroll() - 4) {
      pos = 0;
      scrollToY(0);
    }
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const max = maxScroll();
      pos = Math.min(max, pos + (max / RUNTIME_SECONDS) * dt);
      scrollToY(pos);
      if (pos >= max) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const halt = () => setPlaying(false);
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select")) return;
      if (SCROLL_KEYS.includes(e.key)) halt();
    };
    window.addEventListener("wheel", halt, { passive: true });
    window.addEventListener("touchmove", halt, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", halt);
      window.removeEventListener("touchmove", halt);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing, scrollToY]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const stop = useCallback(() => setPlaying(false), []);

  const api = useMemo<StageApi>(
    () => ({ playing, togglePlay, stop, scrollToY }),
    [playing, togglePlay, stop, scrollToY],
  );

  return <StageContext.Provider value={api}>{children}</StageContext.Provider>;
}
