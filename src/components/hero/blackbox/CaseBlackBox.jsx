import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollTrigger, registerGsap } from "../../../animations/gsapSetup";
import { useInView } from "../../../hooks/useInView";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import CalloutsOverlay from "./CalloutsOverlay";
import "./CaseBlackBox.css";

const BlackBoxScene = lazy(() => import("./BlackBoxScene"));

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
 * THE BLACK BOX — the hero's right-hand visual.
 *
 * A raw story goes in, the structure locks together around a brass core,
 * and a case comes out. The mechanism is driven by scroll: the hero is
 * pinned for about one extra viewport of scrolling (ScrollTrigger, the
 * same GSAP setup the rest of the site uses) and its progress is written to
 * a ref that the R3F scene reads each frame, so scrolling never re-renders
 * React.
 *
 * It lives entirely inside `.hero__visual`. That slot is hidden by the
 * existing layout at ≤960px, so the scene is not mounted there at all.
 */
function CaseBlackBox() {
  const [rootRef, inView] = useInView({ threshold: 0.05 });
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 961px)");
  const isFull = useMediaQuery("(min-width: 1280px)");
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  const progressRef = useRef({ value: 0, target: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const calloutRegistry = useRef({});

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [frozen, setFrozen] = useState(false);

  const interactive = finePointer && !reducedMotion;

  // Give the preloader hand-off and first paint room before pulling in three.js
  useEffect(() => {
    if (!isDesktop) return undefined;
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, [isDesktop]);

  // Scroll → progress. Reduced motion skips the pin and shows the finished box.
  useLayoutEffect(() => {
    if (!isDesktop) return undefined;
    const root = rootRef.current;
    const section = root?.closest("section");
    if (!root || !section) return undefined;

    const progress = progressRef.current;

    if (reducedMotion) {
      progress.value = 1;
      progress.target = 1;
      return undefined;
    }

    registerGsap();
    progress.value = 0;
    progress.target = 0;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=110%",
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress.target = self.progress;
      },
    });

    return () => trigger.kill(true);
  }, [isDesktop, reducedMotion, rootRef]);

  // Very small pointer parallax (fine pointers only)
  useEffect(() => {
    if (!interactive || !isDesktop || !inView) return undefined;

    const onMove = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, isDesktop, inView]);

  // With reduced motion the scene is static: let it render for a moment, then stop the loop
  useEffect(() => {
    if (!reducedMotion || !ready) return undefined;
    const timer = setTimeout(() => setFrozen(true), 1500);
    return () => clearTimeout(timer);
  }, [reducedMotion, ready]);

  // Reduced motion: once settled, only redraw on demand (e.g. a resize)
  const frameloop = !inView ? "never" : reducedMotion && frozen ? "demand" : "always";

  return (
    <div ref={rootRef} className="blackbox">
      <div className={`blackbox__stage${ready ? " blackbox__stage--ready" : ""}`}>
        {isDesktop && mounted && (
          <Suspense fallback={null}>
            <BlackBoxScene
              progressRef={progressRef}
              pointerRef={pointerRef}
              tier={isFull ? "full" : "lite"}
              interactive={interactive}
              frameloop={frameloop}
              onReady={() => setReady(true)}
              calloutRegistry={calloutRegistry}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        )}
      </div>
      <CalloutsOverlay registry={calloutRegistry} />
    </div>
  );
}

export default CaseBlackBox;
