import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import CaseCore from "./CaseCore";
import DomainRing from "./DomainRing";
import LegalTeam from "./LegalTeam";
import ReflectionEffect from "./ReflectionEffect";

/**
 * Keeps the whole formation inside the slot whatever its aspect ratio, and
 * eases the scroll progress (set by ScrollTrigger in Assembly) so the system
 * glides instead of tracking the wheel 1:1. The camera itself never moves.
 */
function Rig({ progressRef }) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    camera.position.set(0, 0, 13.8 * Math.max(1, 1.05 / aspect));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [size, camera]);

  useFrame((_, delta) => {
    const progress = progressRef.current;
    progress.value += (progress.target - progress.value) * (1 - Math.exp(-delta * 5));
    if (Math.abs(progress.target - progress.value) < 0.0005) progress.value = progress.target;
  });

  return null;
}

/** Studio lighting: soft ambient, specular key, rim, and HDR lightformers for high-gloss shine */
function Lighting({ tier }) {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    scene.environmentIntensity = 1.35;
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 2, 4]} intensity={1.3} color="#fff6e8" />
      <directionalLight position={[0, -4, 3]} intensity={0.8} color="#dbe5f1" />
      <pointLight position={[2, 3, 4]} intensity={2.0} distance={12} color="#ffffff" />
      <Environment resolution={tier === "full" ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={3.5} position={[0, 6, 2]} scale={[14, 5, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.2} position={[-6, 2, 4]} scale={[6, 10, 1]} rotation-y={Math.PI / 3} />
        <Lightformer form="rect" intensity={1.8} position={[6, 1, -2]} scale={[6, 10, 1]} rotation-y={-Math.PI / 3} />
        <Lightformer form="circle" intensity={4.0} position={[2, 4, 5]} scale={4} />
      </Environment>
    </>
  );
}

/**
 * THE CASE CORE — one scroll-driven, fully reversible story: an empty scene, then the four roles form
 * one by one around the core, and the finished system holds while the scroll stays there. A single
 * progress value (0–1) drives every part, so scrolling back takes it apart in reverse.
 */
function AssemblyScene({ progressRef, tier = "full", frameloop = "always", reducedMotion = false, overlay }) {
  // progress (0–1) of the one-time reflection sweep; -1 when idle. Shared by the light and the core.
  const sweepRef = useRef({ t: -1 });

  return (
    <Canvas
      frameloop={frameloop}
      camera={{ position: [0, 0, 13.8], fov: 30, near: 0.1, far: 60 }}
      dpr={tier === "full" ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Rig progressRef={progressRef} />
      <Lighting tier={tier} />
      <CaseCore progressRef={progressRef} sweepRef={sweepRef} reducedMotion={reducedMotion} />
      <DomainRing progressRef={progressRef} />
      <LegalTeam progressRef={progressRef} reducedMotion={reducedMotion} />
      <ReflectionEffect progressRef={progressRef} sweepRef={sweepRef} overlay={overlay} reducedMotion={reducedMotion} />
    </Canvas>
  );
}

export default AssemblyScene;
