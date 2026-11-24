"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { useMotion } from "@/lib/motion";
import type { ReelItem } from "@/lib/reel";
import { accountHandle, compact, videoUrl, type Lang } from "@/lib/stats";
import { ArrowUpRight } from "./icons";

const SWIPE = 40;

const RAIL_ICONS = {
  likes: "M12 21s-7.5-4.6-9.6-9.2C.9 8.5 2.7 4.5 6.6 4.5c2.2 0 3.9 1.2 5.4 3.3 1.5-2.1 3.2-3.3 5.4-3.3 3.9 0 5.7 4 4.2 7.3C19.5 16.4 12 21 12 21Z",
  comments: "M12 3.5c-5 0-9 3.3-9 7.5 0 2.3 1.2 4.3 3.1 5.7L5.5 20.5l4.2-2.2c.7.1 1.5.2 2.3.2 5 0 9-3.3 9-7.5s-4-7.5-9-7.5Z",
  shares: "M13.5 4.5 21.5 12l-8 7.5v-4.6c-4.6 0-7.8 1.3-10 4.6.6-5.6 3.6-9.7 10-10.3V4.5Z",
} as const;

/**
 * The site's way of showing work: a 3D ring of previews that fans out when it enters the screen.
 * The front one plays, the room takes its color, and when it ends the next one steps forward.
 */
export function Reel({
  items,
  lang,
  t,
  label,
  flip = false,
  intro,
  footer,
}: {
  items: ReelItem[];
  lang: Lang;
  t: Dict["reel"];
  label: string;
  /** Puts the ring on the left, so consecutive sections alternate */
  flip?: boolean;
  intro: ReactNode;
  footer?: ReactNode;
}) {
  const n = items.length;
  const motion = useMotion(false);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const ring = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const swipe = useRef<{ x: number; done: boolean } | null>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay needs motion allowed; without it nothing moves until the visitor presses play.
  const playing = inView && !paused && (motion || started);

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && playing) {
        v.play().catch(() => {});
        return;
      }
      v.pause();
      if (i !== active) {
        v.currentTime = 0;
        bars.current[i]?.style.setProperty("transform", "scaleX(0)");
      }
    });
  }, [active, playing]);

  const go = (i: number) => {
    setActive((i + n) % n);
    setPaused(false);
  };
  const toggle = () => {
    setPaused(playing);
    if (!playing) setStarted(true);
  };
  /** Signed distance from the active card, wrapped so the ring has no ends. */
  const offset = (i: number) => {
    const d = (i - active + n) % n;
    return d > n / 2 ? d - n : d;
  };

  const front = items[active];

  return (
    <>
      <div
        aria-hidden
        className={`reel-glow pointer-events-none absolute inset-x-0 top-0 -z-[1] h-[70rem] max-h-full ${flip ? "reel-glow-flip" : ""}`}
        style={{ "--glow": front.color } as CSSProperties}
      />
      <div
        className={`grid gap-10 md:items-center ${
          flip ? "md:grid-cols-[1.2fr_0.8fr]" : "md:grid-cols-[0.8fr_1.2fr]"
        }`}
      >
        <div className={`min-w-0 ${flip ? "md:order-last" : ""}`}>
          {intro}
          <ol className="mt-7 hidden md:block">
            {items.map((p, i) => {
              const on = i === active;
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on ? "true" : undefined}
                    className={`relative flex w-full items-baseline justify-between gap-4 border-t border-line py-3 text-left transition-colors ${
                      on ? "text-fg" : "text-dim hover:text-fg"
                    }`}
                  >
                    <span className="text-[1.02rem] font-medium">{p.title[lang]}</span>
                    <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">
                      {p.stat ? `${compact(p.stat.views, lang)} ${t.views}` : p.note[lang]}
                    </span>
                    <span
                      ref={(el) => {
                        bars.current[i] = el;
                      }}
                      aria-hidden
                      className="absolute inset-x-0 -top-px h-[2px] origin-left"
                      style={{ background: p.color, transform: "scaleX(0)" }}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="min-w-0">
          <div
            ref={ring}
            role="group"
            aria-label={label}
            className="reel -mx-5 md:mx-0"
            style={{ "--spread": seen ? 1 : 0 } as CSSProperties}
            onPointerDown={(e) => {
              swipe.current = { x: e.clientX, done: false };
            }}
            onPointerMove={(e) => {
              const s = swipe.current;
              if (!s || s.done || e.buttons === 0) return;
              const dx = e.clientX - s.x;
              if (Math.abs(dx) < SWIPE) return;
              s.done = true;
              go(active + (dx < 0 ? 1 : -1));
            }}
            onClickCapture={(e) => {
              // The click that follows a swipe must not also press a card.
              if (swipe.current?.done) e.stopPropagation();
              swipe.current = null;
            }}
          >
            {items.map((p, i) => {
              const d = offset(i);
              const on = d === 0;
              return (
                <button
                  key={p.key}
                  type="button"
                  className={`reel-card ${p.ratio > 1 ? "reel-wide" : ""}`}
                  tabIndex={on ? 0 : -1}
                  aria-label={`${on && playing ? t.pause : t.play}: ${p.title[lang]}`}
                  onClick={() => (on ? toggle() : go(i))}
                  style={
                    { "--d": d, "--a": Math.abs(d), "--glow": p.color, zIndex: 10 - Math.abs(d) } as CSSProperties
                  }
                >
                  <video
                    ref={(el) => {
                      videos.current[i] = el;
                    }}
                    muted={muted}
                    playsInline
                    preload="none"
                    poster={`${p.src}.jpg`}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (i === active && v.duration)
                        bars.current[i]?.style.setProperty("transform", `scaleX(${v.currentTime / v.duration})`);
                    }}
                    onEnded={() => i === active && go(active + 1)}
                    className="size-full object-cover"
                  >
                    <source src={`${p.src}.mp4`} type="video/mp4" />
                  </video>

                  {p.stat && (
                    <span className={`absolute inset-0 text-left transition-opacity duration-500 ${on ? "" : "opacity-0"}`}>
                      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-void/70 px-3 py-1.5 text-[0.9rem] font-semibold">
                        <svg aria-hidden width="9" height="10" viewBox="0 0 14 16" fill="currentColor">
                          <path d="M0 0l14 8-14 8z" />
                        </svg>
                        {compact(p.stat.views, lang)} {t.views}
                      </span>
                      <span className="absolute bottom-16 right-3 flex flex-col items-center gap-3 text-center drop-shadow-[0_1px_3px_rgb(0_0_0/0.7)]">
                        {(["likes", "comments", "shares"] as const).map((key) => (
                          <span key={key}>
                            <svg aria-hidden width="25" height="25" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                              <path d={RAIL_ICONS[key]} />
                            </svg>
                            <span className="block text-[11px] font-semibold tabular-nums">
                              {compact(p.stat![key], lang)}
                            </span>
                          </span>
                        ))}
                      </span>
                      <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-void/85 to-transparent p-3.5 pt-10 text-[0.88rem] font-semibold">
                        {accountHandle(p.stat.account)}
                      </span>
                    </span>
                  )}

                  {on && !playing && (
                    <span aria-hidden className="absolute inset-0 grid place-items-center">
                      <span className="grid size-16 place-items-center rounded-full bg-void/65 backdrop-blur">
                        <svg width="18" height="20" viewBox="0 0 14 16" fill="currentColor" className="ml-1">
                          <path d="M0 0l14 8-14 8z" />
                        </svg>
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button type="button" onClick={() => go(active - 1)} aria-label={t.prev} className="reel-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 3 5 8l5 5" />
              </svg>
            </button>
            {front.sound && (
              <button
                type="button"
                onClick={() => {
                  setMuted((m) => !m);
                  setPaused(false);
                  setStarted(true);
                }}
                className="h-11 min-w-36 rounded-full bg-fg px-5 text-[14px] font-medium text-void"
              >
                {muted ? t.soundOn : t.soundOff}
              </button>
            )}
            {front.stat && (
              <a
                href={videoUrl(front.stat)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-[14px] font-medium text-void"
              >
                {t.watch}
                <ArrowUpRight size={12} />
              </a>
            )}
            <button type="button" onClick={() => go(active + 1)} aria-label={t.next} className="reel-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m6 3 5 5-5 5" />
              </svg>
            </button>
          </div>
          <p className="mt-4 text-center text-[0.98rem] font-medium md:hidden">
            {front.title[lang]}
            <span className="mt-1 block font-mono text-[10.5px] font-normal uppercase tracking-[0.12em] text-dim">
              {front.note[lang]}
            </span>
          </p>
          {footer}
        </div>
      </div>
    </>
  );
}
