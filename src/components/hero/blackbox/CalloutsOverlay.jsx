import { CALLOUTS } from "./calloutData";

/**
 * The 2D half of the callout system: an SVG for the leader lines and small
 * HTML labels. It renders once and is never re-rendered while scrolling;
 * CalloutDriver (inside the Canvas) moves every element each frame through
 * the refs collected in `registry`.
 */
function CalloutsOverlay({ registry }) {
  const reg = (key, name) => (el) => {
    if (!registry.current[key]) registry.current[key] = {};
    registry.current[key][name] = el;
  };

  return (
    <div className="callouts" aria-hidden="true">
      <svg className="callouts__svg">
        {CALLOUTS.map((callout) => (
          <g key={callout.key}>
            <path ref={reg(callout.key, "path")} className="callouts__line" pathLength="1" />
            <circle ref={reg(callout.key, "dotStart")} className="callouts__dot" r="1.8" />
            <circle ref={reg(callout.key, "dotEnd")} className="callouts__dot" r="2.5" />
          </g>
        ))}
      </svg>

      {CALLOUTS.map((callout) => (
        <div
          key={callout.key}
          ref={reg(callout.key, "pos")}
          className={`callout callout--${callout.side > 0 ? "right" : callout.side < 0 ? "left" : "center"}`}
        >
          <div ref={reg(callout.key, "box")} className="callout__box">
            <span className="callout__title">{callout.title}</span>
            <span className="callout__note">{callout.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CalloutsOverlay;
