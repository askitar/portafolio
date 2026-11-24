import { pieces } from "./mograph";
import type { SectionId } from "./sections";
import { showcase } from "./showcase";
import { videos, type Localized, type VideoStat } from "./stats";

/** One card of a reel, whatever section it comes from. */
export type ReelItem = {
  key: string;
  /** Path without extension: there is a .mp4 and a .jpg */
  src: string;
  ratio: number;
  color: string;
  title: Localized;
  note: Localized;
  sound?: boolean;
  stat?: VideoStat;
};

/** The color each clip throws into the room, picked from its own picture. */
const CLIP_COLOR: Record<string, string> = {
  "viral-regalos": "#3d62ff",
  "viral-regalos-2": "#8f7dff",
  "viral-niveles": "#b23cff",
  "viral-semana": "#7b2fe0",
  "doc-momoy": "#ff8a3d",
  "doc-runescape": "#e8b923",
  "ugc-miniso": "#3d8bff",
  "ugc-remington": "#ff5a4d",
  "vlog-summit": "#ff7a1f",
  "3d-candelaria": "#5f93d6",
  "3d-personaje": "#7fbf3f",
  "3d-red": "#d9a52b",
  "code-colombia": "#17a3c4",
  "ia-claude-modelos-v3": "#ff6f5c",
  "ia-tokens": "#e0552f",
  "ia-subagentes": "#e8413c",
  "ia-chatbot-vs-agente": "#c98a35",
};

export function reelItems(id: SectionId): ReelItem[] {
  if (id === "mograph") {
    return pieces.map((p) => ({
      key: p.file,
      src: `/media/mograph/${p.file}`,
      ratio: 9 / 16,
      color: p.color,
      title: p.title,
      note: p.note,
      sound: true,
    }));
  }
  return (showcase[id] ?? []).map((c) => ({
    key: c.file,
    src: `/media/clips/${c.file}`,
    ratio: c.ratio,
    color: CLIP_COLOR[c.file] ?? "#3d62ff",
    title: c.title,
    note: c.tag,
    stat: c.videoId ? videos.find((v) => v.id === c.videoId) : undefined,
  }));
}
