import { seeded } from "@/lib/seeded";

const W = 1600;
const ROW = 46;
const GAP = 10;

/**
 * The hero's editing timeline, carried down the page: a band of clips and waveforms that
 * drifts behind a section in its own color. Drawn twice side by side so the loop has no seam.
 */
export function EditTracks({ color, seed, flip = false }: { color: string; seed: number; flip?: boolean }) {
  const rnd = seeded(seed * 977 + 13);
  const mixes = [100, 70, 85, 60];
  const clips: { x: number; y: number; w: number; fill: string; audio: boolean }[] = [];
  for (let row = 0; row < 10; row++) {
    const audio = row >= 5;
    let x = 0;
    while (x < W) {
      const w = Math.min(W - x, Math.round(90 + rnd() * 250));
      if (rnd() > 0.28 && w > 30) {
        const mix = mixes[Math.floor(rnd() * mixes.length)];
        clips.push({
          x,
          y: row * (ROW + GAP) + (audio ? 18 : 0),
          w: w - 5,
          fill: `color-mix(in oklab, ${color} ${mix}%, ${audio ? "#19c3b1" : "#9b6dff"})`,
          audio,
        });
      }
      x += w;
    }
  }
  const pattern = `wave-${seed}`;
  const height = 10 * (ROW + GAP) + 18;

  const sequence = (key: number) => (
    <g key={key} transform={`translate(${key * W} 0)`}>
      {clips.map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={c.y} width={c.w} height={ROW} rx={6} fill={c.fill} />
          {c.audio ? (
            <rect x={c.x + 4} y={c.y} width={Math.max(0, c.w - 8)} height={ROW} fill={`url(#${pattern})`} />
          ) : (
            <rect x={c.x} y={c.y} width={c.w} height={11} rx={5} fill="#fff" opacity={0.22} />
          )}
        </g>
      ))}
    </g>
  );

  return (
    <div aria-hidden className={`tracks ${flip ? "tracks-flip" : ""}`}>
      <svg width={W * 2} height={height} viewBox={`0 0 ${W * 2} ${height}`} className="tracks-run">
        <defs>
          <pattern id={pattern} width="64" height={ROW + GAP} patternUnits="userSpaceOnUse" y="18">
            {[12, 26, 18, 34, 22, 10, 30, 16].map((h, i) => (
              <rect key={i} x={i * 8 + 2} y={(ROW - h) / 2} width="3" height={h} fill="#fff" opacity="0.4" />
            ))}
          </pattern>
        </defs>
        {[0, 1].map(sequence)}
      </svg>
    </div>
  );
}
