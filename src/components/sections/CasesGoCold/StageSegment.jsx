/**
 * The piece of the one continuous line that belongs to a stage: from that
 * stage's point to the next stage's point. Joined end to end, the segments
 * make a single line that starts clean and gradually loses its structure.
 *
 *   01–04  a clean, unbroken line
 *   05  the line breaks into controlled fragments (information scattered)
 *   06  (drawn by segment 05) the last fragments fall back, leaving a gap before an isolated point
 *
 * Everything is plain CSS driven by the stage's `--p` (and, for 05, the next
 * stage's `--pn`), so the page never re-renders while scrolling.
 */

// Fragments of segment 05, as [left, width] in % of the segment:
//   a = joined (a clean line), b = fragmented, c = after "nothing is built"
const FRAGMENTS = [
  { a: [0, 20], b: [0, 26], c: [0, 26] },
  { a: [20, 20], b: [32, 16], c: [32, 16] },
  { a: [40, 20], b: [54, 10], c: [54, 8] },
  { a: [60, 20], b: [70, 6], c: [67, 3] },
  { a: [80, 20], b: [88, 6], c: [70, 0] },
];

function StageSegment({ index }) {
  return (
    <div className="cold-seg" aria-hidden="true">
      <span className="cs-main" />
    </div>
  );
}

export default StageSegment;
