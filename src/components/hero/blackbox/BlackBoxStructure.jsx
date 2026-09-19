import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BlackBoxCore from "./BlackBoxCore";
import { LEVELS, easeInOut, lerp, range, smooth } from "./blackBoxMath";
import { ANCHORS } from "./calloutData";

const BRASS = "#c9a227";

/** Shared geometry + materials, created once and disposed on unmount. */
function useBlackBoxAssets() {
  const assets = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);

    const outer = new THREE.MeshStandardMaterial({ color: "#18191c", metalness: 0.55, roughness: 0.5 });
    const inner = new THREE.MeshStandardMaterial({ color: "#090a0c", metalness: 0.5, roughness: 0.55 });
    const steel = new THREE.MeshStandardMaterial({ color: "#55585e", metalness: 0.75, roughness: 0.42 });
    const plate = new THREE.MeshStandardMaterial({ color: "#060708", metalness: 0.2, roughness: 0.8 });

    const brass = () =>
      new THREE.MeshStandardMaterial({
        color: BRASS,
        metalness: 1,
        roughness: 0.38,
        emissive: BRASS,
        emissiveIntensity: 0.04,
      });

    const thread = new THREE.MeshStandardMaterial({
      color: BRASS,
      metalness: 0.6,
      roughness: 0.4,
      emissive: BRASS,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.2,
    });

    return {
      box,
      outer,
      inner,
      steel,
      plate,
      thread,
      // Polished, bright gold: smoother and lighter than the frame accents so it reads as shining
      core: new THREE.MeshStandardMaterial({
        color: "#f0cd5c",
        metalness: 1,
        roughness: 0.16,
        emissive: BRASS,
        emissiveIntensity: 0.4,
      }),
      accents: LEVELS.map(brass),
    };
  }, []);

  useEffect(
    () => () => {
      assets.box.dispose();
      [assets.outer, assets.inner, assets.steel, assets.plate, assets.thread, assets.core, ...assets.accents].forEach(
        (m) => m.dispose()
      );
    },
    [assets]
  );

  return assets;
}

/** Four bars forming a square frame in the XY plane. */
function FrameBars({ size, bar, geometry, material }) {
  const edge = size / 2 - bar / 2;
  return (
    <>
      <mesh geometry={geometry} material={material} position={[0, edge, 0]} scale={[size, bar, bar]} />
      <mesh geometry={geometry} material={material} position={[0, -edge, 0]} scale={[size, bar, bar]} />
      <mesh geometry={geometry} material={material} position={[-edge, 0, 0]} scale={[bar, size - bar * 2, bar]} />
      <mesh geometry={geometry} material={material} position={[edge, 0, 0]} scale={[bar, size - bar * 2, bar]} />
    </>
  );
}

const RAIL_SIGNS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

/**
 * One chamber: a front frame, a back frame, four rails joining them and
 * (for the inner levels) a dark back plate. The frames start pushed apart
 * and twisted; as scroll progress reaches this level's `lock` point they
 * ease into a true cube.
 */
function Level({ cfg, index, assets, progressRef, anchorsRef }) {
  const groupRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const plateRef = useRef(null);
  const railRefs = useRef([]);

  const { size, bar, open, dz, rz, lock, spread, plate, tone } = cfg;
  const edge = size / 2 - bar / 2;
  const material = tone === "outer" ? assets.outer : assets.inner;
  const railMaterial = tone === "outer" ? assets.steel : assets.inner;
  const accent = assets.accents[index];

  // Callout anchors that live on this chamber's front / back frame (they move with it)
  const anchorsFor = (where) =>
    Object.entries(ANCHORS)
      .filter(([, a]) => a.level === index && a.where === where)
      .map(([key, a]) => (
        <object3D
          key={key}
          ref={(node) => {
            if (node) anchorsRef.current[key] = node;
            else delete anchorsRef.current[key];
          }}
          position={[a.corner[0] * edge, a.corner[1] * edge, 0]}
        />
      ));

  useFrame(({ clock }) => {
    const p = progressRef.current.value;
    const inv = 1 - easeInOut(range(p, lock - 0.3, lock + 0.16));
    const converge = easeInOut(range(p, 0.8, 1));

    const group = groupRef.current;
    if (group) {
      group.position.z = dz * inv;
      group.rotation.z = rz * inv;
      group.scale.setScalar(1 + spread * (1 - converge));
    }

    const d = edge * (1 + (open - 1) * inv);
    if (frontRef.current) frontRef.current.position.z = d;
    if (backRef.current) backRef.current.position.z = -d;
    if (plateRef.current) plateRef.current.position.z = -d + bar * 0.6;
    railRefs.current.forEach((rail) => {
      if (rail) rail.scale.z = d * 2 + bar;
    });

    // A single slow brass pulse travels outer → inner while the structure is
    // being understood, then the accents settle to a low steady glow.
    const t = clock.elapsedTime;
    const wave = (t * 0.75) % 5.2 - 0.6;
    const pulse = Math.exp(-Math.pow(index - wave, 2) / 0.35);
    const stage = smooth(range(p, 0.12, 0.3)) * (1 - smooth(range(p, 0.62, 0.8)));
    accent.emissiveIntensity = 0.04 + stage * pulse * 0.9 + converge * 0.16;
  });

  return (
    <group ref={groupRef}>
      <group ref={frontRef}>
        <FrameBars size={size} bar={bar} geometry={assets.box} material={material} />
        {/* thin brass inlay on the face of the top bar */}
        <mesh
          geometry={assets.box}
          material={accent}
          position={[0, edge, bar / 2 + 0.002]}
          scale={[size * 0.62, bar * 0.14, 0.006]}
        />
        {anchorsFor("front")}
      </group>
      <group ref={backRef}>
        <FrameBars size={size} bar={bar} geometry={assets.box} material={material} />
        {anchorsFor("back")}
      </group>

      {RAIL_SIGNS.map(([sx, sy], i) => (
        <mesh
          key={i}
          ref={(node) => {
            railRefs.current[i] = node;
          }}
          geometry={assets.box}
          material={railMaterial}
          position={[sx * edge, sy * edge, 0]}
          scale={[bar, bar, size]}
        />
      ))}

      {plate && (
        <mesh
          ref={plateRef}
          geometry={assets.box}
          material={assets.plate}
          scale={[size - bar * 2, size - bar * 2, 0.02]}
        />
      )}
    </group>
  );
}

/**
 * The Black Box: nested chambers around a brass core, plus a single brass
 * hairline that appears in the "raw story" state and is absorbed by the core.
 */
function BlackBoxStructure({ progressRef, pointerRef, tier, interactive, anchorsRef }) {
  const assets = useBlackBoxAssets();
  const groupRef = useRef(null);
  const threadRef = useRef(null);

  // Lite tier drops one mid-level to keep the mesh count down
  const levels = useMemo(
    () => LEVELS.map((cfg, index) => ({ cfg, index })).filter(({ index }) => tier === "full" || index !== 2),
    [tier]
  );

  useFrame((_, delta) => {
    const p = progressRef.current.value;
    const group = groupRef.current;
    if (group) {
      const px = interactive ? pointerRef.current.x : 0;
      const py = interactive ? pointerRef.current.y : 0;
      const k = 1 - Math.exp(-delta * 4);
      // Tiny parallax only: ≈ 2–4px of shift, no rotation control
      group.position.x += (px * 0.06 - group.position.x) * k;
      group.position.y += (-py * 0.045 - group.position.y) * k;
      // The opened-up starting state is wider than the finished cube, so it starts
      // smaller and grows into the slot as the layers close.
      group.scale.setScalar(lerp(0.74, 1, easeInOut(range(p, 0.05, 0.9))));
      group.rotation.x = lerp(-0.34, -0.26, p) - py * 0.015;
      group.rotation.y = lerp(0.62, 0.5, p) + px * 0.025;
    }

    const thread = threadRef.current;
    if (thread) {
      const appear = easeInOut(range(p, 0, 0.35));
      const absorbed = 1 - smooth(range(p, 0.72, 0.95));
      thread.scale.x = 2.4 * (0.3 + 0.7 * appear);
      assets.thread.opacity = (0.16 + 0.5 * appear) * absorbed;
    }
  });

  return (
    <group ref={groupRef}>
      {levels.map(({ cfg, index }) => (
        <Level key={index} cfg={cfg} index={index} assets={assets} progressRef={progressRef} anchorsRef={anchorsRef} />
      ))}
      <mesh ref={threadRef} geometry={assets.box} material={assets.thread} scale={[2.4, 0.014, 0.014]} position={[0, 0, 0.05]} />
      <BlackBoxCore progressRef={progressRef} material={assets.core} />
      {/* "Case ready" attaches to the core itself */}
      <object3D
        ref={(node) => {
          if (node) anchorsRef.current.ready = node;
          else delete anchorsRef.current.ready;
        }}
      />
    </group>
  );
}

export default BlackBoxStructure;
