import ArgumentPair from "./ArgumentPair";

/**
 * The two-sided argument system: column labels and one row per argument pair.
 */
function CrossfireArena({ pairs, arenaRef }) {
  return (
    <div ref={arenaRef} className="cf-arena">
      {/* where the desk, Constitution and case files sit — top and centre, behind the text (drawn by the scene) */}
      <div className="cf-stage" data-cf-stage aria-hidden="true" />

      <div className="cf-labels" aria-hidden="true">
        <span className="cf-label cf-label--your">Your side</span>
        <span className="cf-labels__home" data-cf-home />
        <span className="cf-label cf-label--other">The other side</span>
      </div>

      <ol className="cf-pairs" aria-label="Claims and the objections they are tested against">
        {pairs.map((pair, index) => (
          <ArgumentPair key={index} pair={pair} index={index} />
        ))}
      </ol>
    </div>
  );
}

export default CrossfireArena;
