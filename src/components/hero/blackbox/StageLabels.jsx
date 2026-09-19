/**
 * Storytelling layer for the Black Box. It only reads the scroll progress
 * that already drives the 3D transformation and shows which stage of the
 * story the visitor is looking at.
 *
 * `from` values follow what the existing animation actually does:
 *   0.00  raw story, layers apart, dim core, brass hairline
 *   0.14  brass pulse starts moving through the structure
 *   0.32  core is warming as the structure is read
 *   0.50  outer chambers begin locking into place
 *   0.68  inner chambers lock
 *   0.84  everything converges on the core
 */
export const STAGES = [
  { title: "Your story", note: "In your words", from: 0 },
  { title: "Understood", note: "We make sense of it", from: 0.14 },
  { title: "Key facts", note: "Important details identified", from: 0.32 },
  { title: "Analyzed", note: "Evidence and law examined", from: 0.5 },
  { title: "Strategy", note: "A clearer legal path", from: 0.68 },
  { title: "Case ready", note: "Structured for action", from: 0.84 },
];

export function stageFromProgress(p) {
  let index = 0;
  for (let i = 0; i < STAGES.length; i += 1) {
    if (p >= STAGES[i].from) index = i;
  }
  return index;
}

/**
 * Exactly one stage is active. The stages share a single grid cell so the
 * outgoing one fades out while the incoming one fades in (a crossfade, no
 * movement of the block itself). The small rail beside them marks progress.
 */
function StageLabels({ active }) {
  return (
    <div className="blackbox-stage" aria-hidden="true">
      <div className="blackbox-stage__text">
        {STAGES.map((stage, index) => (
          <div
            key={stage.title}
            className={`blackbox-stage__item${index === active ? " is-active" : ""}`}
          >
            <span className="blackbox-stage__title">{stage.title}</span>
            <span className="blackbox-stage__note">{stage.note}</span>
          </div>
        ))}
      </div>

      <ol className="blackbox-stage__rail">
        {STAGES.map((stage, index) => (
          <li
            key={stage.title}
            className={`blackbox-stage__dot${
              index === active ? " is-active" : index < active ? " is-done" : ""
            }`}
          />
        ))}
      </ol>
    </div>
  );
}

export default StageLabels;
