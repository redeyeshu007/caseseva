import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./Boundaries.css";

const STATEMENTS = [
  "We will not appear for you",
  "We will not promise a result",
  "We will not invent law",
  "We will not skip the advocate",
];

/**
 * Act XI — What We Will Not Do. Typography carries the entire
 * section; oxblood is used only as a restrained structural rule, not
 * decoration. Each statement resolves from blur because a boundary
 * is being stated, one at a time.
 */
function Boundaries() {
  const listRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    registerGsap();
    const items = Array.from(list.children);

    if (reducedMotion) {
      gsap.set(items, { opacity: 1, filter: "blur(0px)" });
      return undefined;
    }

    gsap.set(items, { opacity: 0.15, filter: "blur(6px)" });

    const trigger = ScrollTrigger.create({
      trigger: list,
      start: "top 75%",
      end: "bottom 55%",
      onUpdate: (self) => {
        const progress = self.progress;
        items.forEach((item, index) => {
          const threshold = index / items.length;
          if (progress > threshold) {
            gsap.to(item, {
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "power2.out",
              overwrite: true,
            });
          }
        });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <section id="boundaries" className="boundaries section" data-bg="#ffffff">
      <div className="container">
        <p className="eyebrow on-light">Standing</p>
        <ul ref={listRef} className="boundaries__list">
          {STATEMENTS.map((statement) => (
            <li key={statement} className="boundaries__statement">
              {statement.toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Boundaries;
