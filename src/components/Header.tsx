import type { Dict } from "@/i18n/dictionaries";

export function Header({ t }: { t: Dict["nav"] }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-void/85 to-transparent" />
      <div className="relative mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:h-20 md:px-10">
        <a
          href="#intro"
          aria-label={t.home}
          className="pointer-events-auto font-display text-[2rem] font-extrabold uppercase leading-none tracking-[0.02em]"
        >
          Askitar<span className="text-rey-hi">.</span>
        </a>
        <nav className="pointer-events-auto flex items-center gap-2">
          <a
            href={t.switchHref}
            aria-label={t.switchLabel}
            className="glass grid h-9 min-w-9 place-items-center rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-white/10"
          >
            {t.switchTo}
          </a>
          <a
            href="#contact"
            className="grid h-9 place-items-center rounded-full bg-fg px-4 text-[13px] font-medium text-void transition-transform duration-200 hover:scale-[1.03]"
          >
            {t.contact}
          </a>
        </nav>
      </div>
    </header>
  );
}
