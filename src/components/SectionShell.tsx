import type { CSSProperties, ReactNode } from "react";
import { sectionColor, sections, type SectionId } from "@/lib/sections";
import { EditTracks } from "./EditTracks";

/** Common frame for every section: registers it as a timeline clip, prints its slate and lays the edit behind it. */
export function SectionShell({
  id,
  index,
  label,
  children,
}: {
  id: SectionId;
  index: string;
  label: string;
  children: ReactNode;
}) {
  const color = sectionColor(id);
  const order = sections.findIndex((s) => s.id === id);
  return (
    <section id={id} data-clip={id} className="relative px-5 py-24 md:px-10 md:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1] overflow-clip">
        <EditTracks color={color} seed={order} flip={id === "impact" || id === "motion"} />
        {/* Sections without a reel get their light from their own label color */}
        {(id === "lora" || id === "contact") && (
          <div className="reel-glow absolute inset-0" style={{ "--glow": color } as CSSProperties} />
        )}
      </div>
      <div className="mx-auto w-full max-w-[1500px]">
        <header className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-dim md:mb-14">
          <span aria-hidden className="inline-block h-3 w-9 rounded-[3px]" style={{ background: color }} />
          <span>{index}</span>
          <span aria-hidden className="h-px w-8 bg-line" />
          <span className="text-fg">{label}</span>
        </header>
        {children}
      </div>
    </section>
  );
}
