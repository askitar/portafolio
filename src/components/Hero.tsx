"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { profile } from "@/lib/profile";
import { totals, type Lang } from "@/lib/stats";
import { Counter } from "./Counter";
import { HeroStage } from "./HeroStage";
import { useStage } from "./Stage";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

// Desktop: the three headline numbers float around the slab (which sits at 75% of the width).
const CHIP_SPOTS = [
  { position: "left-[52%] top-[19%]", drift: "0s" },
  { position: "right-[3%] top-[45%]", drift: "-2.4s" },
  { position: "left-[55%] top-[69%]", drift: "-4.6s" },
];

export function Hero({ t, lang }: { t: Dict["hero"]; lang: Lang }) {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const { playing, togglePlay } = useStage();
  const motion = useMotion(false);

  // The copy drifts up and fades as the hero scrolls away.
  useEffect(() => {
    if (!motion) return;
    const ctx = gsap.context(() => {
      gsap.to([content.current, chips.current], {
        yPercent: -8,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 30%", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [motion]);

  const stats = [
    { value: totals.followers, label: t.stats.followers },
    { value: totals.likes, label: t.stats.likes },
    { value: totals.topVideoViews, label: t.stats.views },
  ];

  return (
    <section
      ref={root}
      id="intro"
      data-clip="intro"
      className="relative isolate flex min-h-[100svh] flex-col overflow-clip"
    >
      <div aria-hidden className="hero-backdrop hero-fade absolute inset-0 -z-10" />
      <HeroStage />

      <div
        ref={content}
        className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-end px-5 pb-[calc(var(--dock-h)+1.25rem)] pt-[calc(30svh+6.25rem)] md:justify-center md:px-10 md:pb-[calc(var(--dock-h)+1.5rem)] md:pt-24"
      >
        <div className="md:max-w-[60%]">
          <p
            className="fade-up flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-dim"
            style={delay(80)}
          >
            <span
              aria-hidden
              className="inline-block size-1.5 rounded-full bg-rey-hi shadow-[0_0_10px_2px_rgb(61_98_255/0.9)]"
            />
            {t.eyebrow}
          </p>

          <h1 className="mt-4 whitespace-nowrap font-display text-[clamp(3.2rem,17.2vw,6rem)] font-extrabold uppercase leading-[0.84] md:mt-5 md:text-[clamp(4.5rem,min(11.2vw,15svh),11.5rem)]">
            {t.title.map((line, i) => (
              <span key={line} className="line">
                <span
                  style={{ "--i": i } as CSSProperties}
                  className={i === t.title.length - 1 ? "accent-text" : undefined}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="fade-up mt-5 font-display text-[2.5rem] font-bold uppercase leading-none md:mt-6 md:text-[clamp(2.6rem,5.6svh,3.6rem)]"
            style={delay(560)}
          >
            {profile.name}
          </p>
          <p className="fade-up mt-2 text-[1.05rem] font-medium text-rey-hi md:text-xl" style={delay(620)}>
            {t.role}
          </p>
          <p
            className="fade-up mt-2 max-w-md text-[0.95rem] leading-relaxed text-dim md:max-w-xl md:text-base"
            style={delay(700)}
          >
            {t.body}
          </p>

          <div className="fade-up mt-6 flex flex-wrap items-center gap-3 md:mt-7" style={delay(800)}>
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-12 items-center gap-3 rounded-full bg-fg pl-2 pr-5 text-[15px] font-medium text-void transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span aria-hidden className="grid size-8 place-items-center rounded-full bg-void text-fg">
                {playing ? (
                  <svg width="11" height="11" viewBox="0 0 14 14">
                    <rect x="1.5" y="1" width="4" height="12" rx="1" fill="currentColor" />
                    <rect x="8.5" y="1" width="4" height="12" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 14 14">
                    <path
                      d="M3 1.2v11.6a.6.6 0 0 0 .92.5l9-5.8a.6.6 0 0 0 0-1L3.92.7A.6.6 0 0 0 3 1.2Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </span>
              {playing ? t.pause : t.play}
              <span className="hidden font-mono text-[11px] text-void/55 sm:inline">{t.runtime}</span>
            </button>
            <a
              href="#contact"
              className="glass inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium transition-colors hover:bg-white/10"
            >
              {t.contact}
            </a>
          </div>
        </div>

        {/* Phone: the numbers sit in a row under the buttons */}
        <dl
          className="fade-up mt-9 grid grid-cols-3 gap-x-4 border-t border-line pt-5 md:hidden"
          style={delay(950)}
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-1.5">
              <dt className="font-mono text-[9.5px] uppercase leading-snug tracking-[0.14em] text-dim">
                {s.label}
              </dt>
              <dd className="font-display text-[2.7rem] font-bold leading-none">
                <Counter value={s.value} lang={lang} delay={950} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Desktop: the numbers float as glass chips around the slab */}
      <div ref={chips} className="pointer-events-none absolute inset-0 z-10 hidden md:block">
        {stats.map((s, i) => (
          <div key={s.label} className={`absolute ${CHIP_SPOTS[i].position}`}>
            <div className="fade-up" style={delay(1050 + i * 140)}>
              <div
                className="drift glass-strong rounded-2xl px-5 py-3.5"
                style={{ "--drift": CHIP_SPOTS[i].drift } as CSSProperties}
              >
                <p className="font-display text-[clamp(2.6rem,6.2svh,3.6rem)] font-bold leading-none">
                  <Counter value={s.value} lang={lang} delay={1100 + i * 140} />
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
