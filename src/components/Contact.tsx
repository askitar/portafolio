import type { Dict } from "@/i18n/dictionaries";
import { LOGOS } from "@/lib/logos";
import { profile } from "@/lib/profile";
import { longDate, snapshotDate, type Lang } from "@/lib/stats";
import { ArrowUpRight } from "./icons";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

function MailIcon() {
  return (
    <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <path d="m3.500 7 8.500 6.500L20.500 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TikTokIcon({ size = 26 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={LOGOS.tiktok.path} />
    </svg>
  );
}

export function Contact({ t, lang }: { t: Dict["contact"]; lang: Lang }) {
  return (
    <SectionShell id="contact" index="07" label={t.label}>
      <Reveal>
        <h2 className="max-w-[13ch] font-display text-[clamp(3.6rem,11vw,10rem)] font-extrabold uppercase leading-[0.85]">
          {t.title}
        </h2>
        <p className="mt-6 text-[1.05rem] text-dim md:text-lg">{t.body}</p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2">
        <Reveal>
          <a
            href={`mailto:${profile.email}`}
            className="group relative flex h-full items-center justify-between gap-4 overflow-hidden rounded-3xl bg-linear-to-br from-rey via-[#3f5fff] to-violet p-6 shadow-[0_30px_80px_-30px_rgb(43_80_255/0.9)] transition-transform duration-300 hover:-translate-y-1 md:p-8"
          >
            <span className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15">
                <MailIcon />
              </span>
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/75">
                  {t.email}
                </span>
                <span className="mt-1.5 block break-all text-xl font-semibold md:text-2xl">{profile.email}</span>
              </span>
            </span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-fg text-void transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight />
            </span>
          </a>
        </Reveal>
        <Reveal delay={0.08}>
          <a
            href={profile.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-full items-center justify-between gap-4 overflow-hidden rounded-3xl bg-linear-to-br from-rose via-[#c04fd0] to-teal p-6 shadow-[0_30px_80px_-30px_rgb(236_90_168/0.8)] transition-transform duration-300 hover:-translate-y-1 md:p-8"
          >
            <span className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-void/35">
                <TikTokIcon />
              </span>
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
                  {t.tiktok}
                </span>
                <span className="mt-1.5 block text-xl font-semibold md:text-2xl">{profile.tiktok.handle}</span>
              </span>
            </span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-fg text-void transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight />
            </span>
          </a>
        </Reveal>
      </div>

      <div className="mt-14 md:mt-20">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">{t.brandsTitle}</h3>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          {profile.brands.map((b, i) => (
            <li key={b.name}>
              <Reveal delay={i * 0.06} className="h-full">
                <div
                  className={`flex h-full flex-col justify-between gap-6 rounded-3xl p-6 md:p-7 ${
                    b.featured
                      ? "border border-rey-hi/50 bg-linear-to-br from-rey/35 to-violet/15 shadow-[0_24px_70px_-34px_rgb(43_80_255/0.9)]"
                      : "glass"
                  }`}
                >
                  <p
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] ${
                      b.featured ? "bg-fg text-void" : "border border-line text-dim"
                    }`}
                  >
                    {b.work[lang]}
                  </p>
                  <div>
                    <p className="flex items-center gap-3 font-display text-[2.5rem] font-bold uppercase leading-[0.9] md:text-[3rem]">
                      {b.featured && <TikTokIcon size={34} />}
                      {b.name}
                    </p>
                    {b.note && <p className="mt-3 text-[0.92rem] leading-relaxed text-fg/75">{b.note[lang]}</p>}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-16 flex flex-wrap justify-between gap-3 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-faint md:mt-24">
        <span>
          © {snapshotDate.slice(0, 4)} {profile.name}
        </span>
        <span>{t.footer.replace("{date}", longDate(snapshotDate, lang))}</span>
      </footer>
    </SectionShell>
  );
}
