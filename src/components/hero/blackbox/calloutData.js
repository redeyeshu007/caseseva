/**
 * Callouts for the Black Box. Each one is tied to a real point on the cube
 * (see ANCHORS) and appears when the existing scroll progress reaches `from`.
 *
 * `from` follows what the existing animation does:
 *   0.00  raw story: layers apart, dim core, brass hairline
 *   0.18  brass pulse travelling through the inner structure
 *   0.40  chambers locking into place
 *   0.60  inner chambers locking
 *   0.80  everything converging on the core
 *
 * `side` is which side of the visual the label sits on (-1 left, 1 right) and
 * `row` the height of its leader line as a fraction of the visual's height.
 * Left labels take the upper/lower-left, right labels the right side, and rows
 * are spread so no two neighbouring stages can collide.
 */
export const CALLOUTS = [
  { key: "story", title: "Your story", note: "In your words", side: -1, row: 0.09, from: 0 },
  { key: "facts", title: "Key facts", note: "What matters", side: 1, row: 0.27, from: 0.18 },
  { key: "analyzed", title: "Analyzed", note: "Evidence + law", side: 1, row: 0.86, from: 0.4 },
  { key: "strategy", title: "Strategy", note: "The legal path", side: -1, row: 0.88, from: 0.6 },
  { key: "ready", title: "Case ready", note: "Built to move forward", side: 1, row: 0.6, from: 0.8 },
];

/**
 * Where each callout attaches on the existing geometry. `level` indexes LEVELS,
 * `where` is the front or back frame of that chamber, and `corner` is a
 * direction in units of the frame's half-edge ([1, 0] = middle of the right
 * bar, [-1, -1] = bottom-left corner, ...). The anchor is a child of that
 * frame, so it moves, twists and scales with it. "ready" sits on the core.
 */
export const ANCHORS = {
  story: { level: 0, where: "front", corner: [-1, 1] },
  facts: { level: 1, where: "front", corner: [1, 0] },
  analyzed: { level: 1, where: "back", corner: [1, -1] },
  strategy: { level: 3, where: "front", corner: [-1, -1] },
};

export function activeCallout(progress) {
  let index = 0;
  for (let i = 0; i < CALLOUTS.length; i += 1) {
    if (progress >= CALLOUTS[i].from) index = i;
  }
  return index;
}
