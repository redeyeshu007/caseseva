import AssemblyStatement from "./AssemblyStatement";

/**
 * The Assembly's left side: the editorial statement, then a compact "case build"
 * state rail that mirrors the 3D scene.
 *
 * It is purely presentational. The parent turns the section's one scroll
 * progress (the same value that drives the 3D scene) into `stage`, so the text
 * and the scene change at the same moment and this component has no scroll
 * logic of its own.
 *
 *   stage 0  RAW STORY        the case core alone
 *   stage 1  FACTS            the first roles form
 *   stage 2  DOMAIN DETECTED  the ring closes and PROPERTY appears
 *   stage 3  TEAM FORMED      all four roles are formed and connected
 *
 * Only the active stage is emphasised (filled brass point, brass number, dark
 * label); the rest stay muted.
 */
export const assemblyStages = [
  { number: "01", label: "RAW STORY" },
  { number: "02", label: "FACTS" },
  { number: "03", label: "DOMAIN DETECTED" },
  { number: "04", label: "TEAM FORMED" },
];

function AssemblyStage({ number, label, active }) {
  return (
    <li className={`assembly-stage${active ? " assembly-stage--active" : ""}`} aria-current={active ? "step" : undefined}>
      <span className="assembly-stage__dot" aria-hidden="true" />
      <span className="assembly-stage__number">{number}</span>
      <span className="assembly-stage__label">{label}</span>
    </li>
  );
}

function AssemblyLeftContent({ statement, stage = 0, resolved = false }) {
  const total = assemblyStages.length;
  const current = Math.min(Math.max(stage, 0), total - 1);

  return (
    <div className="assembly-left">
      <AssemblyStatement {...statement} resolved={resolved} />

      <div className="assembly-state" role="group" aria-label="Case build progress">
        <div className="assembly-state__head">
          <span className="assembly-state__title">CASE BUILD</span>
        </div>

        <ol className="assembly-state__rail">
          {assemblyStages.map((item, index) => (
            <AssemblyStage key={item.number} {...item} active={index === current} />
          ))}
        </ol>
      </div>
    </div>
  );
}

export default AssemblyLeftContent;
