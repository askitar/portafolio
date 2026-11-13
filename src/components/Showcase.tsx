import { LOGOS, type LogoId } from "@/lib/logos";
import { sectionColor, type SectionId } from "@/lib/sections";
import { showcase } from "@/lib/showcase";
import type { Lang } from "@/lib/stats";
import type { ClipLabels } from "./ClipCard";
import { Filmstrip } from "./Filmstrip";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

type Copy = {
  label: string;
  title: string;
  body: string;
  tools: string[];
  cards?: { title: string; body: string }[];
};

/** Adobe app marks, drawn as their two-letter tiles. */
const APP_TILES: Record<string, string> = { "Premiere Pro": "Pr", "After Effects": "Ae" };

/** Tools that have a mark in the icon set. Marks that are black by brand are drawn in the text color. */
const TOOL_LOGOS: Record<string, { id: LogoId; mono?: boolean }> = {
  Blender: { id: "blender" },
  JSON: { id: "json", mono: true },
  "Three.js": { id: "three", mono: true },
  React: { id: "react" },
  "Claude Code": { id: "claude" },
};

function ToolMark({ tool }: { tool: string }) {
  const tile = APP_TILES[tool];
  if (tile) {
    return (
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-[10px] bg-[#00005b] text-[1.2rem] font-bold tracking-tight text-[#9999ff] shadow-[inset_0_0_0_2px_#9999ff]"
      >
        {tile}
      </span>
    );
  }
  const logo = TOOL_LOGOS[tool];
  if (!logo) return null;
  const { color, path } = LOGOS[logo.id];
  return (
    <span aria-hidden className="glass grid size-11 place-items-center rounded-[10px]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill={logo.mono ? "currentColor" : color}>
        <path d={path} />
      </svg>
    </span>
  );
}

/**
 * A work section: headline, copy, tools and either a filmstrip of short previews
 * or, for work that cannot be shown, a grid of capability cards.
 */
export function Showcase({
  id,
  index,
  t,
  lang,
  labels,
}: {
  id: SectionId;
  index: string;
  t: Copy;
  lang: Lang;
  labels: ClipLabels;
}) {
  const color = sectionColor(id);
  const clips = showcase[id] ?? [];
  const marked = t.tools.filter((tool) => APP_TILES[tool] || TOOL_LOGOS[tool]);
  const plain = t.tools.filter((tool) => !marked.includes(tool));

  return (
    <SectionShell id={id} index={index} label={t.label}>
      <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-end md:gap-16">
        <Reveal>
          <h2 className="font-display text-[clamp(3.4rem,10vw,8.5rem)] font-extrabold uppercase leading-[0.86]">
            {t.title}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-xl text-[1.05rem] leading-relaxed text-dim md:text-lg">{t.body}</p>
          {marked.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {marked.map((tool) => (
                <li key={tool} className="flex items-center gap-3">
                  <ToolMark tool={tool} />
                  <span className="text-[0.95rem] font-medium">{tool}</span>
                </li>
              ))}
            </ul>
          )}
          {plain.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {plain.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
                  style={{
                    borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
                    color: `color-mix(in oklab, ${color} 60%, white)`,
                  }}
                >
                  {tool}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>

      {clips.length > 0 && (
        <Reveal delay={0.12} className="mt-10 md:mt-16">
          <Filmstrip clips={clips} lang={lang} labels={labels} />
        </Reveal>
      )}

      {t.cards && (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {t.cards.map((card, i) => (
            <li key={card.title}>
              <Reveal delay={i * 0.06} className="h-full">
                <div
                  className="relative h-full overflow-hidden rounded-3xl border p-6 md:p-8"
                  style={{
                    borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
                    background: `linear-gradient(160deg, color-mix(in oklab, ${color} 16%, transparent), rgb(255 255 255 / 0.02) 60%)`,
                  }}
                >
                  <p className="font-mono text-[11px] tracking-[0.18em]" style={{ color }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-display text-[2.6rem] font-bold uppercase leading-[0.9] md:text-[3.2rem]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-dim md:text-base">{card.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
