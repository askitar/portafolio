"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { useMotion } from "@/lib/motion";
import { useStage } from "./Stage";

/**
 * The presentation video. A muted highlight loop sits in the hero;
 * pressing it opens the full piece with sound.
 */
export function HeroIntro({ t }: { t: Dict["hero"]["intro"] }) {
  const motion = useMotion(false);
  const { stop } = useStage();
  const preview = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const full = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = preview.current;
    if (!el || !motion || open) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      el.pause();
    };
  }, [motion, open]);

  const show = () => {
    stop();
    setOpen(true);
    dialog.current?.showModal();
    full.current?.play().catch(() => {});
  };

  const onClose = () => {
    full.current?.pause();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="intro-tilt group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/20 bg-panel text-left md:rounded-[26px]"
      >
        <video
          ref={preview}
          muted
          loop
          playsInline
          preload="none"
          poster="/media/presentation.jpg"
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 size-full object-cover"
        >
          <source src="/media/presentation-preview.mp4" type="video/mp4" />
        </video>
        <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-linear-to-t from-void/90 to-transparent p-3 pt-14 md:p-5 md:pt-20">
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-full bg-fg text-void transition-transform duration-300 group-hover:scale-110 md:size-14"
          >
            <svg width="15" height="17" viewBox="0 0 14 16" fill="currentColor" className="ml-0.5">
              <path d="M0 0l14 8-14 8z" />
            </svg>
          </span>
          <span>
            <span className="block text-[1rem] font-semibold leading-tight md:text-lg">{t.watch}</span>
            <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-fg/80">
              {t.length}
            </span>
          </span>
        </span>
      </button>

      <dialog
        ref={dialog}
        onClose={onClose}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label={t.watch}
        data-lenis-prevent
        className="theater"
      >
        <video
          ref={full}
          controls
          playsInline
          preload="none"
          poster="/media/presentation.jpg"
          onEnded={() => dialog.current?.close()}
          className="block aspect-video w-full rounded-2xl bg-void"
        >
          <source src="/media/presentation.mp4" type="video/mp4" />
        </video>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="mx-auto mt-4 block h-11 rounded-full bg-fg px-6 text-[15px] font-medium text-void"
        >
          {t.close}
        </button>
      </dialog>
    </>
  );
}
