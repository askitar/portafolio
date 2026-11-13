import type { ReactNode } from "react";
import { sectionColor, type SectionId } from "@/lib/sections";

/** Common frame for every section: registers it as a timeline clip and prints its slate. */
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
  return (
    <section id={id} data-clip={id} className="relative px-5 py-24 md:px-10 md:py-36">
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
