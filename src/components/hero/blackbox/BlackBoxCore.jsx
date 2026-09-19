import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easeInOut, lerp, range } from "./blackBoxMath";

/**
 * The centre of the box: a small octahedron in restrained brass. It starts
 * almost unlit ("unresolved") and warms as the structure is understood, then
 * settles at a modest emission once the case is formed. No bloom, no halo.
 */
function BlackBoxCore({ progressRef, material }) {
  const meshRef = useRef(null);
  const lightRef = useRef(null);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useFrame(({ clock }) => {
    const p = progressRef.current.value;
    const understanding = easeInOut(range(p, 0.2, 0.6));
    const formed = easeInOut(range(p, 0.8, 1));
    const level = 0.04 + understanding * 0.3 + formed * 0.66;

    // Blink: a soft, steady heartbeat of light (about 1.4s a cycle), on top of the
    // stage-driven warmth. It never drops to dark, so the core always reads as lit.
    const beat = reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(clock.elapsedTime * 4.5);
    const shine = 0.45 + 0.55 * beat;

    material.emissiveIntensity = (0.3 + level * 1.1) * shine;

    const mesh = meshRef.current;
    if (mesh) {
      mesh.scale.setScalar(lerp(0.78, 1, easeInOut(range(p, 0.3, 0.95))) * (1 + 0.035 * beat));
      // Turns a quarter-turn and stops: mechanical, not floating
      mesh.rotation.y = Math.PI / 4 + (1 - easeInOut(range(p, 0.35, 0.9))) * 1.2;
    }

    if (lightRef.current) lightRef.current.intensity = (0.3 + level * 2.6) * (0.6 + 0.4 * beat);
  });

  return (
    <group>
      <mesh ref={meshRef} material={material} rotation={[0.42, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.38, 0]} />
      </mesh>
      <pointLight ref={lightRef} color="#c9a227" distance={4.5} decay={2} intensity={0.15} />
    </group>
  );
}

export default BlackBoxCore;
