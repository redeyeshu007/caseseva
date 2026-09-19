import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "../../animations/gsapSetup";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import DepthText from "../ui/DepthText";
import CaseBlackBox from "./blackbox/CaseBlackBox";
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
            <span className="hero__line hero__line--lead">Your story</span>
            <span className="hero__line hero__line--connector">Becomes</span>
            <span className="hero__line hero__line--accent">
              <DepthText
                text="A case."
                layers={22}
                depth={1.4}
                faceColor="#d9b23a"
                depthColor="#7a5a08"
                tilt={4.5}
                pointerTracking
                smoothing={0.14}
                perspective={900}
                autoOrbit
                orbitSpeed={0.35}
                shadow={false}
              />
            </span>
          </h1>
          <p className="hero__support" data-hero-rest>
            <span className="hero__support-line">Tell us what happened.</span>
            <span className="hero__support-line hero__support-line--strong">
              We figure out what matters.
            </span>
          </p>
          <div className="hero__actions" data-hero-rest>
            <a href="#telling" className="hero__cta-primary">
              {/* Both labels share one grid cell, so the pill keeps the width of the longer one */}
              <span className="hero__cta-label">
                <span className="hero__cta-text hero__cta-text--rest">Know Your Case</span>
                <span className="hero__cta-text hero__cta-text--hover" aria-hidden="true">
                  Save the Time
                </span>
              </span>
              <span className="hero__cta-icons" aria-hidden="true">
                <svg
                  className="hero__cta-icon hero__cta-icon--rest"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <svg
                  className="hero__cta-icon hero__cta-icon--hover"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Right-hand visual: "The Black Box" (React Three Fiber). Self-contained and
            absolutely positioned inside this slot. */}
        <div className="hero__visual" aria-hidden="true">
          <CaseBlackBox />
        </div>
      </div>
    </section>
  );
}

export default Hero;
