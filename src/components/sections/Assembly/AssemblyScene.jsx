import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const DOMAINS = ["Consumer", "Labour", "Property", "Criminal", "Civil", "RTI"];
const POINTS_PER_CLUSTER = 26;
const RADIUS = 3.2;

const BRASS = new THREE.Color("#c9a227");
const DIM = new THREE.Color("#4a4a55");

function buildClusters() {
  return DOMAINS.map((domain, domainIndex) => {
    const angle = (domainIndex / DOMAINS.length) * Math.PI * 2;
    const centerX = Math.cos(angle) * RADIUS;
    const centerY = Math.sin(angle) * RADIUS;

    const points = new Float32Array(POINTS_PER_CLUSTER * 3);
    for (let i = 0; i < POINTS_PER_CLUSTER; i += 1) {
      points[i * 3] = centerX + (Math.random() - 0.5) * 0.9;
      points[i * 3 + 1] = centerY + (Math.random() - 0.5) * 0.9;
      points[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
    }

    return { domain, points };
  });
}

function Cluster({ domain, points, active }) {
  const materialRef = useRef(null);
  const pointsRef = useRef(null);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const target = active ? BRASS : DIM;
    materialRef.current.color.lerp(target, delta * 3);
    const targetOpacity = active ? 1 : 0.35;
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      targetOpacity,
      delta * 3
    );
    const targetSize = active ? 0.09 : 0.05;
    materialRef.current.size = THREE.MathUtils.lerp(
      materialRef.current.size,
      targetSize,
      delta * 3
    );
    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta * (active ? 0.12 : 0.03);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={DIM}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.35}
      />
    </points>
  );
}

function Scene({ activeDomain }) {
  const clusters = useMemo(buildClusters, []);
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.02;
  });

  return (
    <group ref={groupRef}>
      {clusters.map((cluster) => (
        <Cluster
          key={cluster.domain}
          domain={cluster.domain}
          points={cluster.points}
          active={cluster.domain === activeDomain}
        />
      ))}
    </group>
  );
}

/**
 * Lightweight instanced-points constellation representing the
 * specialist agent domains. Only the domain relevant to the current
 * story is highlighted in brass; the rest stay dim, showing that a
 * different team assembles for a different story.
 */
function AssemblyScene({ activeDomain }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene activeDomain={activeDomain} />
    </Canvas>
  );
}

export default AssemblyScene;
export { DOMAINS };
