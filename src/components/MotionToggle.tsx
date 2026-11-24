"use client";

import type { Dict } from "@/i18n/dictionaries";
import { setMotion, useMotion, useSystemReduced } from "@/lib/motion";

/**
 * Only appears for visitors whose system asks for reduced motion. The site starts
 * calm for them, and this lets them switch the full experience on or back off.
 */
export function MotionToggle({ t }: { t: Dict["motionPref"] }) {
  const reduced = useSystemReduced();
  const motion = useMotion(false);
  if (!reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 z-30 md:top-20">
      <div className="mx-auto flex max-w-[1500px] justify-end px-5 md:px-10">
        <div
          className={`pointer-events-auto flex items-center rounded-full font-mono uppercase ${
            motion
              ? "glass gap-3 py-1.5 pl-4 pr-1.5 text-[10.5px] tracking-[0.12em] text-dim"
              : "glass-strong gap-3.5 border border-rey-hi/50 whitespace-nowrap py-2 pl-4 pr-2 text-[10.5px] tracking-[0.04em] text-fg md:pl-5 md:tracking-[0.12em] md:text-[12.5px]"
          }`}
        >
          <span className="md:hidden">{motion ? t.onShort : t.offShort}</span>
          <span className="hidden md:inline">{motion ? t.on : t.off}</span>
          <button
            type="button"
            onClick={() => setMotion(!motion)}
            className={
              motion
                ? "h-7 rounded-full bg-fg px-3 text-void transition-transform duration-200 hover:scale-[1.04]"
                : "cta-pulse h-10 rounded-full bg-linear-to-r from-rey to-violet px-4 md:px-5 font-semibold text-white transition-transform duration-200 hover:scale-[1.04]"
            }
          >
            {motion ? t.turnOff : t.turnOn}
          </button>
        </div>
      </div>
    </div>
  );
}
