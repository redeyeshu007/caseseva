export const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 0 → 1 as `p` moves from `a` to `b` */
export const range = (p, a, b) => clamp01((p - a) / (b - a));

export const smooth = (t) => t * t * (3 - 2 * t);

export const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Nested chambers, outermost first. `size` is the outer edge of the
 * finished cube, `bar` the frame thickness. The remaining values describe
 * the "opened" state the layer starts in and locks out of:
 *   open  – how far the front/back frames sit beyond the finished cube
 *   dz/rz – offset along the view axis and twist about it
 *   lock  – scroll progress at which the layer finishes locking
 *   spread – extra scale held until the final convergence
 */
export const LEVELS = [
  { size: 3.7, bar: 0.16, open: 1.5, dz: 1.0, rz: 0.09, lock: 0.5, spread: 0.08, plate: false, tone: "outer" },
  { size: 2.85, bar: 0.13, open: 1.35, dz: 0.5, rz: -0.15, lock: 0.6, spread: 0.06, plate: true, tone: "outer" },
  { size: 2.0, bar: 0.1, open: 1.25, dz: -0.25, rz: 0.22, lock: 0.7, spread: 0.04, plate: true, tone: "inner" },
  { size: 1.2, bar: 0.075, open: 1.1, dz: -0.7, rz: -0.3, lock: 0.8, spread: 0.02, plate: true, tone: "inner" },
];
