import { useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeCourtroomAssets } from "./proceduralTextures";

const STONE = "#eee8da";
const SANDSTONE = "#d8c3a3";
const OAK = "#d6bd9a";
const WALNUT = "#a88a68";

/** Tall arched window: rectangle + semicircle. */
function archShape(w, h) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h);
  s.absarc(0, h, w / 2, Math.PI, 0, true);
  s.lineTo(w / 2, 0);
  s.closePath();
  return s;
}

function Column({ x, compact }) {
  return (
    <group position={[x, 0, -7]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1, 0.4, 1]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 7, compact ? 12 : 20]} />
        <meshStandardMaterial color={SANDSTONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 7.55, 0]}>
        <boxGeometry args={[1.05, 0.4, 1.05]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Hall({ stateRef, compact, chakra }) {
  const windowGeometry = useMemo(() => new THREE.ShapeGeometry(archShape(1.7, 4.2), 16), []);
  const frameGeometry = useMemo(() => new THREE.ShapeGeometry(archShape(2.0, 4.4), 16), []);

  // A few degrees of slow parallax with the sequence, so the room reads as deep
  useFrame(({ camera }) => {
    const n = stateRef.current.sumNorm ?? 0;
    camera.position.x = (n - 0.5) * 0.7;
    camera.lookAt(0, 2.6, -9);
  });

  const windows = compact ? [-4.6, 4.6] : [-9, -5.2, 5.2, 9];
  const columns = compact ? [-3.2, 3.2] : [-3.2, 3.2, -8.6, 8.6];

  return (
    <>
      <hemisphereLight args={["#fff6e6", "#cfc4b0", 1.15]} />
      <directionalLight position={[-6, 8, 4]} color="#ffe6c4" intensity={1.5} />

      {/* back wall, floor */}
      <mesh position={[0, 4.4, -10]}>
        <boxGeometry args={[40, 10, 0.4]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#ebe4d6" roughness={0.8} />
      </mesh>

      {/* arched windows: the daylight source of the room */}
      {windows.map((x) => (
        <group key={x} position={[x, 0.4, -9.78]}>
          <mesh geometry={frameGeometry} position={[0, -0.1, 0]}>
            <meshStandardMaterial color="#c9bda3" roughness={0.9} />
          </mesh>
          <mesh geometry={windowGeometry} position={[0, 0, 0.02]}>
            <meshBasicMaterial color="#fff7e8" />
          </mesh>
        </group>
      ))}

      {columns.map((x) => (
        <Column key={x} x={x} compact={compact} />
      ))}
      <mesh position={[0, 8, -7]}>
        <boxGeometry args={[40, 0.7, 1.1]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>

      {/* raised judge's bench */}
      <group position={[0, 0, -7.4]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[7.4, 0.5, 3.2]} />
          <meshStandardMaterial color={OAK} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.3, -0.6]}>
          <boxGeometry args={[4.6, 1.6, 0.9]} />
          <meshStandardMaterial color={WALNUT} roughness={0.7} />
        </mesh>
        {[-1.5, 0, 1.5].map((x) => (
          <mesh key={x} position={[x, 1.25, -0.13]}>
            <boxGeometry args={[1.3, 1.0, 0.06]} />
            <meshStandardMaterial color="#7a5a3b" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 2.16, -0.55]}>
          <boxGeometry args={[4.9, 0.12, 1.1]} />
          <meshStandardMaterial color="#6f5136" roughness={0.6} />
        </mesh>
        {/* high-backed chair */}
        <mesh position={[0, 2.5, -1.15]}>
          <boxGeometry args={[1.3, 2.4, 0.25]} />
          <meshStandardMaterial color="#5f4632" roughness={0.75} />
        </mesh>
      </group>

      {/* Ashoka chakra plaque — small, on the wall above the bench */}
      <mesh position={[0, 5.7, -9.74]}>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial map={chakra} roughness={0.85} />
      </mesh>
    </>
  );
}

/**
 * The courtroom: pale sandstone columns, arched daylight windows, a raised
 * oak-and-walnut bench and a small Ashoka chakra plaque. Rendered at a fraction of
 * the screen resolution and softened further with CSS, so it reads as an
 * out-of-focus room behind the argument system. Fog fades it toward the white page.
 */
function CrossfireCourtroom({ stateRef, compact }) {
  const assets = useMemo(() => makeCourtroomAssets(), []);
  useEffect(() => () => assets.dispose(), [assets]);

  return (
    <Canvas
      dpr={0.45}
      frameloop="demand"
      camera={{ fov: 36, near: 0.5, far: 80, position: [0, 1.6, 5.5] }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power", toneMapping: THREE.NeutralToneMapping }}
      onCreated={({ gl, scene, invalidate }) => {
        gl.setClearColor(0x000000, 0);
        scene.fog = new THREE.Fog("#ffffff", 6, 24);
        stateRef.current.invalidateBackdrop = invalidate;
        invalidate();
      }}
    >
      <Hall stateRef={stateRef} compact={compact} chakra={assets.chakra} />
    </Canvas>
  );
}

export default CrossfireCourtroom;
