import type { CSSProperties } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { reelItems } from "@/lib/reel";
import { sectionColor } from "@/lib/sections";
import {
  accountColor,
  accounts,
  compact,
  growth,
  longDate,
  snapshotDate,
  totals,
  type GrowthRecord,
  type Lang,
} from "@/lib/stats";
import { Counter } from "./Counter";
import { ArrowUpRight } from "./icons";
import { EditTracks } from "./EditTracks";
import { Reel } from "./Reel";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import { StatsDatabase } from "./StatsDatabase";

const GROWTH_ORDER = ["views", "likes", "shares", "reach", "comments", "profileViews"] as const;

function change(pct: number, lang: Lang) {
  return `+${Math.round(pct)}${lang === "es" ? " %" : "%"}`;
}

function GrowthCard({ g, t, lang }: { g: GrowthRecord; t: Dict["impact"]; lang: Lang }) {
  const account = accounts.find((a) => a.id === g.account)!;
  const shown = GROWTH_ORDER.filter((k) => g.metrics[k]).slice(0, 3);
  return (
    <div className="glass h-full rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
        <span style={{ color: accountColor[g.account] }}>
          {account.handle} · {g.label[lang]}
        </span>
        <span className="text-faint">{t.window.replace("{days}", String(g.days))}</span>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-4">
        {shown.map((k) => {
          const m = g.metrics[k]!;
          return (
            <div key={k} className="flex flex-col-reverse gap-1.5">
              <dt className="text-[12px] leading-snug text-dim md:text-[13px]">{t.metrics[k]}</dt>
              <dd>
                <span className="block font-display text-[2.5rem] font-bold leading-none md:text-[3.6rem]">
                  {compact(m.value, lang)}
                </span>
                {m.changePct !== null && (
                  <span className="mt-1.5 inline-block rounded-full bg-teal/15 px-2 py-0.5 font-mono text-[11px] text-teal">
                    {change(m.changePct, lang)}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function Impact({ t, lang, reel }: { t: Dict["impact"]; lang: Lang; reel: Dict["reel"] }) {
  const date = longDate(snapshotDate, lang);
  const counters = [
    { value: totals.followers, label: t.counters.followers, mode: "compact" as const },
    { value: totals.likes, label: t.counters.likes, mode: "compact" as const },
    { value: totals.topVideoViews, label: t.counters.views, mode: "compact" as const },
    { value: totals.millionPlus, label: t.counters.million, mode: "full" as const },
  ];

  return (
    <SectionShell id="impact" index="02" label={t.label}>
      <Reel
        items={reelItems("impact")}
        lang={lang}
        t={reel}
        label={t.viral.title}
        flip
        intro={
          <>
            <h2 className="section-title">{t.title}</h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-dim">{t.intro.replace("{date}", date)}</p>
            <h3 className="mt-7 text-[1.02rem] font-semibold">{t.viral.title}</h3>
          </>
        }
      />

      {/* The edit comes back behind the second half of this long section */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-[1] h-[110rem] overflow-clip">
        <div className="reel-glow absolute inset-0" style={{ "--glow": sectionColor("impact") } as CSSProperties} />
        <EditTracks color={sectionColor("impact")} seed={21} />
      </div>

      <Reveal className="mt-12 md:mt-20">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
          {counters.map((c) => (
            <div key={c.label} className="impact-cell flex flex-col-reverse justify-end gap-3 p-5 md:p-8">
              <dt className="text-[13px] leading-snug text-dim md:text-sm">{c.label}</dt>
              <dd className="font-display text-[clamp(3.4rem,9vw,7.2rem)] font-bold leading-[0.85]">
                <Counter value={c.value} lang={lang} mode={c.mode} />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="mt-16 md:mt-24">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">{t.accountsTitle}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {accounts.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.08}>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group glass block h-full rounded-3xl p-6 transition-colors hover:bg-white/[0.06] md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-[2.7rem] font-bold uppercase leading-none md:text-[3.6rem]">
                      {a.handle}
                    </p>
                    <p
                      className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em]"
                      style={{ color: accountColor[a.id] }}
                    >
                      {a.role[lang]}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight />
                    <span className="sr-only">{t.view}</span>
                  </span>
                </div>
                <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-dim">{a.note[lang]}</p>
                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
                  {(
                    [
                      [a.followers, t.fields.followers],
                      [a.likes, t.fields.likes],
                      [a.videos, t.fields.posts],
                    ] as const
                  ).map(([value, label]) => (
                    <div key={label} className="flex flex-col-reverse gap-1">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{label}</dt>
                      <dd className="font-display text-[2.2rem] font-bold leading-none md:text-[2.8rem]">
                        {compact(value, lang)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      {growth.length > 0 && (
        <div className="mt-16 md:mt-24">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">{t.growthTitle}</h3>
          <p className="mt-2 max-w-xl text-[0.95rem] text-dim">{t.growthIntro}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {growth.map((g, i) => (
              <Reveal key={g.id} delay={i * 0.08}>
                <GrowthCard g={g} t={t} lang={lang} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <Reveal className="mt-16 md:mt-24">
        <StatsDatabase t={t.db} lang={lang} />
      </Reveal>
    </SectionShell>
  );
}
