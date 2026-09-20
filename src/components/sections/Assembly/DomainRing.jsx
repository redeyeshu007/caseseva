import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { DOMAIN, RING, easeInOut, range } from "./assemblyTimeline";

const RING_RADIUS = 1.62;
const SEGMENTS = 128;
const RING_ANGLE = (38 * Math.PI) / 180;
const GRAY = new THREE.Color("#6f7278");
const BRASS = new THREE.Color("#c9a227");

/**
 * DOMAIN DETECTED: a thin boundary draws itself around the core and turns
 * brass, and a short hairline carries the classification (PROPERTY) out to a
 * small label. Both stay as part of the completed system.
 */
function DomainRing({ progressRef }) {
  const labelRef = useRef(null);
  const labelGroupRef = useRef(null);
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const ring = useMemo(() => {
    const points = [];
    for (let i = 0; i <= SEGMENTS; i += 1) {
      const a = (i / SEGMENTS) * Math.PI * 2 + Math.PI / 2;
      points.push(new THREE.Vector3(Math.cos(a) * RING_RADIUS, Math.sin(a) * RING_RADIUS, 0));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setDrawRange(0, 0);
    const material = new THREE.LineBasicMaterial({ color: GRAY, transparent: true, opacity: 0.9 });
    return { line: new THREE.Line(geometry, material), geometry, material };
  }, []);

  // Leader from a point on the ring out to the label
  const leader = useMemo(() => {
    const start = new THREE.Vector3(Math.cos(RING_ANGLE) * RING_RADIUS, Math.sin(RING_ANGLE) * RING_RADIUS, 0);
    const end = new THREE.Vector3(2.55, 2.05, 0);
    const geometry = new THREE.BufferGeometry().setFromPoints([start, start.clone()]);
    const material = new THREE.LineBasicMaterial({ color: BRASS, transparent: true, opacity: 0 });
    return { line: new THREE.Line(geometry, material), geometry, material, start, end };
  }, []);

  useEffect(
    () => () => {
      ring.geometry.dispose();
      ring.material.dispose();
      leader.geometry.dispose();
      leader.material.dispose();
    },
    [ring, leader]
  );

  useFrame(() => {
    const p = progressRef.current.value;

    // Keep the label inside the slot: on a narrow slot it sits closer to the ring
    const unitsToPx = size.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z);
    const labelWidth = (labelRef.current?.offsetWidth || 72) / unitsToPx;
    const halfWidth = size.width / 2 / unitsToPx;
    leader.end.x = Math.min(2.55, Math.max(RING_RADIUS + 0.35, halfWidth - labelWidth - 0.3));
    if (labelGroupRef.current) labelGroupRef.current.position.set(leader.end.x + 0.08, leader.end.y, 0);

    const draw = easeInOut(range(p, RING.draw[0], RING.draw[1]));
    ring.geometry.setDrawRange(0, Math.round(draw * (SEGMENTS + 1)));
    ring.material.color.lerpColors(GRAY, BRASS, easeInOut(range(p, RING.color[0], RING.color[1])));
    ring.material.opacity = 0.9;

    const grow = easeInOut(range(p, RING.leader[0], RING.leader[1]));
    const positions = leader.geometry.attributes.position;
    positions.setXYZ(
      1,
      leader.start.x + (leader.end.x - leader.start.x) * grow,
      leader.start.y + (leader.end.y - leader.start.y) * grow,
      0
    );
    positions.needsUpdate = true;
    leader.material.opacity = 0.75;

    if (labelRef.current) {
      labelRef.current.style.opacity = String(easeInOut(range(p, RING.label[0], RING.label[1])));
    }
  });

  return (
    <group>
      <primitive object={ring.line} />
      <primitive object={leader.line} />
      <group ref={labelGroupRef} position={[leader.end.x + 0.08, leader.end.y, 0]}>
        <Html style={{ pointerEvents: "none" }} zIndexRange={[5, 0]}>
          <div ref={labelRef} className="asm-label asm-label--domain">
            {DOMAIN.toUpperCase()}
          </div>
        </Html>
      </group>
    </group>
  );
}

export default DomainRing;
