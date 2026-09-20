const SIDES = {
  your: { label: "Your side", noun: "Exhibit" },
  other: { label: "The other side", noun: "Objection" },
};

const pad = (n) => String(n).padStart(2, "0");

/**
 * One argument as a small physical legal exhibit: number, category, the full
 * statement, and a small status line. Left = Exhibit (brass detail), right =
 * Objection (oxblood detail). The paper, its thickness and its tilt are CSS;
 * the pair's scroll progress reaches it through custom properties set on the
 * parent <li> (see useCrossfireSequence).
 */
function LegalExhibit({ side, number, category, text, status }) {
  const { label, noun } = SIDES[side];

  return (
    <div className={`cf-exhibit cf-exhibit--${side}`} data-status={status.toLowerCase()}>
      <span className="cf-side__label">{label}</span>
      <span className="cf-exhibit__corner" aria-hidden="true" />
      <p className="cf-exhibit__number">
        {noun} {pad(number)}
      </p>
      <p className="cf-exhibit__category">{category}</p>
      <p className="cf-exhibit__text">
        <span className="sr-only">{label}: </span>
        {text}
      </p>
      <p className="cf-exhibit__status">
        <span className="cf-exhibit__mark" aria-hidden="true" />
        {status}
      </p>
    </div>
  );
}

export default LegalExhibit;
