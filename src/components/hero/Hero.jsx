import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "../../animations/gsapSetup";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./Hero.css";

/**
 * Act I — The Threshold. The right-hand columns of the 12-column grid
 * are deliberately left empty: the realistic Justice / courtroom
 * visual will be dropped into .hero__visual later.
 *
 * Motion: each headline line rises and fades in sequentially, then
 * the supporting copy and actions follow. No blur, no scaling.
 */
function Hero() {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return undefined;

    registerGsap();

    const ctx = gsap.context(() => {
      const eyebrow = root.querySelector("[data-hero-eyebrow]");
      const lines = root.querySelectorAll(".hero__line");
      const rest = root.querySelectorAll("[data-hero-rest]");

      gsap.set(eyebrow, { opacity: 0, y: 10 });
      gsap.set(lines, { opacity: 0, y: 18 });
      gsap.set(rest, { opacity: 0, y: 14 });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0)
        .to(lines, { opacity: 1, y: 0, duration: 1, stagger: 0.16 }, 0.15)
        .to(rest, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.85);
    }, root);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="threshold"
      className="hero section"
      data-bg="#ffffff"
      ref={rootRef}
    >
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow" data-hero-eyebrow>
            A case is not a search result
          </p>
          <h1 className="hero__headline">
            <span className="hero__line hero__line--light">You tell it once.</span>
            <span className="hero__line hero__line--lead">We build the case</span>
            <span className="hero__line hero__line--italic">around it.</span>
          </h1>
          <p className="hero__support" data-hero-rest>
            No Act to choose. No Section to type. No court to guess. Describe
            what happened, upload whatever you have, and a legal team is
            assembled for your case alone — then made to argue against itself
            before a verified advocate ever signs it.
          </p>
          <div className="hero__actions" data-hero-rest>
            <a href="#telling" className="hero__cta-primary">
              Tell It Once{" "}
              <span className="hero__cta-arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a href="#assembly" className="hero__cta-secondary">
              Watch a Case Get Built
            </a>
          </div>
        </div>

        {/* Reserved for the final realistic Justice / courtroom visual.
            Intentionally empty — do not fill with a placeholder. */}
        <div className="hero__visual" aria-hidden="true" />
      </div>
    </section>
  );
}

export default Hero;
