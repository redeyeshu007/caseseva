/**
 * Pure timeline maths for the Crossfire sequence. Every value here is a
 * function of scroll progress only — nothing plays once and nothing latches —
 * so scrolling back up walks the whole sequence in reverse.
 */

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const smooth = (t) => t * t * (3 - 2 * t);
/** 0→1 as `p` moves from `a` to `b` (clamped). */
export const seg = (p, a, b) => clamp01((p - a) / (b - a));

/** How much of the unresolved objection's rule stays open (a visible gap at rest). */
export const UNRESOLVED_GAP = 0.17;

/**
 * Master progress (0–1) of the pinned sequence. Intro, then three pair
 * windows of equal length, then the result line.
 */
export const MASTER = {
  intro: [0, 0.18],
  pairsStart: 0.18,
  pairLength: 0.21,
  result: [0.83, 0.97],
};

/** Local (0–1) progress of every pair for a given master progress. */
export function masterToLocal(progress, pairCount) {
  return {
    intro: seg(progress, MASTER.intro[0], MASTER.intro[1]),
    pairs: Array.from({ length: pairCount }, (_, i) => {
      const start = MASTER.pairsStart + i * MASTER.pairLength;
      return seg(progress, start, start + MASTER.pairLength);
    }),
    result: seg(progress, MASTER.result[0], MASTER.result[1]),
  };
}

/** Where, inside one pair's 0–1 window, each beat happens. */
export const DEFAULT_TEMPO = {
  claimIn: [0, 0.16],
  claimTravel: [0.06, 0.58],
  objIn: [0.2, 0.38],
  objTravel: [0.3, 0.6],
  meet: [0.58, 0.82],
  settle: [0.74, 0.94],
};

/**
 * Everything one pair needs at local progress `p`.
 * state: idle → active → testing → (tested | unresolved)
 */
export function pairPhases(p, tempoOverride, status) {
  const t = { ...DEFAULT_TEMPO, ...tempoOverride };

  const claimTravel = smooth(seg(p, t.claimTravel[0], t.claimTravel[1]));
  const objTravel = smooth(seg(p, t.objTravel[0], t.objTravel[1]));
  const settle = smooth(seg(p, t.settle[0], t.settle[1]));
  const meetSpan = seg(p, t.meet[0], t.meet[1]);

  // The carrier is only visible while it is travelling.
  const dot = (travel) => smooth(seg(travel, 0, 0.1)) * (1 - smooth(seg(travel, 0.9, 1)));

  let state;
  if (p <= 0.001) state = "idle";
  else if (p < t.meet[0] - 0.02) state = "active";
  else if (p < t.settle[0]) state = "testing";
  else state = status;

  return {
    state,
    claimIn: smooth(seg(p, t.claimIn[0], t.claimIn[1])),
    claimFill: claimTravel,
    claimDot: dot(claimTravel),
    objIn: smooth(seg(p, t.objIn[0], t.objIn[1])),
    objFill: objTravel * (status === "unresolved" ? 1 - UNRESOLVED_GAP * settle : 1),
    objTravel,
    objDot: dot(objTravel),
    meet: Math.sin(Math.PI * meetSpan), // 0 → 1 → 0 across the collision
    lock: smooth(meetSpan), // 0 → 1 across the collision, stays 1 afterwards
    settle,
  };
}

/**
 * Position of the test point along the centre line, as a fractional row index:
 * -1 = home (above the first row), 0…n-1 = the row of that pair. It descends to
 * each pair as that pair begins and returns home after the last one.
 */
export function instrumentPosition(sum, count) {
  if (sum <= 0) return -1;
  const index = Math.min(count - 1, Math.floor(sum));
  const f = sum >= count ? 1 : sum - index;
  const from = index - 1;
  let pos = from + (index - from) * smooth(seg(f, 0, 0.14));
  if (index === count - 1) pos += (-1 - pos) * smooth(seg(f, 0.86, 1));
  return pos;
}
