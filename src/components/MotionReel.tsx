import type { Dict } from "@/i18n/dictionaries";
import { reelItems } from "@/lib/reel";
import type { Lang } from "@/lib/stats";
import { Reel } from "./Reel";
import { SectionShell } from "./SectionShell";

export function MotionReel({
  t,
  reel,
  index,
  lang,
}: {
  t: Dict["mograph"];
  reel: Dict["reel"];
  index: string;
  lang: Lang;
}) {
  return (
    <SectionShell id="mograph" index={index} label={t.label}>
      <Reel
        items={reelItems("mograph")}
        lang={lang}
        t={reel}
        label={t.label}
        intro={
          <>
            <h2 className="section-title">{t.title}</h2>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-dim md:text-lg">{t.body}</p>
          </>
        }
      />
    </SectionShell>
  );
}
