import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useInView } from "../../../hooks/useInView";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { useEditorialReveal } from "../../../animations/useEditorialReveal";
import "./Assembly.css";

const AssemblyScene = lazy(() => import("./AssemblyScene"));
const DOMAINS = ["Consumer", "Labour", "Property", "Criminal", "Civil", "RTI"];
const STAGES = ["RAW STORY", "FACTS", "DOMAIN DETECTED", "TEAM FORMED"];

/**
 * Act IV — The Assembly. Dark section showing the AI legal team being
 * formed and dissolved. The 3D scene is lazy-loaded and only mounted
 * while the section is on screen, so it never runs — or ships in the
 * initial bundle — when the visitor hasn't scrolled to it.
 */
function Assembly() {
  const [wrapperRef, inView] = useInView({ threshold: 0.25 });
  const headlineRef = useRef(null);
  const [domainIndex, setDomainIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEditorialReveal(headlineRef);

  useEffect(() => {
    if (!inView) return undefined;

    const stageTimer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 1400);

    const domainTimer = setInterval(() => {
      setDomainIndex((prev) => (prev + 1) % DOMAINS.length);
    }, 2600);

    return () => {
      clearInterval(stageTimer);
      clearInterval(domainTimer);
    };
  }, [inView]);

  return (
    <section
      id="assembly"
      className="assembly section"
      data-bg="#000000"
      ref={wrapperRef}
    >
      <div className="container assembly__grid">
        <div className="assembly__copy">
          <p className="eyebrow on-dark">The team forms, then dissolves</p>
          <h2 ref={headlineRef} className="assembly__headline on-dark">
            A team is built for your case. Then dissolved.
          </h2>

          <ol className="assembly__stages" aria-label="Assembly stages">
            {STAGES.map((stage, index) => (
              <li
                key={stage}
                className={`assembly__stage ${
                  index === stageIndex ? "assembly__stage--active" : ""
                }`}
              >
                {stage}
              </li>
            ))}
          </ol>

          <p className="assembly__domain">
            Domain detected:{" "}
            <span className="assembly__domain-value">{DOMAINS[domainIndex]}</span>
          </p>
        </div>

        <div className="assembly__scene" aria-hidden="true">
          {inView && !reducedMotion && (
            <Suspense fallback={null}>
              <AssemblyScene activeDomain={DOMAINS[domainIndex]} />
            </Suspense>
          )}
          {reducedMotion && (
            <div className="assembly__scene-fallback">
              <span className="assembly__domain-value">
                {DOMAINS[domainIndex]}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Assembly;
