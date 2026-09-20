import { useRef } from "react";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";
import "./Compass.css";

const LEVELS = ["DISTRICT", "STATE", "NATIONAL"];

const READOUTS = [
  { label: "FORUM LEVEL", value: "District Consumer Commission" },
  { label: "TERRITORIAL BASIS", value: "Place of purchase" },
  { label: "LIMITATION CLOCK", value: "Within statutory period" },
];

/**
 * Act VIII — The Compass. An abstract jurisdiction instrument, not a
 * geographic map: concentric rings standing for forum levels, with
 * the relevant reading called out beside them.
 */
function Compass() {
  const headlineRef = useRef(null);
  useEditorialReveal(headlineRef);

  return (
    <section id="compass" className="compass section" data-bg="#ffffff">
      <div className="container compass__grid">
        <div className="compass__copy">
          <p className="eyebrow on-light">Every case has a proper forum</p>
          <h2 ref={headlineRef} className="compass__headline on-light">
            The right forum, the right territory, the right clock — fixed
            before anything is filed.
          </h2>

          <dl className="compass__readouts">
            {READOUTS.map((item) => (
              <div key={item.label} className="compass__readout">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="compass__instrument" aria-hidden="true">
          {LEVELS.map((level, index) => (
            <div
              key={level}
              className="compass__ring"
              style={{ "--ring-index": index }}
            >
              <span className="compass__ring-label">{level}</span>
            </div>
          ))}
          <div className="compass__needle" />
        </div>
      </div>
    </section>
  );
}

export default Compass;
