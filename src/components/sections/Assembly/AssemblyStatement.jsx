import { useRef } from "react";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";

/**
 * The Assembly's left side: one statement in two lines.
 *
 *   A team is built for your case.      (muted, regular)
 *   Then dissolved.                     (dark, bold, with the accent word in brass)
 *
 * The text is static and editorial. It appears with the site's existing word reveal
 * (soft blur-to-sharp; the second line follows slightly later) and, with reduced
 * motion, is simply shown. When the 3D system reaches its completed state,
 * `resolved` lets the accent word settle from a softer to a full brass, which
 * ties the words to that moment. `resolved` is set on the wrapper, not on the
 * text, because the reveal rebuilds the text nodes.
 */
function AssemblyStatement({ primary, emphasis, accent, resolved = false }) {
  const primaryRef = useRef(null);
  const emphasisRef = useRef(null);

  useEditorialReveal(primaryRef, { start: "top 84%" });
  useEditorialReveal(emphasisRef, { start: "top 74%" });

  // "Then dissolved." → "Then " + accent "dissolved."
  const at = accent ? emphasis.indexOf(accent) : -1;
  const lead = at >= 0 ? emphasis.slice(0, at) : emphasis;
  const tail = at >= 0 ? emphasis.slice(at + accent.length) : "";

  return (
    <h2 className="assembly-statement" data-resolved={resolved || undefined}>
      <span ref={primaryRef} className="assembly-statement__primary">
        {primary}
      </span>
      <span ref={emphasisRef} className="assembly-statement__emphasis">
        {lead}
        {at >= 0 && <span className="assembly-statement__accent">{accent}</span>}
        {tail}
      </span>
    </h2>
  );
}

export default AssemblyStatement;
