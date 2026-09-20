import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { makeStageAssets } from "./proceduralTextures";

const FOV = 24;
const BRASS = new THREE.Color("#c9a227");
const OXBLOOD = new THREE.Color("#7a2e2e");
const RADIUS_PX = 11; // test point size in CSS pixels
const TARGET = new THREE.Vector3(0, 0.03, 0);

/* ── Materials, built once per mount and shared by every mesh ───────────── */

function useMaterials(assets) {
  return useMemo(() => {
    const std = (o) => new THREE.MeshStandardMaterial(o);
    const leatherBase = { color: "#ffffff", roughness: 0.72, metalness: 0, bumpScale: 1.4 };
    const paper = std({ color: "#f1eee6", roughness: 0.92 });
    const gold = std({ color: GOLD_HEX, metalness: 1, roughness: 0.34 });
    const pageEdge = std({ color: "#ffffff", map: assets.pageEdge, roughness: 0.88 });

    const materials = {
      leather: std({ ...leatherBase, map: assets.leatherMap, bumpMap: assets.leatherBump }),
      // the top board carries the gold-foil emboss: G = roughness, B = metalness
      cover: std({
        color: "#ffffff",
        map: assets.coverMap,
        roughnessMap: assets.coverOrm,
        metalnessMap: assets.coverOrm,
        roughness: 1,
        metalness: 1,
        bumpMap: assets.coverBump,
        bumpScale: 1.6,
      }),
      pageEdge,
      pageEnd: std({ color: "#e9e0cb", roughness: 0.9 }),
      gold,
      paper,
      paperBrass: std({ color: "#ffffff", map: assets.paperBrass, roughness: 0.9, side: THREE.DoubleSide }),
      paperOx: std({ color: "#ffffff", map: assets.paperOx, roughness: 0.9, side: THREE.DoubleSide }),
      folderClaim: std({ color: "#e4d9bf", roughness: 0.85 }),
      folderObjection: std({ color: "#d8d4cd", roughness: 0.85 }),
      oxblood: std({ color: "#6f2c2c", roughness: 0.62 }),
      desk: new THREE.MeshStandardMaterial({
        map: assets.wood,
        alphaMap: assets.fade,
        transparent: true,
        opacity: 0.4,
        roughness: 0.7,
        depthWrite: false,
      }),
      shadow: new THREE.ShadowMaterial({ opacity: 0.26 }),
    };
    return materials;
  }, [assets]);
}

const GOLD_HEX = "#b8953a";

/* ── Book: The Constitution of India ────────────────────────────────────── */

const BOOK = { w: 0.24, d: 0.34, t: 0.066, board: 0.0035 };

function Constitution({ m }) {
  const { w, d, t, board } = BOOK;
  const total = t + board * 2;
  const r = total / 2;
  const pagesW = w - 0.011;
  // +x, -x, +y, -y, +z, -z — page lines on the three visible edges
  const pageMaterials = [m.pageEdge, m.pageEnd, m.pageEnd, m.pageEnd, m.pageEdge, m.pageEdge];
  const leatherTop = [m.leather, m.leather, m.cover, m.leather, m.leather, m.leather];

  return (
    <group>
      {/* back board */}
      <mesh position={[0, board / 2, 0]} material={m.leather} castShadow receiveShadow>
        <boxGeometry args={[w, board, d]} />
      </mesh>
      {/* page block, inset from the boards on three sides */}
      <mesh position={[0.001, board + t / 2, 0]} material={pageMaterials} castShadow receiveShadow>
        <boxGeometry args={[pagesW, t, d - 0.014]} />
      </mesh>
      {/* front board with the embossed cover */}
      <mesh position={[0, board + t + board / 2, 0]} material={leatherTop} castShadow receiveShadow>
        <boxGeometry args={[w, board, d]} />
      </mesh>
      {/* rounded spine, with two gold bands */}
      <group position={[-w / 2, r, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={m.leather} castShadow receiveShadow>
          <cylinderGeometry args={[r, r, d, 24, 1, false, Math.PI, Math.PI]} />
        </mesh>
        {[-0.07, 0.07].map((z) => (
          <mesh key={z} position={[0, z, 0]} material={m.gold}>
            <cylinderGeometry args={[r + 0.0005, r + 0.0005, 0.0045, 24, 1, true, Math.PI, Math.PI]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Case file: folder + papers + one bowed top sheet ───────────────────── */

const PAPER = { w: 0.21, d: 0.297 };

function useBowedSheet(seed) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(PAPER.w, PAPER.d, 8, 12);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i) / (PAPER.w / 2);
      const z = p.getZ(i) / (PAPER.d / 2);
      const corner = Math.max(0, x * seed + z - 1.05);
      p.setY(i, 0.0028 * (1 - x * x) + 0.02 * corner * corner);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
}

function CaseFile({ side, m, groupRef }) {
  const claim = side === "claim";
  const bowed = useBowedSheet(claim ? 1 : -1);
  const folder = claim ? m.folderClaim : m.folderObjection;
  const accent = claim ? m.gold : m.oxblood;
  // a few loose sheets, each a hair off-square so the stack reads as paper, not a block
  const sheets = useMemo(
    () => [0, 1, 2, 3].map((i) => ({ y: 0.0034 + i * 0.0013, yaw: (((i * 37) % 7) - 3) * 0.0075, dx: (((i * 13) % 5) - 2) * 0.0012 })),
    []
  );

  return (
    <group ref={groupRef}>
      {/* folder board and tab */}
      <mesh position={[0, 0.0015, 0]} material={folder} castShadow receiveShadow>
        <boxGeometry args={[0.226, 0.003, 0.31]} />
      </mesh>
      <mesh position={[claim ? -0.05 : 0.05, 0.0015, -0.162]} material={accent} castShadow receiveShadow>
        <boxGeometry args={[0.07, 0.003, 0.02]} />
      </mesh>
      {sheets.map((s, i) => (
        <mesh key={i} position={[s.dx, s.y, 0.002]} rotation={[0, s.yaw, 0]} material={m.paper} castShadow receiveShadow>
          <boxGeometry args={[PAPER.w, 0.0012, PAPER.d]} />
        </mesh>
      ))}
      <mesh
        position={[0, 0.0034 + sheets.length * 0.0013, 0.002]}
        rotation={[0, claim ? 0.012 : -0.014, 0]}
        geometry={bowed}
        material={claim ? m.paperBrass : m.paperOx}
        castShadow
        receiveShadow
      />
      {claim ? (
        // brass clip on the inner edge
        <mesh position={[-0.098, 0.0105, 0.09]} material={m.gold} castShadow>
          <boxGeometry args={[0.006, 0.0085, 0.05]} />
        </mesh>
      ) : (
        // oxblood binding down the outer edge
        <mesh position={[0.116, 0.003, 0]} material={m.oxblood} castShadow receiveShadow>
          <boxGeometry args={[0.012, 0.0062, 0.31]} />
        </mesh>
      )}
    </group>
  );
}

/* ── Test point: black plumb-bob, brass edges, on the centre line at the active row ── */

function pointAt(layout, pos) {
  const stops = [layout.home, ...layout.slots];
  const u = Math.min(stops.length - 1, Math.max(0, pos + 1));
  const i = Math.min(stops.length - 2, Math.floor(u));
  const f = u - i;
  const a = stops[i];
  const b = stops[i + 1] ?? a;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

function TestPoint({ stateRef, layoutRef, frameRef }) {
  const group = useRef();
  const body = useRef();
  const edges = useRef();
  const edgeGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1, 0)), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const ray = useMemo(() => ({ v: new THREE.Vector3(), dir: new THREE.Vector3(), fwd: new THREE.Vector3() }), []);

  useFrame(({ camera, size }) => {
    const s = stateRef.current;
    const layout = layoutRef.current;
    if (!layout || !group.current) return;

    const visible = !s.reduced && s.appear > 0.001;
    group.current.visible = visible;
    if (!visible) return;

    // px on the page -> a plane facing the camera, just in front of the book so it is never hidden by it
    const { x, y } = pointAt(layout, s.pos);
    const dPlane = frameRef.current.d - 0.3;
    camera.getWorldDirection(ray.fwd);
    ray.v.set((x / size.width) * 2 - 1, -((y / size.height) * 2 - 1), 0.5).unproject(camera);
    ray.dir.copy(ray.v).sub(camera.position).normalize();
    group.current.position.copy(camera.position).addScaledVector(ray.dir, dPlane / ray.dir.dot(ray.fwd));

    const pxToM = dPlane / (layout.stage.scale * frameRef.current.d);
    const scale = RADIUS_PX * pxToM * s.appear * (1 + 0.2 * s.meet);
    group.current.scale.set(scale * 0.78, scale * 1.3, scale * 0.78);
    group.current.rotation.set(0.5, 0.6 + s.turns * (Math.PI / 2), 0);

    // brass by default, oxblood while resting on the unresolved pair; a small lift in light on contact
    tint.copy(BRASS).lerp(OXBLOOD, s.tone);
    edges.current.material.color.copy(tint);
    body.current.material.emissive.copy(tint);
    body.current.material.emissiveIntensity = 0.5 * s.meet;
  });

  return (
    <group ref={group}>
      <mesh ref={body}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial color="#0b0b0b" metalness={0.6} roughness={0.3} clearcoat={0.5} clearcoatRoughness={0.25} />
      </mesh>
      <lineSegments ref={edges} geometry={edgeGeometry}>
        <lineBasicMaterial color="#c9a227" />
      </lineSegments>
    </group>
  );
}

/* ── Camera: frames the desk inside the stage element, observes with a slow orbit ── */

function Rig({ stateRef, layoutRef, frameRef }) {
  useFrame(({ camera, size }) => {
    const layout = layoutRef.current;
    if (!layout) return;
    const s = stateRef.current;
    const { stage } = layout;
    const W = size.width;
    const H = size.height;

    const d = H / (2 * stage.scale * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    frameRef.current.d = d;

    const az = s.reduced ? 0 : (s.sumNorm - 0.5) * 0.14; // a few degrees of slow orbit over the sequence
    const el = 0.5;
    camera.position.set(
      Math.sin(az) * Math.cos(el) * d,
      TARGET.y + Math.sin(el) * d,
      Math.cos(az) * Math.cos(el) * d
    );
    camera.lookAt(TARGET);
    camera.aspect = W / H;
    // slide the picture so the desk sits at the centre of the stage element
    camera.setViewOffset(W, H, -(stage.x - W / 2), -(stage.y - H / 2), W, H);
    camera.updateMatrixWorld();
  });
  return null;
}

/* ── Stage: desk, book, the two case files ──────────────────────────────── */

const lerp = (a, b, t) => a + (b - a) * t;

function Stage({ stateRef, m }) {
  const claim = useRef();
  const objection = useRef();

  useFrame(() => {
    const s = stateRef.current;
    const lift = 0.006 * s.meet;
    if (claim.current) {
      claim.current.position.set(-lerp(0.62, 0.29, s.claimAdv), lift, 0.02);
      claim.current.rotation.y = lerp(0.2, 0.025, s.claimAdv);
    }
    if (objection.current) {
      objection.current.position.set(lerp(0.62, 0.29, s.objAdv), lift, 0.02);
      // answered files square up; the unresolved one is left slightly off
      objection.current.rotation.y = -lerp(0.24, 0.045, s.objAdv) - 0.055 * s.unresolved;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0008, 0]} material={m.desk} receiveShadow>
        <planeGeometry args={[1.7, 0.8]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0004, 0]} material={m.shadow} receiveShadow>
        <planeGeometry args={[1.7, 0.8]} />
      </mesh>
      <Constitution m={m} />
      <CaseFile side="claim" m={m} groupRef={claim} />
      <CaseFile side="objection" m={m} groupRef={objection} />
    </group>
  );
}

/* Soft warm window light from the left, neutral fill, a restrained brass kick from behind */
function Lighting({ stateRef }) {
  const key = useRef();
  useFrame(() => {
    if (key.current) key.current.intensity = 2.5 + 0.25 * stateRef.current.meet;
  });
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    scene.environmentIntensity = 0.85;
  }, [scene]);

  return (
    <>
      <hemisphereLight args={["#fff8ec", "#cfc6b6", 0.55]} />
      <directionalLight
        ref={key}
        position={[-0.9, 1.7, 1]}
        color="#fff0d9"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-0.85}
        shadow-camera-right={0.85}
        shadow-camera-top={0.7}
        shadow-camera-bottom={-0.7}
        shadow-camera-near={0.5}
        shadow-camera-far={4}
        shadow-bias={-0.0005}
        shadow-normalBias={0.002}
      />
      <pointLight position={[0.9, 0.5, -0.8]} color="#ffdca0" intensity={0.5} distance={3} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.6} color="#fff0d8" position={[-4, 3, 2]} scale={[5, 4, 1]} rotation-y={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={1} color="#eef2f6" position={[4, 2, 3]} scale={[4, 3, 1]} rotation-y={-Math.PI / 2.6} />
        <Lightformer form="rect" intensity={1.2} position={[0, 5, 0]} scale={[6, 6, 1]} rotation-x={Math.PI / 2} />
      </Environment>
    </>
  );
}

function Content({ stateRef, layoutRef }) {
  const assets = useMemo(() => makeStageAssets(), []);
  useEffect(() => () => assets.dispose(), [assets]);
  const m = useMaterials(assets);
  const frameRef = useRef({ d: 2 });

  return (
    <>
      <Rig stateRef={stateRef} layoutRef={layoutRef} frameRef={frameRef} />
      <Lighting stateRef={stateRef} />
      <Stage stateRef={stateRef} m={m} />
      <TestPoint stateRef={stateRef} layoutRef={layoutRef} frameRef={frameRef} />
    </>
  );
}

/**
 * The foreground: desk, Constitution and the claim and objection files in one transparent perspective canvas over the section. Everything is
 * posed from the shared `stateRef` written by the scroll sequence, and rendered
 * on demand — no idle loop.
 */
function CrossfireScene({ stateRef, layoutRef }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop="demand"
      camera={{ fov: FOV, near: 0.3, far: 60, position: [0, 1, 2] }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", toneMapping: THREE.NeutralToneMapping }}
      onCreated={({ gl, invalidate }) => {
        gl.setClearColor(0x000000, 0);
        stateRef.current.invalidate = invalidate;
        invalidate();
      }}
    >
      <Content stateRef={stateRef} layoutRef={layoutRef} />
    </Canvas>
  );
}

export default CrossfireScene;
