import { useRef } from "react";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";
import ColdCaseSequence from "./ColdCaseSequence";
import "./CasesGoCold.css";

/**
 * Act II — Where Cases Go Cold. States the problem before the
 * product is explained. Deliberately slow and unadorned.
 */
function CasesGoCold() {
  const headlineRef = useRef(null);
  useEditorialReveal(headlineRef);

  return (
    <section
      id="cases-go-cold"
      className="cases-go-cold section"
      data-bg="#ffffff"
    >
      <div className="container">
        <h2 ref={headlineRef} className="cases-go-cold__headline">
          There is no shortage of legal information. There is a shortage of
          anyone who will turn your story into a case.
        </h2>

        <ColdCaseSequence />
      </div>
    </section>
  );
}

export default CasesGoCold;
