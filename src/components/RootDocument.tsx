import { display, mono, sans } from "@/app/fonts";
import { MOTION_BOOT_SCRIPT } from "@/lib/motion";
import type { Lang } from "@/lib/stats";

/** Shared <html>/<body> shell. Each language has its own root layout so `lang` is correct in the static HTML. */
export function RootDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    // The boot script sets data-motion on <html> before React hydrates.
    <html
      lang={lang}
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="grain">
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
