"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { seeded } from "@/lib/seeded";
import { HeroTimeline } from "./HeroTimeline";

/** Pointer and scroll, written by window listeners and read every frame. */
type Shared = { px: number; py: number; scroll: number };
type SharedRef = RefObject<Shared>;

/** Center of the presentation player, which the playhead crosses. Phone: top center. */
function usePlayerSpot(portrait: boolean) {
  const width = useThree((s) => s.viewport.width);
  const height = useThree((s) => s.viewport.height);
  if (portrait) return { x: 0, y: height * 0.26 };
  return { x: Math.min(width * 0.25, 3.2), y: 0.1 };
}

/** The playhead: a line of light that crosses every track and passes behind the player. */
function Beam({ portrait }: { portrait: boolean }) {
  const base = usePlayerSpot(portrait);
  const glow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const across = ctx.createLinearGradient(0, 0, 64, 0);
    across.addColorStop(0, "rgba(43,80,255,0)");
    across.addColorStop(0.5, "rgba(150,172,255,1)");
    across.addColorStop(1, "rgba(43,80,255,0)");
    ctx.fillStyle = across;
    ctx.fillRect(0, 0, 64, 256);
    // Fade both ends so the beam never reads as a hard divider.
    ctx.globalCompositeOperation = "destination-in";
    const along = ctx.createLinearGradient(0, 0, 0, 256);
    along.addColorStop(0, "rgba(0,0,0,0)");
    along.addColorStop(0.28, "rgba(0,0,0,1)");
    along.addColorStop(0.72, "rgba(0,0,0,1)");
    along.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = along;
    ctx.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group position={[base.x - (portrait ? 0.12 : 0.3), base.y, -0.9]} scale={[1, portrait ? 0.36 : 1, 1]}>
      <mesh>
        <planeGeometry args={[1.7, 10]} />
        <meshBasicMaterial
          map={glow}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[0.06, 10]} />
        <meshBasicMaterial
          map={glow}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Slow dust in the light. Seeded so every load looks the same. */
function Dust() {
  const points = useRef<THREE.Points>(null);
  const time = useRef(0);
  const geo = useMemo(() => {
    const n = 260;
    const arr = new Float32Array(n * 3);
    const rnd = seeded(11);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rnd() - 0.5) * 15;
      arr[i * 3 + 1] = (rnd() - 0.5) * 9;
      arr[i * 3 + 2] = 1.5 - rnd() * 8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    const p = points.current;
    if (!p) return;
    time.current += dt;
    p.rotation.y = Math.sin(time.current * 0.05) * 0.1;
    p.position.y = Math.sin(time.current * 0.11) * 0.25;
  });

  return (
    <points ref={points} geometry={geo}>
      <pointsMaterial size={0.024} color="#a9b9ff" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** Without a render loop, ask for a few extra frames while textures and the environment settle. */
function Settle() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const ids = [60, 300, 900, 2000].map((ms) => window.setTimeout(() => invalidate(), ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [invalidate]);
  return null;
}

function Scene({ shared, animate }: { shared: SharedRef; animate: boolean }) {
  const portrait = useThree((s) => s.viewport.aspect < 1);
  const base = usePlayerSpot(portrait);
  return (
    <>
      <Beam portrait={portrait} />
      <Dust />
      <HeroTimeline shared={shared} portrait={portrait} slabY={base.y} />
      {!animate && <Settle />}
    </>
  );
}

/**
 * The hero's 3D stage. With `animate` off it draws the same scene once and holds it:
 * no render loop, no pointer or scroll response.
 */
export default function HeroScene({ animate }: { animate: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ px: 0, py: 0, scroll: 0 });
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!animate) {
      shared.current = { px: 0, py: 0, scroll: 0 };
      return;
    }
    const onMove = (e: PointerEvent) => {
      shared.current.px = (e.clientX / window.innerWidth) * 2 - 1;
      shared.current.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      shared.current.scroll = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    // Stop rendering once the hero is off screen.
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [animate]);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 35, position: [0, 0, 8], near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={animate ? (active ? "always" : "never") : "demand"}
      >
        <Scene shared={shared} animate={animate} />
      </Canvas>
    </div>
  );
}
