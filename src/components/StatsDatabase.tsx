"use client";

import { useMemo, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import {
  accountColor,
  accountHandle,
  accounts,
  compact,
  engagementRate,
  percent,
  shortDate,
  videoUrl,
  videos,
  type AccountId,
  type Lang,
  type VideoStat,
} from "@/lib/stats";
import { ArrowUpRight, SortArrow } from "./icons";

type SortKey = "date" | "views" | "likes" | "comments" | "shares" | "saves" | "engagement";
type Sort = { key: SortKey; dir: 1 | -1 };

const COLUMNS: { key: SortKey; show: string }[] = [
  { key: "date", show: "" },
  { key: "views", show: "" },
  { key: "likes", show: "" },
  { key: "comments", show: "hidden xl:table-cell" },
  { key: "shares", show: "hidden lg:table-cell" },
  { key: "saves", show: "hidden xl:table-cell" },
  { key: "engagement", show: "" },
];

const valueOf = (v: VideoStat, key: SortKey): number =>
  key === "engagement" ? engagementRate(v) : key === "date" ? Date.parse(v.date) : v[key];

const PREVIEW_ROWS = 5;

const maxViews = Math.max(...videos.map((v) => v.views));

/** Sortable, filterable table of the top videos. Every row links to the original on TikTok. */
export function StatsDatabase({ t, lang }: { t: Dict["impact"]["db"]; lang: Lang }) {
  const [sort, setSort] = useState<Sort>({ key: "views", dir: -1 });
  const [account, setAccount] = useState<"all" | AccountId>("all");
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const list = videos.filter((v) => account === "all" || v.account === account);
    return [...list].sort((a, b) => (valueOf(a, sort.key) - valueOf(b, sort.key)) * sort.dir);
  }, [sort, account]);
  const shown = expanded ? rows : rows.slice(0, PREVIEW_ROWS);

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === -1 ? 1 : -1 } : { key, dir: -1 }));

  const cell = (v: VideoStat, key: SortKey) =>
    key === "date"
      ? shortDate(v.date, lang)
      : key === "engagement"
        ? percent(engagementRate(v), lang)
        : compact(v[key], lang);

  const formatLabel = (v: VideoStat) => t.formats[v.format as keyof typeof t.formats] ?? v.format;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h3 className="font-display text-[2.8rem] font-bold uppercase leading-none md:text-[4rem]">
            {t.title}
          </h3>
          <p className="mt-2 text-[0.95rem] text-dim md:text-base">{t.intro}</p>
        </div>
        <div role="group" aria-label={t.columns.account} className="flex flex-wrap gap-1.5">
          {(["all", ...accounts.map((a) => a.id)] as const).map((id) => {
            const on = account === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setAccount(id)}
                className={`h-9 rounded-full px-3.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                  on ? "bg-fg text-void" : "glass text-dim hover:text-fg"
                }`}
              >
                {id === "all" ? t.all : accountHandle(id)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone: sort picker, since there are no column headers */}
      <label className="mt-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-dim md:hidden">
        {t.sortBy}
        <select
          value={sort.key}
          onChange={(e) => setSort({ key: e.target.value as SortKey, dir: -1 })}
          className="glass h-9 flex-1 rounded-full bg-panel px-3 text-fg"
        >
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>
              {t.columns[c.key]}
            </option>
          ))}
        </select>
      </label>

      <div className="glass mt-5 overflow-hidden rounded-3xl md:mt-8">
        {/* Desktop and tablet: table */}
        <table className="hidden w-full border-collapse text-left md:table">
          <thead>
            <tr className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">
              <th scope="col" className="w-12 py-4 pl-6 pr-2 font-normal">
                #
              </th>
              <th scope="col" className="py-4 pr-4 font-normal">
                {t.columns.video}
              </th>
              {COLUMNS.map((c) => {
                const on = sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                    className={`py-4 pr-5 text-right font-normal last:pr-6 ${c.show}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className={`inline-flex items-center gap-1.5 uppercase tracking-[0.14em] transition-colors hover:text-fg ${
                        on ? "text-fg" : ""
                      }`}
                    >
                      {t.columns[c.key]}
                      <SortArrow dir={on ? sort.dir : 0} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((v, i) => (
              <tr key={v.id} className="border-t border-line transition-colors hover:bg-white/[0.04]">
                <td className="py-4 pl-6 pr-2 font-mono text-[11px] tabular-nums text-faint">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="py-4 pr-4">
                  <a
                    href={videoUrl(v)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t.watch}
                    className="inline-flex items-center gap-2 font-medium transition-colors hover:text-rey-hi"
                  >
                    {v.title[lang]}
                    <ArrowUpRight size={12} className="shrink-0 opacity-60" />
                  </a>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint">
                    <span
                      aria-hidden
                      className="inline-block size-1.5 rounded-full"
                      style={{ background: accountColor[v.account] }}
                    />
                    {accountHandle(v.account)} · {formatLabel(v)}
                  </div>
                </td>
                {COLUMNS.map((c) => (
                  <td
                    key={c.key}
                    className={`py-4 pr-5 text-right tabular-nums last:pr-6 ${c.show} ${
                      c.key === "views" ? "font-medium text-fg" : "text-dim"
                    } ${c.key === "date" ? "whitespace-nowrap text-[13px]" : ""}`}
                  >
                    {cell(v, c.key)}
                    {c.key === "views" && (
                      <span aria-hidden className="mt-1.5 block h-[3px] w-full rounded-full bg-white/[0.07]">
                        <span
                          className="ml-auto block h-full rounded-full"
                          style={{
                            width: `${Math.max(3, (v.views / maxViews) * 100)}%`,
                            background: accountColor[v.account],
                          }}
                        />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Phone: one card per video */}
        <ol className="md:hidden">
          {shown.map((v, i) => (
            <li key={v.id} className="border-t border-line first:border-t-0">
              <a href={videoUrl(v)} target="_blank" rel="noopener noreferrer" className="block p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium leading-snug">
                    <span className="mr-2 font-mono text-[11px] text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {v.title[lang]}
                  </p>
                  <ArrowUpRight size={13} className="mt-1 shrink-0 opacity-60" />
                </div>
                <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
                  <span
                    aria-hidden
                    className="inline-block size-1.5 rounded-full"
                    style={{ background: accountColor[v.account] }}
                  />
                  {accountHandle(v.account)} · {shortDate(v.date, lang)}
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2">
                  {(["views", "likes", "engagement"] as const).map((key) => (
                    <div key={key} className="flex flex-col-reverse">
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">
                        {t.columns[key]}
                      </dt>
                      <dd className="font-display text-[1.9rem] font-bold leading-none tabular-nums">
                        {cell(v, key)}
                      </dd>
                    </div>
                  ))}
                </dl>
                <span aria-hidden className="mt-3 block h-[3px] w-full rounded-full bg-white/[0.07]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(3, (v.views / maxViews) * 100)}%`,
                      background: accountColor[v.account],
                    }}
                  />
                </span>
              </a>
            </li>
          ))}
        </ol>

        {rows.length > PREVIEW_ROWS && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            className="flex h-12 w-full items-center justify-center gap-2 border-t border-line font-mono text-[11px] uppercase tracking-[0.14em] text-dim transition-colors hover:bg-white/[0.04] hover:text-fg"
          >
            {expanded ? t.less : t.more.replace("{n}", String(rows.length))}
            <SortArrow dir={expanded ? 1 : -1} />
          </button>
        )}
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-faint">{t.note}</p>
    </div>
  );
}
