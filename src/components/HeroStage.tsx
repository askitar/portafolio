"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useState, type ReactNode } from "react";
import { useMotion } from "@/lib/motion";

// Three.js is only loaded in the browser, after the page is interactive.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** The 3D timeline behind the hero. With motion off it is drawn once and held still. */
export function HeroStage() {
  // The static HTML assumes no motion, so nothing animates before the browser has decided.
  const motion = useMotion(false);
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);

  return (
    // One viewport tall even when the hero section grows past it, so the 3D scale stays predictable.
    <div aria-hidden className="hero-fade absolute inset-x-0 top-0 z-0 h-[100svh]">
      {!failed && (
        <SceneBoundary onError={onError}>
          <HeroScene animate={motion} />
        </SceneBoundary>
      )}
    </div>
  );
}
