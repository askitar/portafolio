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

/**
 * The 3D stage behind the hero copy. With motion off the same scene is drawn once and held still.
 * A flat poster stands in until WebGL is ready, and stays if WebGL is unavailable.
 */
export function HeroStage() {
  // The static HTML assumes no motion, so the canvas only mounts in the browser.
  const motion = useMotion(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const show3d = !failed;

  return (
    // One viewport tall even when the hero section grows past it, so the 3D scale stays predictable.
    <div aria-hidden className="hero-fade absolute inset-x-0 top-0 z-0 h-[100svh]">
      <div
        className={`absolute left-1/2 top-[5.25rem] aspect-[9/16] h-[30svh] -translate-x-1/2 overflow-hidden rounded-[22px] border border-white/15 shadow-[0_40px_120px_-20px_rgb(43_80_255/0.55)] transition-opacity duration-700 md:left-auto md:right-[12%] md:top-1/2 md:h-[62svh] md:-translate-y-1/2 md:translate-x-0 md:rounded-[30px] ${
          show3d && ready ? "opacity-0" : "opacity-100"
        }`}
        style={{ transform: "perspective(1400px) rotateY(-20deg) rotateZ(3deg)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/hero-poster.jpg"
          alt=""
          width={720}
          height={1280}
          fetchPriority="high"
          className="size-full object-cover"
        />
      </div>
      {show3d && (
        <SceneBoundary onError={onError}>
          <HeroScene animate={motion} onReady={onReady} />
        </SceneBoundary>
      )}
    </div>
  );
}
