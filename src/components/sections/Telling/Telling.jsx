import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./Telling.css";

const EVIDENCE = ["INVOICE", "PAYMENT", "VIDEO", "JOB SHEET", "CHAT", "POLICY"];

const STAGES = [
  "NOTHING FILED YET",
  "A COMPLAINT ALREADY EXISTS",
  "A CASE IS ALREADY RUNNING",
];

/**
 * Act III — The Telling. Evidence tags and the status ladder advance
 * as the visitor scrolls through the section, because that scroll
 * position represents the case itself progressing.
 */
function Telling() {
  const sectionRef = useRef(null);
  const tagRefs = useRef([]);
  const [activeStage, setActiveStage] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    registerGsap();
    const tags = tagRefs.current.filter(Boolean);

    if (reducedMotion) {
      gsap.set(tags, { opacity: 1, y: 0 });
      setActiveStage(STAGES.length - 1);
      return undefined;
    }

    gsap.set(tags, { opacity: 0, y: 24 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom 60%",
      onUpdate: (self) => {
        const progress = self.progress;

        tags.forEach((tag, index) => {
          const threshold = index / tags.length;
          if (progress > threshold) {
            gsap.to(tag, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
          }
        });

        if (progress < 0.15) setActiveStage(0);
        else if (progress < 0.55) setActiveStage(1);
        else setActiveStage(2);
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <section id="telling" className="telling section" data-bg="#ffffff" ref={sectionRef}>
      <div className="container telling__grid">
        <div className="telling__story">
          <p className="eyebrow">No legal expertise required</p>
          <blockquote className="telling__quote">
            “I bought a laptop for Rs. 78,999 and it keeps shutting down. They
            refuse to replace it.”
          </blockquote>

          <div className="telling__evidence">
            {EVIDENCE.map((item, index) => (
              <span
                key={item}
                ref={(el) => (tagRefs.current[index] = el)}
                className="telling__tag"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <ol className="telling__stages">
          {STAGES.map((stage, index) => (
            <li
              key={stage}
              className={`telling__stage ${
                index === activeStage ? "telling__stage--active" : ""
              } ${index < activeStage ? "telling__stage--past" : ""}`}
            >
              <span className="telling__stage-dot" aria-hidden="true" />
              {stage}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Telling;
