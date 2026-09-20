import LegalExhibit from "./LegalExhibit";

/**
 * One claim and its objection as a pair of legal exhibits, meeting around the
 * test point. The middle cell is only the spot the WebGL test point stops at.
 */
function ArgumentPair({ pair, index }) {
  return (
    <li className="cf-pair" data-cf-pair data-state={pair.status} data-status={pair.status}>
      <LegalExhibit
        side="your"
        number={index + 1}
        category={pair.yourCategory}
        text={pair.yourSide}
        status={pair.yourStatus}
      />
      <div className="cf-mid" aria-hidden="true">
        <span className="cf-mid__slot" data-cf-slot />
      </div>
      <LegalExhibit
        side="other"
        number={index + 1}
        category={pair.otherCategory}
        text={pair.otherSide}
        status={pair.otherStatus}
      />
    </li>
  );
}

export default ArgumentPair;
