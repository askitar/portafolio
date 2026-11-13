"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { roundedPlane, seeded } from "@/lib/three-shapes";

type TrackKind = "video" | "audio";
type TrackSpec = {
  kind: TrackKind;
  colors: string[];
  /** 1 = wall to wall clips, lower leaves empty stretches */
  density: number;
  min: number;
  max: number;
};

// Top to bottom, like a finished sequence: titles and graphics, b-roll, the main cut,
// then dialogue, effects and music.
const TRACKS: TrackSpec[] = [
  { kind: "video", colors: ["#ec5aa8", "#ff7ac0"], density: 0.38, min: 0.4, max: 1.0 },
  { kind: "video", colors: ["#ff8a3d", "#ffb347"], density: 0.5, min: 0.5, max: 1.5 },
  { kind: "video", colors: ["#19c3b1", "#3fb6e8"], density: 0.62, min: 0.5, max: 1.4 },
  { kind: "video", colors: ["#9b6dff", "#c59bff"], density: 0.72, min: 0.6, max: 1.7 },
  { kind: "video", colors: ["#6f8bff", "#4f6fff"], density: 0.85, min: 0.7, max: 1.9 },
  { kind: "video", colors: ["#3d62ff", "#2b50ff"], density: 1, min: 0.6, max: 2.2 },
  { kind: "audio", colors: ["#2fbf71", "#3ecf8e"], density: 1, min: 0.6, max: 2.2 },
  { kind: "audio", colors: ["#58d68d"], density: 0.6, min: 0.6, max: 1.6 },
  { kind: "audio", colors: ["#f2c94c", "#ffd866"], density: 0.42, min: 0.3, max: 0.8 },
  { kind: "audio", colors: ["#ff8a3d"], density: 0.32, min: 0.3, max: 0.7 },
  { kind: "audio", colors: ["#19c3b1"], density: 1, min: 2.6, max: 4.2 },
  { kind: "audio", colors: ["#9b6dff"], density: 0.55, min: 1.4, max: 3.0 },
];

const MAIN_VIDEO = 5;
const DIALOGUE = 6;

const TRACK_H = 0.34;
const TRACK_PITCH = 0.42;
const TRACK_SPLIT = 0.16; // extra room between the video and audio halves
const LOOP = 12; // the sequence repeats every LOOP units
const CUT = 0.03; // the sliver between two clips
const WAVE_UNIT = 1.6; // world units covered by one repeat of the waveform
const LANE_W = 11;

type TimelineClip = { track: number; x: number; w: number; color: string };
type Shared = { px: number; py: number; scroll: number };

/** Lays the clips out once. Dialogue shares its cuts with the main video track. */
function buildSequence(): TimelineClip[] {
  const rnd = seeded(29);
  const out: TimelineClip[] = [];
  TRACKS.forEach((t, track) => {
    if (track === DIALOGUE) return;
    let x = 0;
    let n = 0;
    while (x < LOOP - t.min) {
      const w = Math.min(t.min + rnd() * (t.max - t.min), LOOP - x);
      if (rnd() < t.density) {
        out.push({ track, x: x + w / 2, w: w - CUT, color: t.colors[n % t.colors.length] });
        if (track === MAIN_VIDEO) {
          const d = TRACKS[DIALOGUE];
          out.push({ track: DIALOGUE, x: x + w / 2, w: w - CUT, color: d.colors[n % d.colors.length] });
        }
        n++;
      }
      x += w;
    }
  });
  return out;
}

function trackY(track: number) {
  const half = TRACKS.length / 2;
  const row = half - 0.5 - track;
  return row * TRACK_PITCH + (track < half ? TRACK_SPLIT / 2 : -TRACK_SPLIT / 2);
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Grey-scale faces that get tinted by each clip's label color. */
function buildTextures() {
  const video = canvasTexture(8, 64, (ctx) => {
    ctx.fillStyle = "#c4c4c4";
    ctx.fillRect(0, 0, 8, 64);
    ctx.fillStyle = "#ffffff"; // the name strip along the top of a clip
    ctx.fillRect(0, 0, 8, 15);
    ctx.fillStyle = "#8f8f8f";
    ctx.fillRect(0, 15, 8, 2);
  });
  const audio = canvasTexture(256, 64, (ctx) => {
    const rnd = seeded(7);
    ctx.fillStyle = "#8a8a8a";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 64; i++) {
      const swell = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.37) * Math.sin(i * 0.11 + 1));
      const h = Math.max(3, Math.round((0.25 + rnd() * 0.75) * swell * 52));
      ctx.fillRect(i * 4 + 1, 32 - h / 2, 2, h);
    }
  });
  audio.wrapS = THREE.RepeatWrapping;
  const lane = canvasTexture(256, 4, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.14, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 4);
  });
  const ruler = canvasTexture(2048, 32, (ctx) => {
    ctx.fillStyle = "#ffffff";
    const ticks = LANE_W * 8;
    for (let i = 0; i <= ticks; i++) {
      const x = Math.round((i / ticks) * 2046);
      const tall = i % 8 === 0;
      ctx.globalAlpha = Math.min(1, i / (ticks * 0.14)) * (tall ? 1 : 0.55);
      ctx.fillRect(x, tall ? 0 : 18, 2, tall ? 32 : 14);
    }
  });
  return { video, audio, lane, ruler };
}

/** Rounded clip face. Audio clips get waveform UVs that keep their density whatever the clip length. */
function clipGeometry(w: number, kind: TrackKind): THREE.ShapeGeometry {
  const geo = roundedPlane(w, TRACK_H, Math.min(0.05, w / 2));
  if (kind === "audio") {
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setX(i, (pos.getX(i) + w / 2) / WAVE_UNIT);
    uv.needsUpdate = true;
  }
  return geo;
}

const wrap = (v: number, m: number) => ((v % m) + m) % m;
const damp = THREE.MathUtils.damp;

/**
 * A full sequence, V tracks above and A tracks below, playing slowly behind the slab.
 * It fades out toward the left so the headline keeps a clean background.
 */
export function HeroTimeline({
  shared,
  portrait,
  slabY,
}: {
  shared: RefObject<Shared>;
  portrait: boolean;
  slabY: number;
}) {
  const group = useRef<THREE.Group>(null);
  const lanes = useRef<(THREE.Group | null)[]>([]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const time = useRef(0);
  const width = useThree((s) => s.viewport.width);
  const tex = useMemo(() => buildTextures(), []);
  const clips = useMemo(() => buildSequence(), []);
  const geos = useMemo(() => clips.map((c) => clipGeometry(c.w, TRACKS[c.track].kind)), [clips]);

  // Desktop: starts just right of the headline. Phone: a band behind the slab, edge to edge.
  const scale = portrait ? 0.32 : 1;
  const originX = portrait ? -width / 2 - 0.5 : -0.35;
  const originY = portrait ? slabY : 0;
  const tilt = portrait ? -0.06 : -0.12;

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    time.current += dt;
    const t = time.current;
    const { px, py, scroll } = shared.current;
    g.rotation.y = damp(g.rotation.y, tilt + px * 0.05, 3, dt);
    g.rotation.x = damp(g.rotation.x, -py * 0.03, 3, dt);
    g.position.y = damp(g.position.y, originY + scroll * 2.4, 5, dt);

    // Each track breathes on its own, so the layers read as floating sheets.
    lanes.current.forEach((lane, i) => {
      if (!lane) return;
      lane.position.y = trackY(i) + Math.sin(t * 0.55 + i * 1.3) * 0.022;
      lane.position.z = (i % 3) * 0.16 - 0.16 + Math.sin(t * 0.4 + i * 0.9) * 0.07;
    });

    // Scrolling the page scrubs the sequence forward.
    const offset = t * 0.11 + scroll * 5;
    clips.forEach((c, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const x = wrap(c.x - offset, LOOP) - 1.4;
      m.position.x = x;
      const fade = THREE.MathUtils.smoothstep(x, 0.2, 1.5);
      (m.material as THREE.MeshBasicMaterial).opacity = fade * 0.92;
      m.visible = fade > 0.01;
    });
  });

  const top = trackY(0) + TRACK_PITCH * 0.5 + 0.12;
  return (
    <group ref={group} position={[originX, originY, -1.7]} rotation={[0, tilt, 0]} scale={scale}>
      {/* Time ruler */}
      <mesh position={[LANE_W / 2, top, 0]}>
        <planeGeometry args={[LANE_W, 0.11]} />
        <meshBasicMaterial
          map={tex.ruler}
          color="#aebcff"
          transparent
          opacity={0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {TRACKS.map((track, i) => (
        <group
          key={i}
          ref={(el) => {
            lanes.current[i] = el;
          }}
          position={[0, trackY(i), 0]}
        >
          <mesh position={[LANE_W / 2, 0, -0.02]}>
            <planeGeometry args={[LANE_W, TRACK_H + 0.04]} />
            <meshBasicMaterial
              map={tex.lane}
              color="#9fb0ff"
              transparent
              opacity={0.07}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {clips.map((c, j) =>
            c.track === i ? (
              <mesh
                key={j}
                ref={(el) => {
                  meshes.current[j] = el;
                }}
                geometry={geos[j]}
                position={[c.x, 0, 0]}
              >
                <meshBasicMaterial
                  map={track.kind === "audio" ? tex.audio : tex.video}
                  color={c.color}
                  transparent
                  opacity={0}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            ) : null,
          )}
        </group>
      ))}
    </group>
  );
}
