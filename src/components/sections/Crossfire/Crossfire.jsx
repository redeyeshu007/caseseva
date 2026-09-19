import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./Crossfire.css";

const OBJECTIONS = [
  {
    yourSide: "The goods failed within four days of delivery.",
    otherSide: "The buyer may have caused the fault.",
    resolved: true,
  },
  {
    yourSide: "The invoice and payment proof match the claim exactly.",
    otherSide: "The policy may permit repair before replacement.",
    resolved: true,
  },
  {
    yourSide: "The defect was reported to support in writing.",
    otherSide: "No independent inspection has confirmed the defect.",
    resolved: false,
  },
];

/**
 * Act VI — Crossfire. Objections resolve one at a time as the
 * visitor scrolls, because the case is actively being tested — the
 * seam shifts toward "your side" for each one answered and stays
 * highlighted in oxblood for the one still open.
 */
function Crossfire() {
  const sectionRef = useRef(null);
  const [resolvedCount, setResolvedCount] = useState(0);
  const reducedMotion = useReducedMotion();
  const resolvableTotal = OBJECTIONS.filter((o) => o.resolved).length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    registerGsap();

    if (reducedMotion) {
      setResolvedCount(resolvableTotal);
      return undefined;
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      end: "bottom 60%",
      onUpdate: (self) => {
        const step = Math.min(
          resolvableTotal,
          Math.ceil(self.progress * resolvableTotal)
        );
        setResolvedCount(step);
      },
    });

    return () => trigger.kill();
  }, [reducedMotion, resolvableTotal]);

  const seamShift = (resolvedCount / Math.max(resolvableTotal, 1)) * 10;

  return (
    <section id="crossfire" className="crossfire section" data-bg="#141a2e" ref={sectionRef}>
      <div className="container">
        <p className="eyebrow on-dark">The case is tested before anyone else sees it</p>
        <h2 className="crossfire__headline on-dark">
          Every argument meets its objection before it leaves the building.
        </h2>

        <div
          className="crossfire__board"
          style={{ "--seam-shift": `${seamShift}%` }}
        >
          <div className="crossfire__seam" aria-hidden="true" />

          <div className="crossfire__column crossfire__column--yours">
            <span className="crossfire__side-label">Your side</span>
            {OBJECTIONS.map((item, index) => {
              const isResolved = item.resolved && index < resolvedCount;
              return (
                <p
                  key={`yours-${index}`}
                  className={`crossfire__statement ${
                    isResolved ? "crossfire__statement--settled" : ""
                  }`}
                >
                  {item.yourSide}
                </p>
              );
            })}
          </div>

          <div className="crossfire__column crossfire__column--other">
            <span className="crossfire__side-label">The other side</span>
            {OBJECTIONS.map((item, index) => {
              const isResolved = item.resolved && index < resolvedCount;
              return (
                <p
                  key={`other-${index}`}
                  className={`crossfire__statement ${
                    isResolved
                      ? "crossfire__statement--settled"
                      : "crossfire__statement--open"
                  }`}
                >
                  {item.otherSide}
                </p>
              );
            })}
          </div>
        </div>

        <p className="crossfire__evaluator">
          {resolvedCount} objection{resolvedCount === 1 ? "" : "s"} answered. 1
          unresolved. No outcome is predicted.
        </p>
      </div>
    </section>
  );
}

export default Crossfire;
