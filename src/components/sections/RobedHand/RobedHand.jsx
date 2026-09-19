import { useRef } from "react";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";
import "./RobedHand.css";

const ACTIONS = [
  "Strike a ground",
  "Correct the record",
  "Demand a document",
  "Re-open the analysis",
];

/**
 * Act IX — The Robed Hand. A warmer, more human beat: an abstract
 * brass pen approaching a document, standing in for the advocate's
 * final decision — no faces, no stock photography.
 */
function RobedHand() {
  const headlineRef = useRef(null);
  useEditorialReveal(headlineRef);

  return (
    <section id="robed-hand" className="robed-hand section" data-bg="#f3efe6">
      <div className="container robed-hand__grid">
        <div className="robed-hand__copy">
          <p className="eyebrow">The human word, last</p>
          <h2 ref={headlineRef} className="robed-hand__headline">
            AI prepares. An advocate decides.
          </h2>

          <ol className="robed-hand__actions">
            {ACTIONS.map((action, index) => (
              <li key={action} className="robed-hand__action">
                <span className="robed-hand__action-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </div>

        <div className="robed-hand__visual" aria-hidden="true">
          <svg viewBox="0 0 260 260" className="robed-hand__svg">
            <rect
              x="60"
              y="70"
              width="130"
              height="160"
              rx="2"
              className="robed-hand__document"
            />
            <line x1="80" y1="100" x2="170" y2="100" className="robed-hand__line" />
            <line x1="80" y1="122" x2="170" y2="122" className="robed-hand__line" />
            <line x1="80" y1="144" x2="150" y2="144" className="robed-hand__line" />
            <g className="robed-hand__pen">
              <line x1="200" y1="40" x2="140" y2="150" className="robed-hand__pen-body" />
              <path d="M140 150 L134 168 L152 158 Z" className="robed-hand__pen-nib" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default RobedHand;
