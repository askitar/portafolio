"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { sections, type SectionId } from "@/lib/sections";
import { RUNTIME_SECONDS, maxScroll, useStage } from "./Stage";

const FPS = 30;

type Clip = { id: SectionId; start: number; end: number; color: string };

function timecode(seconds: number): string {
  const frames = Math.round(seconds * FPS);
  const s = Math.floor(frames / FPS);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, frames % FPS]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

// Decorative audio lane. Deterministic so server and client render the same bars.
const WAVE = Array.from({ length: 150 }, (_, i) => {
  const v = Math.sin(i * 0.37) * 0.5 + Math.sin(i * 1.31 + 1.7) * 0.3 + Math.sin(i * 0.09) * 0.2;
  // Rounded to whole tenths of a unit: Node and browsers disagree on the last float digits.
  return Math.round((0.18 + Math.abs(v) * 0.82) * 10);
});

/**
 * The page as an editing timeline: sections are clips, scroll moves the playhead,
 * dragging the track scrubs the page and the play button runs it like a video.
 */
export function TimelineDock({ t }: { t: Dict["dock"] }) {
  const { playing, togglePlay, stop, scrollToY } = useStage();
  const [clips, setClips] = useState<Clip[]>([]);
  const [active, setActive] = useState<SectionId>("intro");
  const track = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLSpanElement>(null);
  const clipsRef = useRef<Clip[]>([]);
  const activeRef = useRef<SectionId>("intro");
  const drag = useRef<{ startX: number; moved: boolean; pointerId: number } | null>(null);

  // Where each section sits in the document, as fractions of its full height.
  useEffect(() => {
    const measure = () => {
      const total = document.documentElement.scrollHeight;
      const next: Clip[] = [];
      for (const s of sections) {
        const el = document.querySelector<HTMLElement>(`[data-clip="${s.id}"]`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        next.push({
          id: s.id,
          start: top / total,
          end: (top + el.offsetHeight) / total,
          color: s.color,
        });
      }
      clipsRef.current = next;
      setClips(next);
    };
    // ResizeObserver reports once on observe, which gives the first measurement.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", measure);
    };
  }, []);

  // Playhead and timecode follow scroll without re-rendering React.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const max = maxScroll();
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (p !== last) {
        last = p;
        if (head.current) head.current.style.left = `${p * 100}%`;
        if (code.current) code.current.textContent = timecode(p * RUNTIME_SECONDS);
        const list = clipsRef.current;
        const current = list.find((c) => p >= c.start && p < c.end) ?? list[list.length - 1];
        if (current && current.id !== activeRef.current) {
          activeRef.current = current.id;
          setActive(current.id);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrubTo = (clientX: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    scrollToY(p * maxScroll());
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { startX: e.clientX, moved: false, pointerId: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.startX) > 4) {
      d.moved = true;
      stop();
      e.currentTarget.setPointerCapture(d.pointerId);
    }
    if (d.moved) scrubTo(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (d.moved) {
      if (e.currentTarget.hasPointerCapture(d.pointerId)) {
        e.currentTarget.releasePointerCapture(d.pointerId);
      }
      // Keep the flag until the click that follows a drag has been swallowed.
      window.setTimeout(() => {
        drag.current = null;
      }, 0);
    } else {
      drag.current = null;
    }
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a")) return;
    stop();
    scrubTo(e.clientX);
  };

  const activeColor = sections.find((s) => s.id === active)?.color ?? "#fff";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-2 pb-2 md:px-5 md:pb-4">
      <div className="glass-strong pointer-events-auto mx-auto flex h-[calc(var(--dock-h)-12px)] max-w-[1500px] items-stretch rounded-2xl md:h-[calc(var(--dock-h)-20px)]">
        {/* Transport */}
        <div className="flex shrink-0 items-center gap-3 border-r border-line px-3 md:gap-4 md:px-5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? t.pause : t.play}
            aria-pressed={playing}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-fg text-void transition-transform duration-200 hover:scale-105 active:scale-95 md:size-11"
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <rect x="1.5" y="1" width="4" height="12" rx="1" fill="currentColor" />
                <rect x="8.5" y="1" width="4" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M3 1.2v11.6a.6.6 0 0 0 .92.5l9-5.8a.6.6 0 0 0 0-1L3.92.7A.6.6 0 0 0 3 1.2Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <div className="leading-none">
            <span
              ref={code}
              className="block font-mono text-[13px] tabular-nums tracking-tight md:text-[15px]"
            >
              00:00:00:00
            </span>
            <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              <span className="md:hidden" style={{ color: activeColor }}>
                {t.sections[active]}
              </span>
              <span className="hidden md:inline">
                / {timecode(RUNTIME_SECONDS)} · {FPS} fps
              </span>
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="min-w-0 flex-1 px-3 py-2 md:px-5 md:py-2.5">
          <div
            ref={track}
            role="group"
            aria-label={t.timeline}
            className="relative h-full cursor-ew-resize touch-none select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClickCapture={onClickCapture}
            onClick={onTrackClick}
          >
            <div className="ruler h-2.5 w-full opacity-70" />
            <div className="absolute inset-x-0 bottom-0 top-3.5">
              <nav className="absolute inset-x-0 top-0 h-[64%]">
                {clips.map((c) => {
                  const on = c.id === active;
                  return (
                    <a
                      key={c.id}
                      href={`#${c.id}`}
                      onClick={stop}
                      draggable={false}
                      aria-current={on ? "true" : undefined}
                      aria-label={t.sections[c.id]}
                      className="absolute inset-y-0 block cursor-pointer p-px"
                      style={{ left: `${c.start * 100}%`, width: `${(c.end - c.start) * 100}%` }}
                    >
                      <span
                        className="flex h-full items-center overflow-hidden rounded-[5px] border-l-2 px-1.5 transition-colors duration-300"
                        style={{
                          borderColor: c.color,
                          background: `color-mix(in oklab, ${c.color} ${on ? 48 : 20}%, transparent)`,
                        }}
                      >
                        <span
                          className="hidden truncate font-mono text-[10px] uppercase tracking-[0.1em] md:block"
                          style={{ color: on ? "#fff" : `color-mix(in oklab, ${c.color} 65%, white)` }}
                        >
                          {t.sections[c.id]}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </nav>
              <svg
                aria-hidden
                viewBox={`0 0 ${WAVE.length * 2} 10`}
                preserveAspectRatio="none"
                className="absolute inset-x-0 bottom-0 h-[26%] w-full text-white/20"
              >
                {WAVE.map((h, i) => (
                  <rect key={i} x={i * 2} y={(10 - h) / 2} width="1" height={h} fill="currentColor" />
                ))}
              </svg>
            </div>
            <div
              ref={head}
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-px bg-rey-hi shadow-[0_0_12px_2px_rgb(61_98_255/0.85)]"
            >
              <span className="playhead-cap absolute -left-[6px] -top-1 h-3.5 w-[13px] bg-rey-hi" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
