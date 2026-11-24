import { dictionaries } from "@/i18n/dictionaries";
import type { Lang } from "@/lib/stats";
import { Contact } from "./Contact";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Impact } from "./Impact";
import { MotionReel } from "./MotionReel";
import { MotionToggle } from "./MotionToggle";
import { Showcase } from "./Showcase";
import { Stage } from "./Stage";
import { TimelineDock } from "./TimelineDock";

/** The whole one-page site for one language. */
export function Site({ lang }: { lang: Lang }) {
  const t = dictionaries[lang];
  return (
    <Stage>
      <div aria-hidden className="page-backdrop" />
      <Header t={t.nav} />
      <MotionToggle t={t.motionPref} />
      <main className="relative pb-[var(--dock-h)]">
        <Hero t={t.hero} lang={lang} />
        <MotionReel index="01" t={t.mograph} reel={t.reel} lang={lang} />
        <Impact t={t.impact} lang={lang} reel={t.reel} />
        <Showcase id="filmmaking" index="03" t={t.filmmaking} lang={lang} reel={t.reel} />
        <Showcase id="motion" index="04" t={t.motion} lang={lang} reel={t.reel} />
        <Showcase id="dummies" index="05" t={t.dummies} lang={lang} reel={t.reel} />
        <Showcase id="lora" index="06" t={t.lora} lang={lang} reel={t.reel} />
        <Contact t={t.contact} lang={lang} />
      </main>
      <TimelineDock t={t.dock} />
    </Stage>
  );
}
