import { useRef, useState } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./Seal.css";

const DOCUMENTS = [
  {
    id: "report",
    title: "The Case Intelligence Report",
    description: "Facts, timeline, evidence map and legal issues in one record.",
  },
  {
    id: "draft",
    title: "The Advocate-Style Draft",
    description: "A structured draft, ready for a verified advocate to review.",
  },
];

/**
 * Act X — The Seal. Two document artefacts that tilt gently with the
 * cursor, and a brass seal the visitor can stamp — a small, meaningful
 * interaction rather than decoration.
 */
function Seal() {
  const cardRefs = useRef({});
  const [sealed, setSealed] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleMove = (id) => (event) => {
    if (reducedMotion) return;
    const card = cardRefs.current[id];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${
      y * -8
    }deg)`;
  };

  const handleLeave = (id) => () => {
    const card = cardRefs.current[id];
    if (card) card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <section id="seal" className="seal section" data-bg="#ffffff">
      <div className="container">
        <p className="eyebrow">The record is ready to be reviewed</p>
        <h2 className="seal__headline">Two documents. One decision left to make.</h2>

        <div className="seal__documents">
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              ref={(el) => (cardRefs.current[doc.id] = el)}
              className="seal__card"
              onMouseMove={handleMove(doc.id)}
              onMouseLeave={handleLeave(doc.id)}
            >
              <span className="seal__card-label">{doc.title}</span>
              <p className="seal__card-description">{doc.description}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`seal__stamp-button ${sealed ? "seal__stamp-button--sealed" : ""}`}
          onClick={() => setSealed((prev) => !prev)}
          aria-pressed={sealed}
        >
          <span className="seal__stamp-ring" aria-hidden="true" />
          {sealed ? "Sealed" : "Seal for Advocate Review"}
        </button>

        <p className="seal__footer">
          AI-ASSISTED · ADVOCATE-REVIEWED DRAFT
          <br />
          NOT A JUDGMENT · NOT A GUARANTEE OF OUTCOME
        </p>
      </div>
    </section>
  );
}

export default Seal;
