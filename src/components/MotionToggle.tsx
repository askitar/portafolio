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
        <div className="glass pointer-events-auto flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
          <span className="md:hidden">{motion ? t.onShort : t.offShort}</span>
          <span className="hidden md:inline">{motion ? t.on : t.off}</span>
          <button
            type="button"
            onClick={() => setMotion(!motion)}
            className="h-7 rounded-full bg-fg px-3 text-void transition-transform duration-200 hover:scale-[1.04]"
          >
            {motion ? t.turnOff : t.turnOn}
          </button>
        </div>
      </div>
    </div>
  );
}
