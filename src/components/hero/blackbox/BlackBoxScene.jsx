import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import BlackBoxLighting from "./BlackBoxLighting";
import BlackBoxStructure from "./BlackBoxStructure";
import CalloutDriver from "./CalloutDriver";

/**
 * Keeps the object filling roughly 70% of the slot whatever its aspect
 * ratio, and eases the shared scroll progress (set by ScrollTrigger in
 * CaseBlackBox) so the mechanism glides rather than tracking the wheel 1:1.
 */
function Rig({ progressRef }) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    camera.position.set(0, 0.15, 14.5 * Math.max(1, 1.2 / aspect));
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

function BlackBoxScene({
  progressRef,
  pointerRef,
  tier,
  interactive,
  frameloop,
  onReady,
  calloutRegistry,
  reducedMotion,
}) {
  // 3D anchor points on the cube geometry, shared by the structure and the callout driver
  const anchorsRef = useRef({});

  return (
    <Canvas
      frameloop={frameloop}
      camera={{ position: [0, 0.15, 14.5], fov: 30, near: 0.1, far: 60 }}
      dpr={tier === "full" ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
    >
      <Rig progressRef={progressRef} />
      <BlackBoxLighting tier={tier} />
      <BlackBoxStructure
        progressRef={progressRef}
        pointerRef={pointerRef}
        tier={tier}
        interactive={interactive}
        anchorsRef={anchorsRef}
      />
      <CalloutDriver
        registry={calloutRegistry}
        anchorsRef={anchorsRef}
        progressRef={progressRef}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

export default BlackBoxScene;
