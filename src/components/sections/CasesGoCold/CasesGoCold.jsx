import { useRef } from "react";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";
import "./CasesGoCold.css";

const CHAIN = [
  "IT HAPPENS",
  "YOU SEARCH",
  "YOU ASK AROUND",
  "YOU RETELL IT AGAIN",
  "FILES SCATTER",
  "NOTHING IS BUILT",
];

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
      data-bg="#f7f6f3"
    >
      <div className="container">
        <h2 ref={headlineRef} className="cases-go-cold__headline">
          There is no shortage of legal information. There is a shortage of
          anyone who will turn your story into a case.
        </h2>

        <ol className="cases-go-cold__chain">
          {CHAIN.map((step, index) => (
            <li key={step} className="cases-go-cold__step">
              <span className="cases-go-cold__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="cases-go-cold__label">{step}</span>
              {index < CHAIN.length - 1 && (
                <span className="cases-go-cold__arrow" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default CasesGoCold;
