import type { CSSProperties } from "react";
import type { Clip } from "@/lib/showcase";
import { videos, type Lang } from "@/lib/stats";
import { ClipCard, type ClipLabels } from "./ClipCard";

const GAP = 16;

/**
 * A row of previews with one shared height. On desktop the height is solved so the row fits
 * the container exactly; on phones it scrolls sideways. Hovering one clip lifts it and dims the rest.
 */
export function Filmstrip({
  clips,
  lang,
  labels,
  maxHeight,
}: {
  clips: Clip[];
  lang: Lang;
  labels: ClipLabels;
  /** CSS length that caps the desktop height */
  maxHeight?: string;
}) {
  const units = clips.reduce((sum, c) => sum + c.ratio, 0);
  const style = {
    "--h-fit": `calc((100cqw - ${(clips.length - 1) * GAP}px) / ${units.toFixed(4)})`,
    ...(maxHeight ? { "--h-max": maxHeight } : {}),
  } as CSSProperties;

  return (
    <div className="[container-type:inline-size]">
      <div className="strip -mx-5 -my-4 flex snap-x gap-4 overflow-x-auto px-5 py-4 md:mx-0 md:px-0" style={style}>
        {clips.map((clip) => (
          <ClipCard
            key={clip.file}
            clip={clip}
            lang={lang}
            labels={labels}
            stat={clip.videoId ? videos.find((v) => v.id === clip.videoId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
