import type { Localized } from "./stats";

type Brand = { name: string; work: Localized; note?: Localized; featured?: boolean };

export const profile = {
  name: "Oscar Bohórquez",
  alias: "ASKITAR",
  email: "osibozo@gmail.com",
  tiktok: { handle: "@askitar", url: "https://www.tiktok.com/@askitar" },
  brands: [
    {
      name: "TikTok",
      featured: true,
      work: { en: "B2B", es: "B2B" },
      note: {
        en: "Worked directly with TikTok, business to business.",
        es: "Trabajo directo con TikTok, de empresa a empresa.",
      },
    },
    { name: "Miniso", work: { en: "UGC", es: "UGC" } },
    { name: "Remington", work: { en: "UGC", es: "UGC" } },
    { name: "Summit Adventure Park", work: { en: "Brand vlog", es: "Vlog de marca" } },
  ] as Brand[],
};
