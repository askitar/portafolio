"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/lib/motion";
import type { Clip } from "@/lib/showcase";
import { accountHandle, compact, videoUrl, type Lang, type VideoStat } from "@/lib/stats";

export type ClipLabels = { play: string; pause: string; views: string; watch: string };

const RAIL_ICONS = {
  likes: "M12 21s-7.5-4.6-9.6-9.2C.9 8.5 2.7 4.5 6.6 4.5c2.2 0 3.9 1.2 5.4 3.3 1.500-2.1 3.200-3.300 5.400-3.300 3.900 0 5.700 4 4.200 7.300C19.500 16.400 12 21 12 21Z",
  comments: "M12 3.500c-5 0-9 3.300-9 7.500 0 2.300 1.200 4.300 3.100 5.700L5.500 20.500l4.200-2.200c.7.100 1.500.200 2.300.200 5 0 9-3.300 9-7.500s-4-7.500-9-7.500Z",
  shares: "M13.500 4.500 21.500 12l-8 7.500v-4.600c-4.600 0-7.800 1.300-10 4.600.6-5.600 3.600-9.700 10-10.300V4.500Z",
} as const;

/**
 * A muted looping preview. It plays on its own while it is on screen (when motion is allowed).
 * With a `stat` it is dressed like the TikTok player, shows the real figures and opens the original;
 * without one, clicking toggles playback.
 */
export function ClipCard({
  clip,
  lang,
  labels,
  stat,
}: {
  clip: Clip;
  lang: Lang;
  labels: ClipLabels;
  stat?: VideoStat;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const motion = useMotion(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motion) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.pause();
    };
  }, [motion]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const src = `/media/clips/${clip.file}`;
  const title = clip.title[lang];

  return (
    <figure
      className="clip group relative h-[21rem] max-w-[86cqw] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-panel md:h-[min(var(--h-max,28.75rem),var(--h-fit))] md:max-w-none"
      style={{ aspectRatio: clip.ratio }}
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={`${src}.jpg`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 size-full object-cover"
      >
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>

      {stat ? (
        <a
          href={videoUrl(stat)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${labels.watch}: ${title}`}
          className="absolute inset-0"
        />
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-label={`${playing ? labels.pause : labels.play}: ${title}`}
          className="absolute inset-0 grid place-items-center"
        >
          <span
            aria-hidden
            className={`grid size-12 place-items-center rounded-full bg-void/60 backdrop-blur transition-opacity ${
              playing ? "opacity-0" : "opacity-100"
            }`}
          >
            <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
              <path d="M0 0l14 8-14 8z" />
            </svg>
          </span>
        </button>
      )}

      {stat && (
        <>
          {/* Views, the way the app prints them on a profile grid */}
          <p className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-void/65 px-2.5 py-1.5 text-[0.82rem] font-semibold backdrop-blur">
            <svg aria-hidden width="9" height="10" viewBox="0 0 14 16" fill="currentColor">
              <path d="M0 0l14 8-14 8z" />
            </svg>
            {compact(stat.views, lang)}
            <span className="font-mono text-[9.5px] font-normal uppercase tracking-[0.12em] text-fg/70">
              {labels.views}
            </span>
          </p>
          {/* Action rail */}
          <ul className="pointer-events-none absolute bottom-20 right-2.5 flex flex-col items-center gap-3.5 text-center drop-shadow-[0_1px_3px_rgb(0_0_0/0.7)]">
            {(["likes", "comments", "shares"] as const).map((key) => (
              <li key={key}>
                <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                  <path d={RAIL_ICONS[key]} />
                </svg>
                <span className="mt-0.5 block text-[11px] font-semibold tabular-nums">
                  {compact(stat[key], lang)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-void/90 via-void/50 to-transparent p-3.5 pt-12">
        {stat && <p className="mb-1 text-[0.8rem] font-semibold">{accountHandle(stat.account)}</p>}
        <p className="text-[0.92rem] font-medium leading-tight">{title}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">{clip.tag[lang]}</p>
      </figcaption>
    </figure>
  );
}
