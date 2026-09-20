import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useInView } from "../../../hooks/useInView";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import AssemblyLeftContent from "./AssemblyLeftContent";
import { COMPLETE_ENTER, COMPLETE_LEAVE, stageForProgress } from "./assemblyTimeline";
import "./Assembly.css";

const AssemblyScene = lazy(() => import("./AssemblyScene"));

// The left side: one statement in two lines. "dissolved." is the accent word.
const STATEMENT = {
  primary: "A team is built for your case.",
  emphasis: "Then dissolved.",
  accent: "dissolved.",
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * Act IV — The Assembly. Dark-on-white section showing a legal team being formed for
 * one case: an empty scene, then the four roles form one by one around the case core
 * and the finished system holds while the scroll stays there.
 *
 * It is one scrubbed timeline. A single scroll progress value drives every part of the
 * 3D scene (see assemblyTimeline.js) and the left-side state rail: scrolling down
 * builds it, scrolling up takes it apart in reverse, and coming back to the section
 * replays it from the start. Nothing is remembered between visits. On desktop the
 * section is pinned for the length of the story; where the layout stacks (and could
 * be taller than the screen), or motion is reduced, the same progress runs over the
 * scene's own normal scroll. The 3D scene is lazy-loaded and only mounted while the
 * section is on screen.
 */
function Assembly() {
  const [wrapperRef, inView] = useInView({ threshold: 0.25 });
  const sceneRef = useRef(null);
  // Elements the reflection effect writes to each frame (the page-wide wave and sheen)
  const overlayRef = useRef({});
  const reducedMotion = useReducedMotion();
  const isFull = useMediaQuery("(min-width: 1201px)");
  const isMobile = useMediaQuery("(max-width: 860px)");

  const progressRef = useRef({ value: 0, target: 0 });
  // What the left side shows, derived from the same progress as the scene: the active stage
  // (0–3) and whether the system is in its completed state (the accent word settles with it)
  const [stage, setStage] = useState(0);
  const [resolved, setResolved] = useState(false);

  useLayoutEffect(() => {
    const section = wrapperRef.current;
    if (!section) return undefined;

    const progress = progressRef.current;
    overlayRef.current.section = section;
    overlayRef.current.scene = sceneRef.current;

    registerGsap();

    // The scroll position alone decides the state: progress goes straight into the scene, in
    // both directions, with no lock and no "already played" memory. The React state only
    // changes when the stage changes or the system enters/leaves its completed state.
    const update = (self) => {
      progress.target = self.progress;
      const next = stageForProgress(self.progress);
      setStage((prev) => (prev === next ? prev : next));
      setResolved((prev) => {
        if (self.progress >= COMPLETE_ENTER) return true;
        if (self.progress < COMPLETE_LEAVE) return false;
        return prev;
      });
    };

    const sceneEl = section.querySelector(".assembly__scene") || section;

    // Reduced motion: no pin and no travelling objects; the same progress still decides how
    // much of the system is shown, as simple fades
    if (reducedMotion) {
      const trigger = ScrollTrigger.create({
        trigger: sceneEl,
        start: "top 85%",
        end: "bottom 35%",
        onUpdate: update,
        onRefresh: update,
      });
      return () => trigger.kill();
    }

    const mm = gsap.matchMedia();

    mm.add("(min-width: 861px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top+=80",
        end: "+=260%",
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: update,
        onRefresh: update,
      });
      return () => trigger.kill(true);
    });

    // Stacked layout: the scene sits under the text, so its own scroll drives the story
    mm.add("(max-width: 860px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: sceneEl,
        start: "top 92%",
        end: "bottom 45%",
        onUpdate: update,
        onRefresh: update,
      });
      return () => trigger.kill();
    });

    return () => mm.revert();
  }, [reducedMotion, wrapperRef]);

  const frameloop = inView ? "always" : "never";
  const tier = isMobile ? "mobile" : isFull ? "full" : "lite";

  return (
    <section
      id="assembly"
      className="assembly section"
      data-bg="#ffffff"
      ref={wrapperRef}
    >
      <div className="container assembly__grid">
        <div className="assembly__copy">
          <AssemblyLeftContent statement={STATEMENT} stage={stage} resolved={resolved} />
        </div>

        <div ref={sceneRef} className="assembly__scene" aria-hidden="true">
          {inView && (
            <Suspense fallback={null}>
              <AssemblyScene
                progressRef={progressRef}
                tier={tier}
                frameloop={frameloop}
                reducedMotion={reducedMotion}
                overlay={overlayRef}
              />
            </Suspense>
          )}
        </div>
      </div>

      <div className="assembly__reflection" aria-hidden="true">
        <span
          ref={(el) => {
            overlayRef.current.wave = el;
          }}
          className="assembly__wave"
        />
        <span
          ref={(el) => {
            overlayRef.current.band = el;
          }}
          className="assembly__band"
        />
      </div>
    </section>
  );
}

export default Assembly;
