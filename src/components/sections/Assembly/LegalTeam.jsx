import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { TEAM, easeInOut, range, smooth, teamTimes } from "./assemblyTimeline";
import { INLAYS, getRoleGeometry, getShadowTexture } from "./roleModule";

const BRASS = new THREE.Color("#c9a227");
const GRAY = new THREE.Color("#8a8d93");
const LABEL_GRAY = [85, 88, 94];
const LABEL_BRASS = [201, 162, 39];
const CORE_PORT = 0.8; // connectors start just inside the core, so they never leave a gap
const BASE_ROTATION = [0.3, -0.42, 0]; // every role is turned the same way
const PULSE_SECONDS = 0.9;

/** One role: the shared module, its identifying brass inlay, a soft shadow and its label. */
function RoleNode({ member, index, nodesRef, shadowMaterial, shadowGeometry }) {
  const shared = useMemo(() => getRoleGeometry(), []);
  const faceZ = shared.halfDepth + 0.004;

  // Every part of a role is created here so each role can pulse independently
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: "#2b2d32",
        metalness: 0.6,
        roughness: 0.38,
        transparent: true,
        opacity: 0,
        emissive: BRASS,
        emissiveIntensity: 0,
      }),
      inlay: new THREE.MeshStandardMaterial({
        color: BRASS,
        metalness: 1,
        roughness: 0.35,
        emissive: BRASS,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0,
      }),
      edges: new THREE.LineBasicMaterial({ color: GRAY, transparent: true, opacity: 0 }),
    }),
    []
  );

  useEffect(
    () => () => {
      materials.body.dispose();
      materials.inlay.dispose();
      materials.edges.dispose();
    },
    [materials]
  );

  const register = (name) => (node) => {
    if (!nodesRef.current[index]) nodesRef.current[index] = {};
    nodesRef.current[index][name] = node;
  };

  // Set once the materials exist
  useEffect(() => {
    if (!nodesRef.current[index]) nodesRef.current[index] = {};
    Object.assign(nodesRef.current[index], {
      bodyMat: materials.body,
      inlayMat: materials.inlay,
      edgesMat: materials.edges,
    });
  }, [index, materials, nodesRef]);

  // The connector attaches to the middle of the face that looks toward the core
  const [ax, ay] = member.axis;
  const anchor = [-ax * shared.halfWidth, -ay * shared.halfHeight, 0];

  return (
    <group ref={register("outer")}>
      <group ref={register("shadow")}>
        <mesh geometry={shadowGeometry} material={shadowMaterial} position={[0.08, -0.12, -0.5]} scale={[1.7, 1.7, 1]} />
      </group>

      <group ref={register("body")}>
        <mesh geometry={shared.body} material={materials.body} />
        <lineSegments geometry={shared.edges} material={materials.edges} />

        <group position={[0, 0, faceZ]}>
          {INLAYS[member.id].map((part, i) => {
            const [px, py] = part.pos;
            if (part.type === "bar") {
              return (
                <mesh
                  key={i}
                  geometry={shared.bar}
                  material={materials.inlay}
                  position={[px, py, 0]}
                  rotation={[0, 0, part.rot || 0]}
                  scale={[part.scale[0], part.scale[1], 0.006]}
                />
              );
            }
            return (
              <mesh
                key={i}
                geometry={part.type === "ring" ? shared.ring : shared.dot}
                material={materials.inlay}
                position={[px, py, 0]}
                scale={[part.scale, part.scale, 1]}
              />
            );
          })}
        </group>

        <object3D ref={register("anchor")} position={anchor} />
      </group>

      <Html position={[0, member.labelDy, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[5, 0]}>
        <div ref={register("label")} className="asm-label">
          {member.label}
        </div>
      </Html>
    </group>
  );
}

/**
 * TEAM FORMED. Four roles arrive one after another on the axes of one
 * coordinate system, each settling into place before its brass connector is
 * drawn from the core to a real anchor point on the role. On arrival a role
 * gives one gentle pulse (scale, brass inlay, label), then settles.
 *
 * The team never dissolves. Once formed it stays, with only a very restrained
 * living state (a hair of breathing and a slow brass shimmer).
 */
function LegalTeam({ progressRef, reducedMotion }) {
  const nodesRef = useRef([]);
  const linesRef = useRef(null);

  const shadowGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const shadowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getShadowTexture(),
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
    []
  );
  useEffect(
    () => () => {
      shadowGeometry.dispose();
      shadowMaterial.dispose();
    },
    [shadowGeometry, shadowMaterial]
  );

  const rest = useMemo(() => TEAM.map((m) => new THREE.Vector3(...m.pos)), []);
  const dirs = useMemo(() => rest.map((r) => r.clone().normalize()), [rest]);
  // Roles arrive from outside along their own axis, from slightly behind the plane
  const starts = useMemo(
    () => rest.map((r, k) => r.clone().addScaledVector(dirs[k], 0.9).add(new THREE.Vector3(0, 0, -1.4))),
    [rest, dirs]
  );
  const pos = useMemo(() => new THREE.Vector3(), []);
  const from = useMemo(() => new THREE.Vector3(), []);
  const anchorWorld = useMemo(() => new THREE.Vector3(), []);
  const to = useMemo(() => new THREE.Vector3(), []);
  const linePositions = useMemo(() => new Float32Array(TEAM.length * 2 * 3), []);
  const pulses = useMemo(() => TEAM.map(() => ({ start: -10, active: false })), []);

  useFrame(({ clock }) => {
    const p = progressRef.current.value;
    const time = clock.elapsedTime;

    TEAM.forEach((member, k) => {
      const node = nodesRef.current[k];
      if (!node || !node.outer || !node.bodyMat) return;
      const t = teamTimes(k);

      const move = easeInOut(range(p, t.move[0], t.move[1]));
      const lineIn = easeInOut(range(p, t.line[0], t.line[1]));
      const labelIn = smooth(range(p, t.label[0], t.label[1]));

      // With reduced motion the roles do not travel: they fade in at their places
      pos.lerpVectors(starts[k], rest[k], reducedMotion ? 1 : move);
      node.outer.position.copy(pos);

      // Activation: one gentle pulse when the role locks into the formation
      const pulse = pulses[k];
      const active = labelIn > 0.5;
      if (active && !pulse.active && !reducedMotion) pulse.start = time;
      pulse.active = active;
      const age = time - pulse.start;
      const envelope = age >= 0 && age < PULSE_SECONDS ? Math.pow(Math.sin((Math.PI * age) / PULSE_SECONDS), 2) : 0;
      const hold = age >= 0 && age < 1.6 ? 1 - smooth(range(age, PULSE_SECONDS, 1.6)) : 0;

      // Once formed: a hair of breathing and a slow shimmer on the inlay, no more
      const formed = !reducedMotion && labelIn > 0.99;
      const breathe = formed ? 0.012 * Math.sin(time * 0.9 + k * 1.7) : 0;
      const shimmer = formed ? 0.07 * Math.sin(time * 1.3 + k * 2.1) : 0;

      const presence = smooth(range(move, 0, 0.5));
      if (node.body) {
        node.body.scale.setScalar(Math.max(0.0001, (reducedMotion ? 1 : presence) * (1 + 0.15 * envelope + breathe)));
        const turn = reducedMotion ? 0 : 1 - move; // every role arrives with the same quarter-turn
        node.body.rotation.set(BASE_ROTATION[0] + turn * 0.3, BASE_ROTATION[1] + turn * 0.9, BASE_ROTATION[2]);
      }
      if (node.shadow) node.shadow.scale.setScalar(Math.max(0.0001, reducedMotion ? 1 : presence));
      if (node.shadow) node.shadow.visible = presence > 0.01;

      node.bodyMat.opacity = presence;
      node.bodyMat.emissiveIntensity = 0.14 * envelope;
      node.inlayMat.opacity = presence;
      node.inlayMat.emissiveIntensity = 0.25 + 0.9 * envelope + shimmer;
      node.edgesMat.opacity = 0.55 * presence;
      node.edgesMat.color.lerpColors(GRAY, BRASS, Math.max(lineIn * 0.5, envelope));

      if (node.label) {
        node.label.style.opacity = String(labelIn);
        const mix = Math.max(envelope, hold);
        const r = Math.round(LABEL_GRAY[0] + (LABEL_BRASS[0] - LABEL_GRAY[0]) * mix);
        const g = Math.round(LABEL_GRAY[1] + (LABEL_BRASS[1] - LABEL_GRAY[1]) * mix);
        const b = Math.round(LABEL_GRAY[2] + (LABEL_BRASS[2] - LABEL_GRAY[2]) * mix);
        node.label.style.color = `rgb(${r},${g},${b})`;
      }

      // Connector: from a port on the core to the role's real anchor point
      from.copy(dirs[k]).multiplyScalar(CORE_PORT);
      if (node.anchor && node.outer) {
        node.outer.updateMatrixWorld(true);
        node.anchor.getWorldPosition(anchorWorld);
      } else {
        anchorWorld.copy(pos);
      }
      to.lerpVectors(from, anchorWorld, lineIn);
      linePositions.set([from.x, from.y, from.z, to.x, to.y, to.z], k * 6);
    });

    const lines = linesRef.current;
    if (lines) lines.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {TEAM.map((member, index) => (
        <RoleNode
          key={member.id}
          member={member}
          index={index}
          nodesRef={nodesRef}
          shadowMaterial={shadowMaterial}
          shadowGeometry={shadowGeometry}
        />
      ))}
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={TEAM.length * 2} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#c9a227" transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
}

export default LegalTeam;
