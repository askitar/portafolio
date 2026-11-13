import raw from "@/data/stats.json";

export type Lang = "en" | "es";
export type AccountId = "astrea" | "askitar";
export type Localized = Record<Lang, string>;

export type Account = {
  id: AccountId;
  handle: string;
  url: string;
  role: Localized;
  note: Localized;
  created: string;
  followers: number;
  likes: number;
  videos: number;
};

export type VideoStat = {
  id: string;
  account: AccountId;
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  duration: number;
  format: string;
  title: Localized;
};

export type Metric = { value: number; changePct: number | null };

export type GrowthRecord = {
  id: string;
  account: AccountId;
  /** Only confirmed records are shown on the site. */
  confirmed: boolean;
  days: number;
  from?: string;
  to?: string;
  capturedOn: string;
  label: Localized;
  metrics: Partial<
    Record<"views" | "reach" | "likes" | "shares" | "comments" | "profileViews", Metric>
  >;
};

export const snapshotDate: string = raw.snapshotDate;
export const accounts = raw.accounts as Account[];
export const videos = raw.videos as VideoStat[];
export const growth = (raw.growth as GrowthRecord[]).filter((g) => g.confirmed);

export const accountColor: Record<AccountId, string> = {
  astrea: "#b678ff",
  askitar: "#6f8bff",
};

export const accountHandle = (id: AccountId) => accounts.find((a) => a.id === id)!.handle;

export const videoUrl = (v: VideoStat) =>
  `https://www.tiktok.com/${accounts.find((a) => a.id === v.account)!.handle}/video/${v.id}`;

/** Likes, comments, shares and saves over views. */
export const engagementRate = (v: VideoStat) =>
  (v.likes + v.comments + v.shares + v.saves) / v.views;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export const totals = {
  followers: sum(accounts.map((a) => a.followers)),
  likes: sum(accounts.map((a) => a.likes)),
  posts: sum(accounts.map((a) => a.videos)),
  topVideoViews: sum(videos.map((v) => v.views)),
  topVideoCount: videos.length,
  millionPlus: videos.filter((v) => v.views >= 1_000_000).length,
  biggest: Math.max(...videos.map((v) => v.views)),
};

/** 174214 -> "174.2K", 16100000 -> "16.1M". Spanish uses a comma and a spaced M. */
export function compact(n: number, lang: Lang = "en"): string {
  const fmt = (x: number, digits: number) => {
    const s = x.toFixed(digits).replace(/\.0+$/, "");
    return lang === "es" ? s.replace(".", ",") : s;
  };
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${fmt(m, m >= 100 ? 0 : 1)}${lang === "es" ? " M" : "M"}`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${fmt(k, k >= 100 ? 0 : 1)}K`;
  }
  return String(n);
}

export function full(n: number, lang: Lang = "en"): string {
  return new Intl.NumberFormat(lang === "es" ? "es-CO" : "en-US").format(n);
}

export function percent(x: number, lang: Lang = "en", digits = 1): string {
  const s = (x * 100).toFixed(digits);
  return `${lang === "es" ? s.replace(".", ",") : s}${lang === "es" ? " %" : "%"}`;
}

export function shortDate(iso: string, lang: Lang = "en"): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function longDate(iso: string, lang: Lang = "en"): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
