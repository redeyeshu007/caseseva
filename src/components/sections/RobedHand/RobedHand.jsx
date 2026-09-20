import { useRef, useEffect } from "react";
import { registerGsap, gsap } from "../../../animations/gsapSetup";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import "./RobedHand.css";

const CAPABILITIES = [
  {
    num: "01",
    tag: "CLARIFY",
    title: "Strike a Ground",
    desc: "Remove a legal allegation the evidence does not justify.",
  },
  {
    num: "02",
    tag: "VERIFY",
    title: "Correct the Record",
    desc: "Fix a fact, a date, or an amount.",
  },
  {
    num: "03",
    tag: "STRENGTHEN",
    title: "Demand a Document",
    desc: "Send the case back to the client for proof.",
  },
  {
    num: "04",
    tag: "REASSESS",
    title: "Re-Open the Analysis",
    desc: "Trigger a focused re-run of only affected analysis.",
  },
];

/**
 * Act IX — The Robed Hand / Human Advocate Capabilities.
 * Clean, high-end editorial grid featuring watermark numerals,
 * precision rules, and authoritative human judgment typography.
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
        start: "top 72%",
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
        stagger: 0.12,
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
      className="robes-section section"
      data-bg="#ffffff"
      aria-label="The Robed Hand — Human Advocate Judgment"
    >
      <div className="container robes-container">
        {/* Editorial Section Header */}
        <header ref={headerRef} className="robes-header">
          <p className="eyebrow robes-eyebrow">The Human Word, Last</p>
          <h2 className="robes-headline">
            <span className="robes-headline__ai">AI prepares. </span>
            <span className="robes-headline__human">An advocate decides.</span>
          </h2>
          <p className="robes-subhead">
            Technology assists. Human judgment prevails.
          </p>
        </header>

        {/* Capabilities Grid with Watermark Numerals & Baseline Rules */}
        <div className="robes-grid" role="list">
          {CAPABILITIES.map((item, index) => (
            <article
              key={item.num}
              ref={(el) => (itemsRef.current[index] = el)}
              className="robes-card"
              role="listitem"
            >
              {/* Top Track Rule with Dynamic Brass Accent */}
              <div className="robes-card__track" aria-hidden="true">
                <div className="robes-card__track-line" />
                <div className="robes-card__track-accent" />
              </div>

              {/* Watermark Large Ghost Numeral */}
              <div className="robes-card__num-wrap">
                <span className="robes-card__num">{item.num}</span>
                <span className="robes-card__tag">{item.tag}</span>
              </div>

              {/* Content Block */}
              <div className="robes-card__body">
                <h3 className="robes-card__title">{item.title}</h3>
                <p className="robes-card__desc">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RobedHand;
