import { lazy, Suspense, useEffect, useState } from "react";

// The two WebGL scenes (and their procedural textures) load only when the section is near
const CrossfireCourtroom = lazy(() => import("./CrossfireCourtroom"));
const CrossfireScene = lazy(() => import("./CrossfireScene"));

/**
 * The procedural environment layered into the section:
 *  - backdrop: an out-of-focus Indian courtroom behind the text
 *  - scene:    the desk, Constitution, case files and test point in front
 * Both are decorative (aria-hidden); every claim and objection stays real text.
 */
function CrossfireStage({ sectionRef, stateRef, layoutRef }) {
  const [near, setNear] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    setCompact(window.matchMedia("(max-width: 640px)").matches);
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef]);

  if (!near) return null;

  return (
    <Suspense fallback={null}>
      <div className="cf-backdrop" aria-hidden="true">
        <CrossfireCourtroom stateRef={stateRef} compact={compact} />
      </div>
      <div className="cf-scene" aria-hidden="true">
        <CrossfireScene stateRef={stateRef} layoutRef={layoutRef} />
      </div>
    </Suspense>
  );
}

export default CrossfireStage;
