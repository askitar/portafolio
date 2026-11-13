"use client";

import { useSyncExternalStore } from "react";

/**
 * Motion preference. The operating system setting is the default, and an explicit
 * choice made on the site (stored in localStorage) wins over it in either direction.
 * `data-motion` on <html> mirrors the result so CSS can follow it too.
 */
export const MOTION_KEY = "askitar-motion";
const QUERY = "(prefers-reduced-motion: reduce)";
const EVENT = "askitar-motion-change";

/** Runs before first paint (see RootDocument) so there is no flash of the wrong state. */
export const MOTION_BOOT_SCRIPT = `(function(){try{var c=localStorage.getItem("${MOTION_KEY}");var r=matchMedia("${QUERY}").matches;document.documentElement.dataset.motion=(c==="on"||c==="off"?c==="on":!r)?"on":"off"}catch(e){}})()`;

function stored(): "on" | "off" | null {
  try {
    const v = window.localStorage.getItem(MOTION_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

const systemReduced = () => window.matchMedia(QUERY).matches;

function motionAllowed(): boolean {
  const choice = stored();
  return choice ? choice === "on" : !systemReduced();
}

export function setMotion(on: boolean) {
  try {
    window.localStorage.setItem(MOTION_KEY, on ? "on" : "off");
  } catch {
    // Private mode: the choice still applies for this visit.
  }
  document.documentElement.dataset.motion = on ? "on" : "off";
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * True when animation is allowed. `serverValue` is what the static HTML assumes
 * until the browser reports the real preference.
 */
export function useMotion(serverValue: boolean): boolean {
  return useSyncExternalStore(subscribe, motionAllowed, () => serverValue);
}

/** True when the operating system asks for reduced motion. */
export function useSystemReduced(): boolean {
  return useSyncExternalStore(subscribe, systemReduced, () => false);
}
