import { dictionaries } from "@/i18n/dictionaries";
import type { Lang } from "@/lib/stats";
import { Contact } from "./Contact";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Impact } from "./Impact";
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
        <Impact t={t.impact} lang={lang} labels={t.clip} />
        <Showcase id="filmmaking" index="02" t={t.filmmaking} lang={lang} labels={t.clip} />
        <Showcase id="motion" index="03" t={t.motion} lang={lang} labels={t.clip} />
        <Showcase id="dummies" index="04" t={t.dummies} lang={lang} labels={t.clip} />
        <Showcase id="lora" index="05" t={t.lora} lang={lang} labels={t.clip} />
        <Contact t={t.contact} lang={lang} />
      </main>
      <TimelineDock t={t.dock} />
    </Stage>
  );
}
