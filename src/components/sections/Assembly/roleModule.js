import * as THREE from "three";

/**
 * THE ROLE MODULE. All four roles are the same designed object: a bevelled,
 * rounded-square block of one size, one thickness, one bevel, one material.
 * What tells the roles apart is only the small brass inlay on the front face,
 * so they read as one system with four specialised components.
 *
 * The geometry is built once and shared.
 */

const SIZE = 0.6; // face width / height
const RADIUS = 0.09; // corner radius
const DEPTH = 0.24; // thickness
const BEVEL = 0.045;

function roundedSquare(size, radius) {
  const h = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-h + radius, -h);
  shape.lineTo(h - radius, -h);
  shape.quadraticCurveTo(h, -h, h, -h + radius);
  shape.lineTo(h, h - radius);
  shape.quadraticCurveTo(h, h, h - radius, h);
  shape.lineTo(-h + radius, h);
  shape.quadraticCurveTo(-h, h, -h, h - radius);
  shape.lineTo(-h, -h + radius);
  shape.quadraticCurveTo(-h, -h, -h + radius, -h);
  return shape;
}

let shared = null;

/** Geometry shared by every role (created on first use) */
export function getRoleGeometry() {
  if (shared) return shared;

  const body = new THREE.ExtrudeGeometry(roundedSquare(SIZE, RADIUS), {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 6,
  });
  body.center();

  shared = {
    body,
    edges: new THREE.EdgesGeometry(body, 35),
    bar: new THREE.BoxGeometry(1, 1, 1),
    dot: new THREE.CircleGeometry(1, 20),
    ring: new THREE.RingGeometry(0.86, 1, 28),
    // full extents, for placing the inlay and the connector anchor
    halfWidth: SIZE / 2 + BEVEL,
    halfHeight: SIZE / 2 + BEVEL,
    halfDepth: DEPTH / 2 + BEVEL,
  };
  return shared;
}

export function disposeRoleGeometry() {
  if (!shared) return;
  shared.body.dispose();
  shared.edges.dispose();
  shared.bar.dispose();
  shared.dot.dispose();
  shared.ring.dispose();
  shared = null;
}

/**
 * The brass inlay that identifies each role. Positions are in the face's own
 * units; `bar` scale is [width, height]; `dot`/`ring` scale is the radius.
 */
export const INLAYS = {
  // a single point of inquiry inside a fine ring
  research: [
    { type: "dot", pos: [0, 0], scale: 0.05 },
    { type: "ring", pos: [0, 0], scale: 0.15 },
  ],
  // stacked records
  evidence: [
    { type: "bar", pos: [0, 0.13], scale: [0.34, 0.03] },
    { type: "bar", pos: [0, 0], scale: [0.34, 0.03] },
    { type: "bar", pos: [-0.08, -0.13], scale: [0.18, 0.03] },
  ],
  // a line of travel ending at a point
  strategy: [
    { type: "bar", pos: [-0.02, -0.02], scale: [0.36, 0.03], rot: 0.62 },
    { type: "dot", pos: [0.13, 0.11], scale: 0.045 },
  ],
  // a ruled line and a short mark
  drafting: [
    { type: "bar", pos: [0, 0.1], scale: [0.36, 0.03] },
    { type: "bar", pos: [-0.09, -0.06], scale: [0.18, 0.03] },
    { type: "dot", pos: [0.14, -0.06], scale: 0.035 },
  ],
};

/** Soft blob texture used as a cheap contact shadow behind the objects (shared) */
let shadowTexture = null;
export function getShadowTexture() {
  if (shadowTexture) return shadowTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.5)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0.16)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  shadowTexture = new THREE.CanvasTexture(canvas);
  return shadowTexture;
}
