import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Minimal rig: soft ambient, one large key, a faint rim, and a procedural
 * studio environment (built from Lightformers, so nothing is downloaded) that
 * gives the graphite its satin reflections. A soft contact shadow grounds the
 * floating structure on desktop-class GPUs.
 */
function BlackBoxLighting({ tier }) {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    scene.environmentIntensity = 0.7;
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.5} color="#fffaf0" />
      <directionalLight position={[-4, 2, -5]} intensity={0.7} color="#dfe6ee" />

      <Environment resolution={tier === "full" ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 2]} scale={[12, 4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} position={[-6, 1, 3]} scale={[5, 8, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.5} position={[6, 0, -2]} scale={[5, 8, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.35} color="#f3e2a6" position={[0, -3, 5]} scale={[8, 2, 1]} />
      </Environment>

      {tier === "full" && (
        <ContactShadows
          position={[0, -2.75, 0]}
          opacity={0.26}
          scale={8}
          blur={3.2}
          far={4.5}
          resolution={256}
          color="#1a1408"
        />
      )}
    </>
  );
}

export default BlackBoxLighting;
