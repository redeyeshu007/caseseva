/**
 * ONE MASTER SCROLL PROGRESS (0 → 1) drives the text stages and every part of
 * the 3D scene. Nothing is played once and nothing is remembered: the scroll
 * position alone decides what is on screen, so scrolling up takes the whole
 * formation apart in reverse, and coming back replays it from the start.
 *
 *   0.00 – 0.20   RAW STORY     empty scene, an incomplete core
 *   0.20 – 0.38   RESEARCH      forms, then its connector reaches the core
 *   0.38 – 0.56   EVIDENCE      forms, connects (and the domain ring draws)
 *   0.56 – 0.72   STRATEGY      forms, connects
 *   0.72 – 0.86   DRAFTING      forms, connects
 *   0.86 – 1.00   COMPLETE      the core resolves; the finished system holds
 *
 * Entering the complete state (≥ COMPLETE_ENTER) plays the white reflection;
 * dropping back out of it (< COMPLETE_LEAVE) clears it and re-arms it.
 */

export const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 0 → 1 as `p` moves from `a` to `b` */
export const range = (p, a, b) => clamp01((p - a) / (b - a));

export const smooth = (t) => t * t * (3 - 2 * t);

export const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * The four text stages, each starting only when the scene is showing that state:
 *   RAW STORY        0.00  the case core alone
 *   FACTS            0.20  the first roles (research, evidence) form
 *   DOMAIN DETECTED  0.50  the ring closes and PROPERTY appears (RING.label starts at 0.52)
 *   TEAM FORMED      0.86  all four roles are formed and connected (drafting finishes at 0.86)
 */
export const STAGE_STARTS = [0, 0.2, 0.5, 0.86];

export function stageForProgress(p) {
  let stage = 0;
  for (let i = 0; i < STAGE_STARTS.length; i += 1) {
    if (p >= STAGE_STARTS[i]) stage = i;
  }
  return stage;
}

/** Progress at which the system counts as complete (with a little hysteresis) */
export const COMPLETE_ENTER = 0.97;
export const COMPLETE_LEAVE = 0.94;

/** The domain ring and the PROPERTY label */
export const RING = {
  draw: [0.36, 0.5],
  color: [0.4, 0.52],
  leader: [0.48, 0.56],
  label: [0.52, 0.58],
};

/**
 * THE ALIGNMENT SYSTEM. The case core is the origin. The four roles sit on the
 * axes of one coordinate system at the same distance, in the same plane (z = 0),
 * so they are balanced by construction and, being at the same depth, appear the
 * same size. Nothing about a role's position is set by hand.
 */
export const TEAM_RADIUS = 2.65;

const AXES = {
  research: [0, 1], // top
  evidence: [-1, 0], // left
  strategy: [1, 0], // right
  drafting: [0, -1], // bottom
};

const roleAt = (id, label) => ({
  id,
  label,
  axis: AXES[id],
  pos: [AXES[id][0] * TEAM_RADIUS, AXES[id][1] * TEAM_RADIUS, 0],
  // The label sits on the outside of the top node and beneath the others
  labelDy: id === "research" ? 0.54 : -0.54,
});

export const TEAM = [
  roleAt("research", "RESEARCH"),
  roleAt("evidence", "EVIDENCE"),
  roleAt("strategy", "STRATEGY"),
  roleAt("drafting", "DRAFTING"),
];

const WINDOWS = [
  [0.2, 0.38],
  [0.38, 0.56],
  [0.56, 0.72],
  [0.72, 0.86],
];

/**
 * Timing of team member `k`: it moves into place first, its connector is drawn
 * over the second half of its window, and its label arrives with the connector.
 */
export function teamTimes(k) {
  const [a, b] = WINDOWS[k];
  const len = b - a;
  return {
    move: [a, a + len * 0.65],
    line: [a + len * 0.5, b],
    label: [a + len * 0.7, b],
  };
}

/** The domain shown in the example (the copy keeps "Property") */
export const DOMAIN = "Property";
