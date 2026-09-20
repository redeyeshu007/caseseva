import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { easeInOut, lerp, range } from "./assemblyTimeline";
import { getShadowTexture } from "./roleModule";

const BRASS = "#c9a227";
const RADIUS = 1.05;
const FACE_COUNT = 20;
const MAX_GAP = 0.15; // how far apart the facets start
const EARLY = new THREE.Color("#1e2129");
const FINAL = new THREE.Color("#090a0d");

/**
 * THE CASE CORE — the same faceted form throughout, but it starts incomplete
 * (its twenty facets held slightly apart, with slits between them) and
 * resolves into one closed, heavier solid as the formation completes. It turns
 * slowly with scroll so its depth reads against the still elements around it,
 * and carries a single hairline brass seam.
 */
function CaseCore({ progressRef, sweepRef, reducedMotion }) {
  const groupRef = useRef(null);
  const seamRef = useRef(null);
  const solidRef = useRef(null);
  const edgesRef = useRef(null);
  const materialRef = useRef(null);
  const edgeMaterialRef = useRef(null);
  const lastCompletion = useRef(-1);
  const sheenActive = useRef(false);
  const centre = useMemo(() => new THREE.Vector3(), []);

  // Per-facet data: rest positions, normals, and the buffers that get updated
  const facets = useMemo(() => {
    const source = new THREE.IcosahedronGeometry(RADIUS, 0); // already non-indexed: one triangle per facet
    const rest = source.attributes.position.array.slice();
    const normals = new Float32Array(FACE_COUNT * 3);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (let f = 0; f < FACE_COUNT; f += 1) {
      a.fromArray(rest, f * 9);
      b.fromArray(rest, f * 9 + 3);
      c.fromArray(rest, f * 9 + 6);
      n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
      // make sure the normal points away from the centre, so the facets open outward
      if (n.dot(a.add(b).add(c)) < 0) n.negate();
      n.toArray(normals, f * 3);
    }
    source.dispose();

    const solid = new THREE.BufferGeometry();
    solid.setAttribute("position", new THREE.BufferAttribute(rest.slice(), 3));
    const edges = new THREE.BufferGeometry();
    edges.setAttribute("position", new THREE.BufferAttribute(new Float32Array(FACE_COUNT * 6 * 3), 3));

    // A light-only copy of the surface (shares its positions) that carries the sweep's highlight
    const sheen = new THREE.BufferGeometry();
    sheen.setAttribute("position", solid.attributes.position);
    sheen.setAttribute("color", new THREE.BufferAttribute(new Float32Array(FACE_COUNT * 9), 3));
    return { rest, normals, solid, edges, sheen };
  }, []);

  useEffect(
    () => () => {
      facets.solid.dispose();
      facets.edges.dispose();
      facets.sheen.dispose();
    },
    [facets]
  );

  const shadow = useMemo(
    () => new THREE.MeshBasicMaterial({ map: getShadowTexture(), transparent: true, opacity: 0.22, depthWrite: false }),
    []
  );
  const shadowGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  useEffect(
    () => () => {
      shadow.dispose();
      shadowGeometry.dispose();
    },
    [shadow, shadowGeometry]
  );

  useFrame(() => {
    const p = progressRef.current.value;
    const completion = easeInOut(range(p, 0.02, 0.96));

    const group = groupRef.current;
    if (group) {
      // Incomplete: smaller, its facets apart, still turning. Complete: full size, closed, settled.
      // With reduced motion it keeps the finished orientation and only closes up.
      const turn = reducedMotion ? 1.2 : p * 0.75 + (1 - completion) * 1.1;
      group.rotation.set(-0.28 + (reducedMotion ? 0.1 : p * 0.1), 0.45 + turn, 0.05);
      group.scale.setScalar(lerp(0.82, 1, completion));
    }

    // Close the facets: only rebuild the (60-vertex) buffers when the value moves
    if (Math.abs(completion - lastCompletion.current) > 0.0005) {
      lastCompletion.current = completion;
      const gap = (1 - completion) * MAX_GAP;
      const solid = facets.solid.attributes.position;
      const edges = facets.edges.attributes.position;
      for (let f = 0; f < FACE_COUNT; f += 1) {
        const nx = facets.normals[f * 3] * gap;
        const ny = facets.normals[f * 3 + 1] * gap;
        const nz = facets.normals[f * 3 + 2] * gap;
        for (let v = 0; v < 3; v += 1) {
          const i = f * 9 + v * 3;
          solid.array[i] = facets.rest[i] + nx;
          solid.array[i + 1] = facets.rest[i + 1] + ny;
          solid.array[i + 2] = facets.rest[i + 2] + nz;
        }
        // three edges per facet: v0-v1, v1-v2, v2-v0
        for (let e = 0; e < 3; e += 1) {
          const from = f * 9 + e * 3;
          const to = f * 9 + ((e + 1) % 3) * 3;
          const o = (f * 3 + e) * 6;
          edges.array[o] = solid.array[from];
          edges.array[o + 1] = solid.array[from + 1];
          edges.array[o + 2] = solid.array[from + 2];
          edges.array[o + 3] = solid.array[to];
          edges.array[o + 4] = solid.array[to + 1];
          edges.array[o + 5] = solid.array[to + 2];
        }
      }
      solid.needsUpdate = true;
      edges.needsUpdate = true;
    }

    // Reflection sweep: a band of warm light crosses the surface; each facet catches it as it passes
    const sweep = sweepRef?.current?.t ?? -1;
    if (sweep >= 0 && group) {
      sheenActive.current = true;
      group.updateMatrixWorld();
      const colors = facets.sheen.attributes.color;
      const travel = lerp(-1.9, 1.9, easeInOut(sweep));
      const strength = Math.pow(Math.sin(Math.PI * sweep), 1.2);
      for (let f = 0; f < FACE_COUNT; f += 1) {
        centre.set(facets.normals[f * 3], facets.normals[f * 3 + 1], facets.normals[f * 3 + 2]).multiplyScalar(RADIUS * 0.8);
        centre.applyMatrix4(group.matrixWorld);
        // the band runs on a slight diagonal, and only the side facing the viewer catches it
        const along = centre.x * 0.9 - centre.y * 0.45;
        const hit = Math.exp(-Math.pow((along - travel) / 0.6, 2)) * strength * (centre.z > -0.2 ? 1 : 0.25);
        for (let v = 0; v < 3; v += 1) {
          const i = f * 9 + v * 3;
          colors.array[i] = 1.1 * hit;
          colors.array[i + 1] = 1.1 * hit;
          colors.array[i + 2] = 1.1 * hit;
        }
      }
      colors.needsUpdate = true;
    } else if (sheenActive.current) {
      sheenActive.current = false;
      facets.sheen.attributes.color.array.fill(0);
      facets.sheen.attributes.color.needsUpdate = true;
    }

    const material = materialRef.current;
    if (material) {
      // lustrous black obsidian with high clearcoat shine and crisp facet reflections
      material.color.lerpColors(EARLY, FINAL, completion);
      material.metalness = lerp(0.72, 0.88, completion);
      material.roughness = lerp(0.15, 0.07, completion);
      material.clearcoat = 1;
      material.clearcoatRoughness = 0.05;
      material.envMapIntensity = 2.4;
    }
    if (edgeMaterialRef.current) edgeMaterialRef.current.opacity = lerp(0.65, 0.85, completion);

    const seam = seamRef.current;
    if (seam) {
      const warm = 0.15 + easeInOut(range(p, 0.36, 0.56)) * 0.45 + easeInOut(range(p, 0.56, 0.9)) * 0.4;
      seam.emissiveIntensity = lerp(0.1, 0.9, warm);
      seam.opacity = lerp(0.35, 1, warm);
    }
  });

  return (
    <group>
      {/* soft contact shadow, so the core sits on the page rather than floating on it */}
      <mesh geometry={shadowGeometry} material={shadow} position={[0.15, -0.25, -1.6]} scale={[4.6, 4.6, 1]} />

      <group ref={groupRef}>
        <mesh ref={solidRef} geometry={facets.solid}>
          <meshPhysicalMaterial
            ref={materialRef}
            color="#141518"
            metalness={0.82}
            roughness={0.09}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={0.98}
            envMapIntensity={2.4}
            flatShading
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* highlight layer for the reflection sweep (invisible until the sweep runs) */}
        <mesh geometry={facets.sheen} renderOrder={2}>
          <meshBasicMaterial
            vertexColors
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* pale crisp edges that sparkle along the facets */}
        <lineSegments ref={edgesRef} geometry={facets.edges}>
          <lineBasicMaterial ref={edgeMaterialRef} color="#d4dce8" transparent opacity={0.7} />
        </lineSegments>
        {/* the single polished gold/brass detail seam */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.012, 16, 96]} />
          <meshStandardMaterial
            ref={seamRef}
            color="#e5b838"
            emissive="#c9a227"
            emissiveIntensity={0.3}
            metalness={0.95}
            roughness={0.12}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>
    </group>
  );
}

export default CaseCore;
