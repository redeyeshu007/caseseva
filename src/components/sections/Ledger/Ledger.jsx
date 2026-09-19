import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./Ledger.css";

const ISSUES = ["I001", "I002", "I003", "I004", "I005"];
const EVIDENCE = ["E001", "E002", "E003", "E005", "E006"];

// Maps each issue to an evidence index; I004 intentionally has no
// completed match — it needs a document instead.
const LINKS = [
  { issue: 0, evidence: 0, complete: true },
  { issue: 1, evidence: 2, complete: true },
  { issue: 2, evidence: 1, complete: true },
  { issue: 4, evidence: 3, complete: true },
];

function Ledger() {
  const containerRef = useRef(null);
  const issueRefs = useRef([]);
  const evidenceRefs = useRef([]);
  const [paths, setPaths] = useState([]);
  const svgRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const computePaths = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerBox = container.getBoundingClientRect();

      const next = LINKS.map((link) => {
        const from = issueRefs.current[link.issue];
        const to = evidenceRefs.current[link.evidence];
        if (!from || !to) return null;

        const fromBox = from.getBoundingClientRect();
        const toBox = to.getBoundingClientRect();

        const x1 = fromBox.right - containerBox.left;
        const y1 = fromBox.top + fromBox.height / 2 - containerBox.top;
        const x2 = toBox.left - containerBox.left;
        const y2 = toBox.top + toBox.height / 2 - containerBox.top;
        const midX = (x1 + x2) / 2;

        return { d: `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}` };
      }).filter(Boolean);

      setPaths(next);
    };

    computePaths();
    window.addEventListener("resize", computePaths);
    return () => window.removeEventListener("resize", computePaths);
  }, []);

  useEffect(() => {
    if (!paths.length || !svgRef.current) return undefined;
    registerGsap();

    const lines = Array.from(svgRef.current.querySelectorAll("path"));

    lines.forEach((line) => {
      const length = line.getTotalLength();
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = reducedMotion ? 0 : length;
    });

    if (reducedMotion) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 70%",
      once: true,
      onEnter: () => {
        gsap.to(lines, {
          strokeDashoffset: 0,
          duration: 1,
          ease: "power2.inOut",
          stagger: 0.15,
        });
      },
    });

    return () => trigger.kill();
  }, [paths, reducedMotion]);

  return (
    <section id="ledger" className="ledger section" data-bg="#ffffff">
      <div className="container">
        <p className="eyebrow">Nothing is assumed into confidence</p>
        <h2 className="ledger__headline">
          Every legal issue is mapped to the evidence that supports it —
          or to the gap that still needs filling.
        </h2>

        <div className="ledger__board" ref={containerRef}>
          <svg ref={svgRef} className="ledger__connectors" aria-hidden="true">
            {paths.map((path, index) => (
              <path key={index} d={path.d} />
            ))}
          </svg>

          <div className="ledger__column">
            <span className="ledger__column-label">Legal issues</span>
            {ISSUES.map((issue, index) => (
              <div
                key={issue}
                ref={(el) => (issueRefs.current[index] = el)}
                className={`ledger__node ${
                  index === 3 ? "ledger__node--needs-document" : ""
                }`}
              >
                {issue}
              </div>
            ))}
          </div>

          <div className="ledger__column ledger__column--evidence">
            <span className="ledger__column-label">Evidence</span>
            {EVIDENCE.map((evidence, index) => (
              <div
                key={evidence}
                ref={(el) => (evidenceRefs.current[index] = el)}
                className="ledger__node ledger__node--evidence"
              >
                {evidence}
              </div>
            ))}
          </div>
        </div>

        <div className="ledger__gap">
          <span className="ledger__gap-tag">NEEDS_DOCUMENT</span>
          <p className="ledger__gap-text">
            The job sheet does not record the fault. Upload the diagnostic
            report.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Ledger;
