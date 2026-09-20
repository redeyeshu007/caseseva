import { CROSSFIRE_DISCLAIMER } from "./crossfireData";

const pad = (n) => String(n).padStart(2, "0");

/** Refined status line — counts come from the data, never hard-coded. */
function CrossfireResult({ pairs }) {
  const answered = pairs.filter((p) => p.status === "tested").length;
  const unresolved = pairs.filter((p) => p.status === "unresolved").length;

  return (
    <div className="cf-result" data-cf-result>
      <p className="cf-result__counts">
        <span className="cf-result__stat cf-result__stat--answered">
          <span className="cf-result__num">{pad(answered)}</span>
          <span className="cf-result__word">Answered</span>
        </span>
        <span className="cf-result__stat cf-result__stat--unresolved">
          <span className="cf-result__num">{pad(unresolved)}</span>
          <span className="cf-result__word">Unresolved</span>
        </span>
      </p>
      <p className="cf-result__note">{CROSSFIRE_DISCLAIMER}</p>
    </div>
  );
}

export default CrossfireResult;
