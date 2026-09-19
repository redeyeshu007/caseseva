import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../animations/gsapSetup";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * A fixed, full-viewport backdrop that sits behind every section.
 * Each section marks itself with a `data-bg="#hex"` attribute; as the
 * visitor scrolls, this component cross-fades the backdrop colour
 * from one section's colour to the next over the transition zone
 * between them, so the environment changes gradually instead of
 * cutting abruptly at a section boundary.
 */
function SceneBackdrop() {
  const backdropRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return undefined;

    registerGsap();

    const sections = Array.from(document.querySelectorAll("[data-bg]"));
    if (!sections.length) return undefined;

    gsap.set(backdrop, { backgroundColor: sections[0].dataset.bg });

    if (reducedMotion) {
      // Snap per-section instead of scrubbing a continuous fade.
      const triggers = sections.map((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => gsap.set(backdrop, { backgroundColor: section.dataset.bg }),
          onEnterBack: () => gsap.set(backdrop, { backgroundColor: section.dataset.bg }),
        })
      );
      return () => triggers.forEach((t) => t.kill());
    }

    const triggers = [];
    for (let i = 1; i < sections.length; i += 1) {
      const prev = sections[i - 1];
      const current = sections[i];

      triggers.push(
        ScrollTrigger.create({
          trigger: current,
          start: "top bottom",
          end: "top center",
          scrub: 0.6,
          onUpdate: (self) => {
            gsap.set(backdrop, {
              backgroundColor: gsap.utils.interpolate(
                prev.dataset.bg,
                current.dataset.bg,
                self.progress
              ),
            });
          },
        })
      );
    }

    return () => triggers.forEach((t) => t.kill());
  }, [reducedMotion]);

  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        willChange: "background-color",
      }}
    />
  );
}

export default SceneBackdrop;
