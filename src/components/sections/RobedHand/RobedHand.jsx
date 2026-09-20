import { useRef, useEffect } from "react";
import { registerGsap, gsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./RobedHand.css";

const REASONS = [
  {
    id: "01",
    title: "Strike a Ground",
    desc: "Remove a legal allegation the evidence does not justify.",
  },
  {
    id: "02",
    title: "Correct the Record",
    desc: "Fix a fact, a date, or an amount.",
  },
  {
    id: "03",
    title: "Demand a Document",
    desc: "Send the case back to the client for proof.",
  },
  {
    id: "04",
    title: "Re-Open the Analysis",
    desc: "Trigger a focused re-run of only affected analysis.",
  },
];

/**
 * Act IX — The Robed Hand / Human Advocate Capabilities.
 * Exact font style and structure from Handoverly_AI reference:
 * Cormorant Garamond serif headline, Inter body typography,
 * pure black background, and fully white text.
 */
function RobedHand() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const itemsRef = useRef([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    registerGsap();

    const items = itemsRef.current.filter(Boolean);

    if (reducedMotion) {
      gsap.set([headerRef.current, items], { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(headerRef.current, { opacity: 0, y: 24 });
    gsap.set(items, { opacity: 0, y: 32 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });

    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power2.out",
    }).to(
      items,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: "power2.out",
      },
      "-=0.4"
    );

    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  return (
    <section
      id="robes"
      ref={sectionRef}
      className="reasons-editorial section on-dark"
      data-bg="#000000"
      aria-label="The Robed Hand — Human Advocate Judgment"
    >
      <div className="container">
        {/* Editorial Header */}
        <div ref={headerRef} className="reasons-editorial__header">
          <div className="reasons-editorial__eyebrow">The Human Word, Last</div>
          <h2 className="reasons-editorial__title">
            AI prepares.{" "}
            <span className="reasons-editorial__title-highlight">
              An advocate decides.
            </span>
          </h2>
          <p className="reasons-editorial__subtitle">
            Technology assists. Human judgment prevails.
          </p>
        </div>

        {/* 2 on Left, 2 on Right (2x2 Grid) */}
        <div className="reasons-editorial__grid">
          {REASONS.map((reason, index) => (
            <div
              key={reason.id}
              ref={(el) => (itemsRef.current[index] = el)}
              className="reasons-editorial__item"
            >
              {/* Giant Watermark Numeral */}
              <div className="reasons-editorial__number">{reason.id}</div>

              {/* Interactive Horizontal Track & Dot */}
              <div className="reasons-editorial__line"></div>
              <div className="reasons-editorial__dot"></div>

              {/* Content Body */}
              <div className="reasons-editorial__content">
                <h3 className="reasons-editorial__item-title">{reason.title}</h3>
                <p className="reasons-editorial__item-desc">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RobedHand;
