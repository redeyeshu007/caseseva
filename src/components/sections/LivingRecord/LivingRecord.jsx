import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./LivingRecord.css";

const VERSIONS = Array.from({ length: 11 }, (_, i) => `v${i + 1}`);

const RECORD_BLOCKS = [
  { label: "PARTIES", agent: "PARTY IDENTIFICATION AGENT" },
  { label: "TIMELINE", agent: "FACT & TIMELINE AGENT" },
  { label: "EVIDENCE", agent: "EVIDENCE MAPPING AGENT" },
  { label: "LEGAL ISSUES", agent: "ISSUE FRAMING AGENT" },
];

/**
 * Act V — The Living Record. The record builds progressively and
 * only ever moves forward, mirrored by a version spine that advances
 * with scroll.
 */
function LivingRecord() {
  const sectionRef = useRef(null);
  const blockRefs = useRef([]);
  const [activeVersion, setActiveVersion] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    registerGsap();
    const blocks = blockRefs.current.filter(Boolean);

    if (reducedMotion) {
      gsap.set(blocks, { opacity: 1, x: 0 });
      setActiveVersion(VERSIONS.length - 1);
      return undefined;
    }

    gsap.set(blocks, { opacity: 0, x: -16 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 65%",
      end: "bottom 55%",
      onUpdate: (self) => {
        const progress = self.progress;

        blocks.forEach((block, index) => {
          const threshold = index / blocks.length;
          if (progress > threshold) {
            gsap.to(block, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" });
          }
        });

        setActiveVersion(Math.min(VERSIONS.length - 1, Math.floor(progress * VERSIONS.length)));
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <section
      id="living-record"
      className="living-record section"
      data-bg="#f3efe6"
      ref={sectionRef}
    >
      <div className="container living-record__grid">
        <ol className="living-record__spine" aria-label="Record versions">
          {VERSIONS.map((version, index) => (
            <li
              key={version}
              className={`living-record__version ${
                index === activeVersion ? "living-record__version--active" : ""
              }`}
            >
              {version}
            </li>
          ))}
        </ol>

        <div className="living-record__body">
          <p className="eyebrow">The case builds forward, never sideways</p>
          <h2 className="living-record__headline">
            You never explain it twice. The record remembers, and it only
            moves forward.
          </h2>

          <div className="living-record__blocks">
            {RECORD_BLOCKS.map((block, index) => (
              <div
                key={block.label}
                ref={(el) => (blockRefs.current[index] = el)}
                className="living-record__block"
              >
                <span className="living-record__block-label">{block.label}</span>
                <span className="living-record__block-agent">← {block.agent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LivingRecord;
