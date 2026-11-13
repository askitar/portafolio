"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import { roundedPlane, roundedRect, seeded } from "@/lib/three-shapes";
import { HeroTimeline } from "./HeroTimeline";

/** Pointer and scroll, written by window listeners and read every frame. */
type Shared = { px: number; py: number; scroll: number };
type SharedRef = RefObject<Shared>;

const damp = THREE.MathUtils.damp;

/** Where the slab rests. Desktop: right side, so the headline keeps the left. Phone: top center. */
function useSlabBase(portrait: boolean) {
  const width = useThree((s) => s.viewport.width);
  const height = useThree((s) => s.viewport.height);
  const pixels = useThree((s) => s.size.height);
  if (portrait) {
    // Same zone as the CSS poster: starts 84px from the top and is 30% of the viewport tall.
    const s = (0.3 * height) / 4.04;
    const y = height * 0.35 - (84 * height) / pixels;
    return { x: 0, y, s, ry: -0.2, rz: 0.03 };
  }
  return { x: Math.min(width * 0.25, 3.2), y: 0.1, s: 0.84, ry: -0.42, rz: 0.055 };
}

/** The 9:16 glass slab that plays the reel. */
function Slab({ shared, portrait, onReady }: { shared: SharedRef; portrait: boolean; onReady: () => void }) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const base = useSlabBase(portrait);
  const texture = useVideoTexture("/media/hero-loop.mp4", {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
  });

  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(2.36, 4.04, 0.3), {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 4,
      curveSegments: 18,
    });
    g.center();
    return g;
  }, []);
  const screen = useMemo(() => roundedPlane(2.2, 3.88, 0.24), []);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    time.current += dt;
    const { px, py, scroll } = shared.current;
    g.rotation.y = damp(g.rotation.y, base.ry + px * 0.3 + scroll * 1.3, 4, dt);
    g.rotation.x = damp(g.rotation.x, 0.05 - py * 0.14 + scroll * 0.3, 4, dt);
    g.rotation.z = damp(g.rotation.z, base.rz, 4, dt);
    g.position.x = damp(g.position.x, base.x, 5, dt);
    g.position.y = damp(
      g.position.y,
      base.y + Math.sin(time.current * 0.7) * 0.07 + scroll * 2.0,
      5,
      dt,
    );
    g.scale.setScalar(damp(g.scale.x, base.s * (1 - scroll * 0.2), 5, dt));
  });

  return (
    <group ref={group} position={[base.x, base.y, 0]} rotation={[0.05, base.ry, base.rz]} scale={base.s}>
      <mesh geometry={body}>
        <meshPhysicalMaterial
          color="#090d1a"
          metalness={0.9}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </mesh>
      <mesh geometry={screen} position={[0, 0, 0.087]}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Thin clear layer that picks up reflections over the video */}
      <mesh geometry={screen} position={[0, 0, 0.09]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.07}
          roughness={0.02}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

/** The playhead: a line of light that crosses every track and passes behind the slab. */
function Beam({ portrait }: { portrait: boolean }) {
  const base = useSlabBase(portrait);
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

function Scene({ shared, onReady }: { shared: SharedRef; onReady: () => void }) {
  const portrait = useThree((s) => s.viewport.aspect < 1);
  const base = useSlabBase(portrait);
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} />
      <pointLight position={[-4, 1, 3]} color="#3d62ff" intensity={60} distance={18} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 4, 3]} scale={[8, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={5} color="#2b50ff" position={[-5, 0, 2]} scale={[2, 8, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.6} color="#ff8a3d" position={[5, -1, 1]} scale={[1.2, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={2} color="#a9b9ff" position={[0, 0, 6]} scale={3} />
      </Environment>
      <Beam portrait={portrait} />
      <Dust />
      <HeroTimeline shared={shared} portrait={portrait} slabY={base.y} />
      <Suspense fallback={null}>
        <Slab shared={shared} portrait={portrait} onReady={onReady} />
      </Suspense>
    </>
  );
}

export default function HeroScene({ onReady }: { onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ px: 0, py: 0, scroll: 0 });
  const [active, setActive] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 35, position: [0, 0, 8], near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={active ? "always" : "never"}
      >
        <Scene shared={shared} onReady={onReady} />
      </Canvas>
    </div>
  );
}
